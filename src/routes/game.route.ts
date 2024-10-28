import { WebSocket } from 'ws';
import DataService from '../services/data.service';
import GameController from '../controllers/game.controller';
import {
  AddShipsRequestData,
  CommonAction,
  CreateGameResponseData,
  StartGameResponseData,
  TurnResponseData,
} from '../types/api.types';
import { GameBoard } from '../services/gameboard.types';
import { Message } from '../types/message';

export const attackRoute = (ws: WebSocket, message: CommonAction): void => {};

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

    const playersOrder = DataService.getPlayerOrder();
    game.gameboards.forEach(({ ships, currentPlayerIndex, ws }) => {
      const startData: StartGameResponseData = {
        ships,
        currentPlayerIndex,
      };
      GameController.startGame(ws, startData);

      const turnData: TurnResponseData = {
        currentPlayer: game.gameboards[playersOrder].currentPlayerIndex,
      };
      GameController.turn(ws, turnData);
    });
  }
};
