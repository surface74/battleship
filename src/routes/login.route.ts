import { WebSocket } from 'ws';
import { LoginRequest } from '../types/api.types';
import DataService from '../services/data.service';

export const LoginRoute = (ws: WebSocket, message: LoginRequest): void => {
  const dataService = DataService.getInstance();

  if (dataService.LoginUser(message)) {
    // send LoginResponse
    // create a room
    // add logged user to the room
    // send UpdateRoomResponse
    // send UpdateWinnersResponse
  }

  console.log(message);
};
