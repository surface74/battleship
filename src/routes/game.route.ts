import { WebSocket } from 'ws';
import DataService from '../services/data.service';
import GameController from '../controllers/game.controller';

export const createGameRoute = (ws: WebSocket) => {
  const sockets: WebSocket[] = DataService.getRoomUsersSockets(ws);
  // DataService.createGame(sockets);

  GameController.createGame(sockets);
};
