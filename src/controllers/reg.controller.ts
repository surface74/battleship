import { WebSocket } from 'ws';
import { ApiMessageType, RegResponse, RegResponseData } from '../types/api.types';

class RegController {
  public send(ws: WebSocket, data: RegResponseData): void {
    const response: RegResponse = {
      type: ApiMessageType.Reg,
      data,
      id: 0,
    };

    const responseString = JSON.stringify({ ...response, data: JSON.stringify(response.data) });

    ws.send(responseString, (err?: Error): void => {
      if (err) console.error(err.message);
    });
  }
}

export default new RegController();
