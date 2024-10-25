import { WebSocket } from 'ws';

import { ApiMessageType, CommonAction, LoginRequest } from '../types/api.types';
import { LoginRoute } from './login.route';
import { Message } from '../types/message';

export const routes = (ws: WebSocket, data: Buffer): void => {
  const message = JSON.parse(data.toString()) as CommonAction;

  const { type: actionType } = message;

  switch (actionType) {
    case ApiMessageType.Reg:
      LoginRoute(ws, message as LoginRequest);
      break;
    case ApiMessageType.CreateRoom:
      break;
    case ApiMessageType.AddUserToRoom:
      break;
    case ApiMessageType.AddShips:
      break;
    case ApiMessageType.Attack:
      break;
    case ApiMessageType.RandomAttack:
      break;

    default:
      console.warn('%s: %s', Message.UnknownAction, data);
      break;
  }

  console.log('received: %s', data);
};
