import { WebSocket } from 'ws';
import {
  ApiMessageType,
  AttackResponse,
  AttackResponseData,
  CreateGameResponse,
  CreateGameResponseData,
  FinishResponse,
  FinishResponseData,
  StartGameResponse,
  StartGameResponseData,
  TurnResponse,
  TurnResponseData,
  Winner,
  WinnersResponse,
} from '../types/api.types';

class GameController {
  public updateWinner(ws: WebSocket, winners: Winner[]): void {
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

  public finishGame(ws: WebSocket, data: FinishResponseData): void {
    const response: FinishResponse = {
      type: ApiMessageType.Finish,
      data,
      id: 0,
    };

    const responseString = JSON.stringify({ ...response, data: JSON.stringify(response.data) });

    ws.send(responseString, (err?: Error): void => {
      if (err) console.error(err.message);
    });
  }

  public sendAttackResult(ws: WebSocket, data: AttackResponseData): void {
    const response: AttackResponse = {
      type: ApiMessageType.Attack,
      data,
      id: 0,
    };

    const responseString = JSON.stringify({ ...response, data: JSON.stringify(response.data) });

    ws.send(responseString, (err?: Error): void => {
      if (err) console.error(err.message);
    });
  }

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
