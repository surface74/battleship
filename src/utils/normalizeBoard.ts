import { AttackResult, Ship, ShipState } from '../types/api.types';

export const addShipState = (ship: Ship): ShipState[] => {
  const { position, length, direction } = ship;
  const { x, y } = position;

  const shipState: ShipState[] = new Array<ShipState>();
  for (let i = 0; i < length; i++) {
    if (direction) {
      shipState.push(getShipState(x, y + i));
    } else {
      shipState.push(getShipState(x + i, y));
    }
  }

  return shipState;
};

const getShipState = (x: number, y: number): ShipState => {
  return {
    x,
    y,
    state: AttackResult.None,
  };
};
