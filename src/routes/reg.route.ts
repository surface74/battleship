import { WebSocket } from 'ws';
import { ApiMessageType, CommonAction, RegRequest, RegResponse } from '../types/api.types';
import DataService from '../services/data.service';
import RegController from '../controllers/reg.controller';
import RoomController from '../controllers/room.controller';

export const regRoute = (ws: WebSocket, message: CommonAction): void => {
  console.log('enter regRoute');

  type DataType = Pick<RegRequest, 'data'>;
  const request: RegRequest = {
    ...message,
    data: JSON.parse(message.data as string) as DataType['data'],
  } as RegRequest;

  const { name, password } = request.data;
  const { error, errorText } = DataService.regUser(name, password);

  const userResponse: RegResponse = {
    type: ApiMessageType.Reg,
    data: { name, password, error, errorText },
    id: message.id,
  };
  RegController.regUser(ws, userResponse);

  // const rooms: RoomState[] = DataService.getRooms();
  // RoomController.updateRoom(ws, rooms);

  // send UpdateWinnersResponse
};
