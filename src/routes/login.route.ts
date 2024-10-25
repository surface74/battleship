import { WebSocket } from 'ws';
import { LoginRequest } from '../types/api.types';

export const LoginRoute = (ws: WebSocket, message: LoginRequest) => {
  console.log(message);
};
