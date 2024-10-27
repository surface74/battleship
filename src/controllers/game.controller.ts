import { WebSocket } from 'ws';
import { ApiMessageType, CreateGameResponseData } from '../types/api.types';

class GameController {
  public createGame(wcPlayers: WebSocket[], data: CreateGameResponseData[]): void {
    const response: CreateGameResponseData = {
      type: ApiMessageType.CreateGame,
      data,
      id: 0,
    };

    const responseString = JSON.stringify({ ...response, data: JSON.stringify(response.data) });

    wcPlayers.forEach((ws: WebSocket): void =>
      ws.send(responseString, (err?: Error): void => {
        if (err) console.error(err.message);
      })
    );
  }
}

export default new GameController();
