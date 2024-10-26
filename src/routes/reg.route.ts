import { WebSocket } from 'ws';
import {
  ApiMessageType,
  CommonAction,
  RegRequestData,
  RegResponse,
  UpdateRoomResponseData,
  UpdateRoomResponse,
} from '../types/api.types';
import DataService from '../services/data.service';
import RegController from '../controllers/reg.controller';
import RoomController from '../controllers/room.controller';

export const regRoute = (ws: WebSocket, message: CommonAction): void => {
  const messageData = JSON.parse(message.data as string) as RegRequestData;
  const { name, password } = messageData;
  const { error, errorText } = DataService.regUser(name, password);

  const userResponse: RegResponse = {
    type: ApiMessageType.Reg,
    data: { name, password, error, errorText },
    id: message.id,
  };
  RegController.regUser(ws, userResponse);

  const rooms: UpdateRoomResponseData[] = DataService.getRooms();
  const roomResponse: UpdateRoomResponse = {
    type: ApiMessageType.UpdateRoom,
    data: rooms,
    id: message.id,
  };
  RoomController.updateRoom(ws, roomResponse);

  // const wins =
  // send UpdateWinnersResponse
};
