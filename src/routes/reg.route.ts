import { WebSocket } from 'ws';
import {
  CommonAction,
  RegRequestData,
  UpdateRoomResponseData,
  RegResponseData,
} from '../types/api.types';
import DataService from '../services/data.service';
import RegController from '../controllers/reg.controller';
import RoomController from '../controllers/room.controller';
import winnerController from '../controllers/winner.controller';

export const regRoute = (ws: WebSocket, message: CommonAction): void => {
  const messageData = JSON.parse(message.data as string) as RegRequestData;
  const { name, password } = messageData;
  const { error, errorText } = DataService.regUser(name, password);

  const userData: RegResponseData = { name, password, error, errorText };
  RegController.send(ws, userData);

  const rooms: UpdateRoomResponseData[] = DataService.getRooms();
  RoomController.send(ws, rooms);

  const winners = DataService.getWinners();
  winnerController.send(ws, winners);
};
