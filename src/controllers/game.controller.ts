import { WebSocket } from 'ws';
import {
  ApiMessageType,
  CreateGameResponse,
  CreateGameResponseData,
  StartGameResponse,
  StartGameResponseData,
  TurnResponse,
  TurnResponseData,
} from '../types/api.types';

class GameController {
  public turn(ws: WebSocket, data: TurnResponseData): void {
    const response: TurnResponse = {
      type: ApiMessageType.Turn,
      data,
      id: 0,
    };

    const responseString = JSON.stringify({ ...response, data: JSON.stringify(response.data) });

    ws.send(responseString, (err?: Error): void => {
      if (err) console.error(err.message);
    });
  }

  public startGame(ws: WebSocket, data: StartGameResponseData): void {
    const response: StartGameResponse = {
      type: ApiMessageType.StartGame,
      data,
      id: 0,
    };

    const responseString = JSON.stringify({ ...response, data: JSON.stringify(response.data) });

    ws.send(responseString, (err?: Error): void => {
      if (err) console.error(err.message);
    });
  }

  public createGame(ws: WebSocket, data: CreateGameResponseData): void {
    const response: CreateGameResponse = {
      type: ApiMessageType.CreateGame,
      data,
      id: 0,
    };

    const responseString = JSON.stringify({ ...response, data: JSON.stringify(response.data) });

    ws.send(responseString, (err?: Error): void => {
      if (err) console.error(err.message);
    });
  }
}

export default new GameController();
