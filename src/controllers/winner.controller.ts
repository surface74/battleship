import { WebSocket } from 'ws';
import { ApiMessageType, Winner, WinnersResponse } from '../types/api.types';

class WinnerController {
  public send(ws: WebSocket, winners: Winner[]): void {
    const response: WinnersResponse = {
      type: ApiMessageType.UpdateWinners,
      data: winners,
      id: 0,
    };
    const responseString = JSON.stringify({ ...response, data: JSON.stringify(response.data) });

    ws.send(responseString, (err?: Error): void => {
      if (err) console.error(err.message);
    });
  }
}

export default new WinnerController();
