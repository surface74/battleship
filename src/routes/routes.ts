import { WebSocket } from 'ws';

import {
  ApiMessageType,
  AttackRequestData,
  CommonAction,
  RandomAttackRequestData,
} from '../types/api.types';
import { regRoute } from './reg.route';
import { Message } from '../types/message';
import { createRoomRoute, addUserToRoomRoute } from './room.route';
import { addShipsRoute, attackRoute, randomAttackRoute } from './game.route';

export const routes = (ws: WebSocket, data: Buffer): void => {
  const message = JSON.parse(data.toString()) as CommonAction;
  const { type: actionType } = message;

  switch (actionType) {
    case ApiMessageType.Reg:
      regRoute(ws, message);
      break;
    case ApiMessageType.CreateRoom:
      createRoomRoute(ws);
      break;
    case ApiMessageType.AddUserToRoom:
      addUserToRoomRoute(ws, message);
      break;
    case ApiMessageType.AddShips:
      addShipsRoute(ws, message);
      break;
    case ApiMessageType.Attack:
      attackRoute(ws, JSON.parse(message.data as string) as AttackRequestData);
      break;
    case ApiMessageType.RandomAttack:
      randomAttackRoute(ws, JSON.parse(message.data as string) as RandomAttackRequestData);
      break;

    default:
      console.warn('%s: %s', Message.UnknownAction, data);
      break;
  }
};
