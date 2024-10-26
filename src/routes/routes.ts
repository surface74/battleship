import { WebSocket } from 'ws';

import { ApiMessageType, CommonAction } from '../types/api.types';
import { regRoute } from './reg.route';
import { Message } from '../types/message';

export const routes = (ws: WebSocket, data: Buffer): void => {
  const message = JSON.parse(data.toString()) as CommonAction;
  const { type: actionType } = message;
  console.log('message: ', message);

  switch (actionType) {
    case ApiMessageType.Reg:
      regRoute(ws, message);
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
