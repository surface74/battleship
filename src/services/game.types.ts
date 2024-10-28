import { WebSocket } from 'ws';
import { Ship } from '../types/api.types';

export interface Game {
  gameId: string;
  gameboards: GameBoard[];
}

export interface GameBoard {
  ships: Ship[];
  currentPlayerIndex: number | string;
  ws: WebSocket;
}

export interface BoardResult {
  x: number;
  y: number;
  state: AttackResult;
}
