import { WebSocket } from 'ws';
import { UpdateRoomResponse } from '../types/api.types';

class RoomController {
  public updateRoom(ws: WebSocket, response: UpdateRoomResponse): void {
    const responseString = JSON.stringify({ ...response, data: JSON.stringify(response.data) });

    ws.send(responseString, (err?: Error): void => {
      if (err) console.error(err.message);
    });
  }
}

export default new RoomController();
