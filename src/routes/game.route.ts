import { WebSocket } from 'ws';
import DataService from '../services/data.service';
import GameController from '../controllers/game.controller';
import {
  AddShipsRequestData,
  AttackRequestData,
  AttackResponseData,
  CommonAction,
  CreateGameResponseData,
  ShipState,
  StartGameResponseData,
  TurnResponseData,
} from '../types/api.types';
import { GameBoard } from '../services/game.types';
import { Message } from '../types/message';

export const attackRoute = (ws: WebSocket, message: CommonAction): void => {
  const messageData = JSON.parse(message.data as string) as AttackRequestData;
  const { indexPlayer } = messageData;
  const [sockets, results, nextPlayerId] = DataService.getAttackResult(messageData);

  results.forEach((result: ShipState) => {
    const { x, y, state: status } = result;
    const response: AttackResponseData = {
      position: { x, y },
      currentPlayer: indexPlayer,
      status,
    };

    sockets.forEach((ws: WebSocket) => GameController.sendAttackResult(ws, response));
  });

  const turnData: TurnResponseData = {
    currentPlayer: nextPlayerId,
  };
  GameController.turn(ws, turnData);
};

export const randomAttackRoute = (ws: WebSocket, message: CommonAction): void => {};

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
