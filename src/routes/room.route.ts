import { WebSocket } from 'ws';

import DataService from '../services/data.service';
import RoomController from '../controllers/room.controller';
import { AddUserToRoomRequestData, CommonAction, User } from '../types/api.types';

export const createRoomRoute = (ws: WebSocket): void => {
  const room = DataService.createRoom();
  DataService.addUserToRoom(ws, room.roomId.toString());

  updateRoomsForAll();
};

export const addUserToRoomRoute = (ws: WebSocket, message: CommonAction): void => {
  const messageData = JSON.parse(message.data as string) as AddUserToRoomRequestData;
  DataService.addUserToRoom(ws, messageData.indexRoom.toString());

  updateRoomsForAll();
};

export const updateRoomsForAll = (): void => {
  const activeUsers: User[] = DataService.getActiveUsers();
  const rooms = DataService.getAvailableRooms();
  activeUsers.forEach((user: User): void => {
    RoomController.updateRoom(user.ws, rooms);
  });
};
