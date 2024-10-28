import { WebSocket } from 'ws';

import DataService from '../services/data.service';
import RoomController from '../controllers/room.controller';
import {
  AddUserToRoomRequestData,
  CommonAction,
  CreateGameResponseData,
  User,
} from '../types/api.types';
import GameController from '../controllers/game.controller';
import { Message } from '../types/message';
import { Game, GameBoard } from '../services/gameboard.types';

export const createRoomRoute = (ws: WebSocket): void => {
  const room = DataService.createRoom();
  DataService.addUserToRoom(ws, room.roomId.toString());

  updateRoomsForAll();
};

export const addUserToRoomRoute = (ws: WebSocket, message: CommonAction): void => {
  const messageData = JSON.parse(message.data as string) as AddUserToRoomRequestData;
  DataService.addUserToRoom(ws, messageData.indexRoom.toString());

  updateRoomsForAll();

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

export const updateRoomsForAll = (): void => {
  const activeUsers: User[] = DataService.getActiveUsers();
  const rooms = DataService.getAvailableRooms();
  activeUsers.forEach((user: User): void => {
    RoomController.updateRoom(user.ws, rooms);
  });
};
