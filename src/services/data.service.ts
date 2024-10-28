import { randomUUID } from 'crypto';
import {
  AddShipsRequestData,
  AttackRequestData,
  AttackResult,
  Room,
  RoomUser,
  Ship,
  ShipState,
  User,
  Winner,
} from '../types/api.types';
import { CustomError } from '../types/cusom-error.types';

import WebSocket from 'ws';
import { BoardResult, Game, GameBoard } from './game.types';
import { Message } from '../types/message';

class DataService {
  static instance: DataService = new DataService();

  private userStorage: User[] = new Array<User>();
  private roomStorage: Room[] = new Array<Room>();
  private gameStorage: Game[] = new Array<Game>();

  private constructor() {
    if (!DataService.instance) DataService.instance = this;
  }

  public static getInstance(): DataService {
    return DataService.instance;
  }

  public increaseWinCount(playerId: string) {
    const user = this.getUserById(playerId);
    if (user) {
      user.wins += 1;
    }
  }

  public getUserById(id: string | number): User | undefined {
    const user = this.userStorage.find((user: User) => user.uuid === id);
    return user;
  }

  public getAttackResult(
    data: AttackRequestData
  ): [WebSocket[], ShipState[], string | number, boolean] {
    const { gameId, x, y, indexPlayer } = data;

    let isFinish = false;

    const game = this.gameStorage.filter(
      (game: Game): boolean => game.gameId === gameId.toString()
    )[0];

    const order = this.getPlayerOrder(game);
    if (game.gameboards[order].currentPlayerIndex !== indexPlayer) {
      return [new Array<WebSocket>(), new Array<ShipState>(), '', false];
    }

    const sockets: WebSocket[] = game.gameboards.map((board: GameBoard): WebSocket => board.ws);

    const attackedBoard = game.gameboards.filter(
      (board: GameBoard): boolean => board.currentPlayerIndex !== indexPlayer
    )[0];

    const results: ShipState[] = this.getAttackStatus(attackedBoard, x, y);

    const isNeedCheckFinish = results.some(
      (shipState: ShipState) => shipState.state == AttackResult.Killed
    );
    if (isNeedCheckFinish) {
      isFinish = this.isGameFinish(attackedBoard);
    }

    const isChangePlayerOrder = results.length === 1 && results[0].state == AttackResult.Miss;

    if (isChangePlayerOrder) {
      game.order = !game.order;
    }

    const nextPlayerId = game.gameboards[this.getPlayerOrder(game)].currentPlayerIndex;
    return [sockets, results, nextPlayerId, isFinish];
  }

  getAttackStatus(board: GameBoard, x: number, y: number): ShipState[] {
    let attackedShip: Ship | undefined;
    let attackResult = AttackResult.Miss;
    const results = new Array<BoardResult>();

    board.ships.forEach((ship: Ship) => {
      for (const shipState of ship.shipStates) {
        if (shipState.x === x && shipState.y === y) {
          attackedShip = ship;
          if (shipState.state === AttackResult.None) {
            shipState.state = AttackResult.Shot;
            attackResult = AttackResult.Shot;
          } else {
            attackResult = shipState.state;
          }

          return;
        }
      }
    });

    if (attackedShip && attackResult == <AttackResult>AttackResult.Shot) {
      const isShipKilled = attackedShip.shipStates.every(
        (shipState: ShipState) => shipState.state === AttackResult.Shot
      );

      if (isShipKilled) {
        attackedShip.shipStates.forEach((shipState: ShipState): void => {
          shipState.state = AttackResult.Killed;
          results.push({ ...shipState });
          results.push(...this.getEmptyPlaceAround(attackedShip));
        });
      } else {
        results.push({ x, y, state: AttackResult.Shot });
      }
    } else {
      results.push({ x, y, state: attackResult });
    }

    return results;
  }

  isGameFinish(board: GameBoard): boolean {
    const isFinish = board.ships.every(
      (ship: Ship): boolean => ship.shipStates[0].state === AttackResult.Killed
    );

    return isFinish;
  }

  getEmptyPlaceAround(attackedShip: Ship | undefined): ShipState[] {
    if (!attackedShip) {
      return new Array<ShipState>();
    }

    const states = new Array<ShipState>();

    const { position, direction, length } = attackedShip;
    const { x: posX, y: posY } = position;

    if (direction) {
      for (let y = posY - 1; y < posY + length + 1; y++) {
        states.push({ x: posX - 1, y, state: AttackResult.Miss });
        states.push({ x: posX + 1, y, state: AttackResult.Miss });
      }
      states.push({ x: posX, y: posY - 1, state: AttackResult.Miss });
      states.push({ x: posX, y: posY + length, state: AttackResult.Miss });
    } else {
      for (let x = posX - 1; x < posX + length + 1; x++) {
        states.push({ x, y: posY - 1, state: AttackResult.Miss });
        states.push({ x, y: posY + 1, state: AttackResult.Miss });
      }
      states.push({ x: posX - 1, y: posY, state: AttackResult.Miss });
      states.push({ x: posX + length, y: posY, state: AttackResult.Miss });
    }

    const filtered = states.filter(
      (state: ShipState) => state.x >= 0 && state.x < 10 && state.y >= 0 && state.y < 10
    );

    return filtered;
  }

  public getPlayerOrder(game: Game): number {
    return game.order ? 0 : 1;
  }

  public getGameBySocket(ws: WebSocket): Game | null {
    const user = this.getUserBySocket(ws);

    if (user) {
      const game = this.getGameByUser(user);
      return game;
    }
    return null;
  }

  getGameByUser(user: User): Game | null {
    const { uuid } = user;
    let userGame: Game | null = null;

    this.gameStorage.forEach((game: Game) => {
      for (const board of game.gameboards) {
        if (board.currentPlayerIndex === uuid) {
          userGame = game;
          return;
        }
      }
    });

    return userGame;
  }

  public addShipsToGame(boardData: AddShipsRequestData): boolean {
    const { gameId, ships, indexPlayer } = boardData;
    const game = this.gameStorage.find((game: Game) => game.gameId === gameId);
    let isGameReadyToStart = false;
    if (game) {
      game.gameboards.forEach((gameboard: GameBoard) => {
        if (gameboard.currentPlayerIndex === indexPlayer) {
          ships.forEach((ship: Ship) => {
            ship.shipStates = this.addShipState(ship);
          });
          gameboard.ships = [...ships];
        }
      });
      isGameReadyToStart = game.gameboards.every((board: GameBoard) => board.ships.length > 0);
    }

    return isGameReadyToStart;
  }

  public addShipState(ship: Ship): ShipState[] {
    const { position, length, direction } = ship;
    const { x, y } = position;

    const shipState: ShipState[] = new Array<ShipState>();
    for (let i = 0; i < length; i++) {
      if (direction) {
        shipState.push(this.getShipState(x, y + i));
      } else {
        shipState.push(this.getShipState(x + i, y));
      }
    }

    return shipState;
  }

  getShipState(x: number, y: number): ShipState {
    return {
      x,
      y,
      state: AttackResult.None,
    };
  }

  public createGame(ws: WebSocket): Game | null {
    const user = this.getUserBySocket(ws);
    if (user) {
      const room = this.getRoomByUser(user);
      if (room) {
        const game = this.getNewGame(room);
        if (game) {
          this.gameStorage.push(game);
          return game;
        }
      }
    }
    return null;
  }

  getNewGame(room: Room): Game | null {
    const gameBoards = new Array<GameBoard>();
    for (const roomUser of room.roomUsers) {
      const ws = this.getSocketByUserId(roomUser.index);
      if (!ws) {
        return null;
      }
      const board: GameBoard = {
        currentPlayerIndex: roomUser.index.toString(),
        ships: new Array<Ship>(),
        ws,
      };
      gameBoards.push(board);
    }
    const game: Game = {
      gameId: randomUUID(),
      gameboards: [...gameBoards],
      order: Math.random() > 0.5,
    };
    return game;
  }

  getRoomByUser(user: User): Room | undefined {
    let userRoom: Room | undefined;
    this.roomStorage.forEach((room) => {
      room.roomUsers.forEach((roomUser) => {
        if (roomUser.index === user.uuid) userRoom = room;
      });
    });

    return userRoom;
  }

  getSocketByUserId(id: number | string): WebSocket | undefined {
    const user = this.userStorage.find((user: User) => user.uuid === id);
    return user?.ws;
  }

  getUserBySocket(ws: WebSocket): User | undefined {
    const user = this.userStorage.find((user: User) => user.ws === ws);
    return user;
  }

  public getRoomUsersSockets(ws: WebSocket): (WebSocket | undefined)[] {
    const user = this.userStorage.find((user: User) => user?.ws === ws);
    if (user) {
      let userRoom: Room | undefined;
      this.roomStorage.forEach((room) => {
        room.roomUsers.forEach((roomUser) => {
          if (roomUser.index === user.uuid) userRoom = room;
        });
      });
      if (userRoom) {
        const sockets = userRoom.roomUsers.map((roomUser: RoomUser) =>
          this.getSocketByUserId(roomUser.index)
        );
        return sockets;
      }
    }
    return new Array<undefined>();
  }

  public getWinners(): Winner[] {
    const winners = this.userStorage
      .filter((user: User): boolean => user.wins > 0)
      .sort((a: User, b: User): number => a.wins - b.wins)
      .map(({ name, wins }: User): Winner => {
        return { name, wins };
      });
    return winners;
  }

  public getState(): string {
    return `db: users ${this.userStorage.length}, rooms ${this.roomStorage.length}`;
  }

  public getActiveUsers(): User[] {
    const users = this.userStorage.filter(
      (user: User): boolean => user.ws.readyState === WebSocket.OPEN
    );

    return users;
  }
  public addUserToRoom(ws: WebSocket, indexRoom: string): CustomError {
    const room = this.roomStorage.find((room: Room): boolean => room.roomId === indexRoom);
    const user = this.userStorage.find((user: User): boolean => user.ws === ws);

    if (room && user && room.roomUsers.length < 2 && room.roomUsers[0]?.index != user.uuid) {
      room.roomUsers.push({ name: user.name, index: user.uuid });
      return { error: false, errorText: '' };
    }
    return { error: true, errorText: Message.CantAddUserToRoom };
  }

  public createRoom(): Room {
    const room: Room = {
      roomId: randomUUID(),
      roomUsers: new Array<RoomUser>(),
    };
    this.roomStorage.push(room);

    return room;
  }

  public regUser(ws: WebSocket, name: string, password: string): CustomError {
    const index = this.userStorage.findIndex((user: User) => user.name === name);
    if (index === -1) {
      const user: User = { name, password, wins: 0, uuid: randomUUID(), ws };
      this.userStorage.push(user);
      return { error: false, errorText: '' };
    }

    const user = this.userStorage[index];
    if (user.password === password) {
      if (user.ws.readyState === ws.OPEN || user.ws.readyState === ws.CONNECTING) {
        return { error: true, errorText: Message.AlreadyConnected };
      } else {
        user.ws = ws;
      }
    } else {
      return { error: true, errorText: Message.WrongPassword };
    }

    return { error: false, errorText: '' };
  }

  public getAvailableRooms(): Room[] {
    return [...this.roomStorage.filter((room: Room): boolean => room.roomUsers.length == 1)];
  }
}

export default DataService.getInstance();
