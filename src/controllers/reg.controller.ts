import { WebSocket } from 'ws';
import { RegResponse } from '../types/api.types';

class RegController {
  public regUser(ws: WebSocket, response: RegResponse): void {
    const responseString = JSON.stringify({ ...response, data: JSON.stringify(response.data) });

    ws.send(responseString, (err?: Error): void => {
      if (err) console.error(err.message);
    });
  }
}

export default new RegController();
