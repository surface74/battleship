import { WebSocket } from 'ws';
import { ApiMessageType, UpdateRoomResponse, UpdateRoomResponseData } from '../types/api.types';

class RoomController {
  public send(ws: WebSocket, rooms: UpdateRoomResponseData[]): void {
    const response: UpdateRoomResponse = {
      type: ApiMessageType.UpdateRoom,
      data: rooms,
      id: 0,
    };

    const responseString = JSON.stringify({ ...response, data: JSON.stringify(response.data) });

    ws.send(responseString, (err?: Error): void => {
      if (err) console.error(err.message);
    });
  }
}

export default new RoomController();
