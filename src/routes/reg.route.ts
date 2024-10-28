import { WebSocket } from 'ws';
import { CommonAction, RegRequestData, Room, RegResponseData, User } from '../types/api.types';
import DataService from '../services/data.service';
import RegController from '../controllers/reg.controller';
import RoomController from '../controllers/room.controller';
import GameController from '../controllers/game.controller';

export const regRoute = (ws: WebSocket, message: CommonAction): void => {
  const messageData = JSON.parse(message.data as string) as RegRequestData;
  const { name, password } = messageData;
  const { error, errorText } = DataService.regUser(ws, name, password);
  if (!error) {
    const userData: RegResponseData = { name, password, error, errorText };
    RegController.send(ws, userData);

    const activeUsers: User[] = DataService.getActiveUsers();
    const rooms: Room[] = DataService.getAvailableRooms();
    const winners = DataService.getWinners();

    activeUsers.forEach((user: User): void => {
      RoomController.updateRoom(user.ws, rooms);
      GameController.updateWinner(user.ws, winners);
    });
  } else {
    console.error(errorText);
  }
};
