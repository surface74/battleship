import { Ship } from '../types/api.types';

export interface GameBoard {
  ships: Ship[];
  currentPlayerIndex: number | string;
}
