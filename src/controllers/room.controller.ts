import { WebSocket } from 'ws';
import { ApiMessageType, RoomState, UpdateRoomResponse } from '../types/api.types';

class RoomController {
  public updateRoom = (ws: WebSocket, rooms: RoomState[]): void => {
    const response: UpdateRoomResponse = {
      type: ApiMessageType.UpdateRoom,
      data: [...rooms],
    };
    ws.send(JSON.stringify(response), (err?: Error): void => {
      if (err) console.error(err.message);
    });
  };
}

export default new RoomController();
