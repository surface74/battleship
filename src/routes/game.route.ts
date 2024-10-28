import { WebSocket } from 'ws';
import DataService from '../services/data.service';
import GameController from '../controllers/game.controller';
import {
  AddShipsRequestData,
  AttackRequestData,
  AttackResponseData,
  CommonAction,
  CreateGameResponseData,
  FinishResponseData,
  RandomAttackRequestData,
  ShipState,
  StartGameResponseData,
  TurnResponseData,
  User,
} from '../types/api.types';
import { GameBoard } from '../services/game.types';
import { Message } from '../types/message';
import { random } from '../utils/random';

export const attackRoute = (ws: WebSocket, messageData: AttackRequestData): void => {
  const { indexPlayer } = messageData;
  const [sockets, results, nextPlayerId, isFinish] = DataService.getAttackResult(messageData);

  results.forEach((result: ShipState) => {
    const { x, y, state: status } = result;
    const response: AttackResponseData = {
      position: { x, y },
      currentPlayer: indexPlayer,
      status,
    };

    sockets.forEach((ws: WebSocket) => GameController.sendAttackResult(ws, response));
  });

  if (isFinish) {
    finishGame(sockets, indexPlayer);
  } else {
    const turnData: TurnResponseData = {
      currentPlayer: nextPlayerId,
    };
    sockets.forEach((ws: WebSocket): void => GameController.turn(ws, turnData));
  }
};

const finishGame = (sockets: WebSocket[], playerId: string | number): void => {
  const user = DataService.getUserById(playerId);

  if (user) {
    DataService.increaseWinCount(user.uuid);

    const finishData: FinishResponseData = { winPlayer: user.uuid };

    sockets.forEach((ws: WebSocket) => {
      GameController.finishGame(ws, finishData);
    });
  }

  updateWinners();
};

const updateWinners = () => {
  const activeUsers: User[] = DataService.getActiveUsers();
  const winners = DataService.getWinners();

  activeUsers.forEach((user: User): void => GameController.updateWinner(user.ws, winners));
};

export const randomAttackRoute = (ws: WebSocket, data: RandomAttackRequestData): void => {
  const x = random(0, 9);
  const y = random(0, 9);

  const attackRequest: AttackRequestData = { ...data, x, y };

  attackRoute(ws, attackRequest);
};

export const createGameRoute = (ws: WebSocket) => {
  const game = DataService.createGame(ws);
  if (game) {
    game.gameboards.forEach((board: GameBoard) => {
      const data: CreateGameResponseData = {
        idGame: game.gameId,
        idPlayer: board.currentPlayerIndex,
      };
      GameController.createGame(board.ws, data);
    });
  } else {
    console.warn(Message.CantCreateRoom);
  }
};

export const addShipsRoute = (ws: WebSocket, message: CommonAction): void => {
  const messageData = JSON.parse(message.data as string) as AddShipsRequestData;

  const isGameReadyToStart = DataService.addShipsToGame(messageData);

  if (isGameReadyToStart) {
    const game = DataService.getGameBySocket(ws);
    if (!game) {
      console.warn(Message.CantStartGame);
      return;
    }

    game.gameboards.forEach(({ ships, currentPlayerIndex, ws }: GameBoard) => {
      const startData: StartGameResponseData = {
        ships,
        currentPlayerIndex,
      };
      GameController.startGame(ws, startData);

      const playersOrder = DataService.getPlayerOrder(game);
      const turnData: TurnResponseData = {
        currentPlayer: game.gameboards[playersOrder].currentPlayerIndex,
      };
      GameController.turn(ws, turnData);
    });
  }
};
