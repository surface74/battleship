import { randomUUID } from 'crypto';
import {
  AddShipsRequestData,
  AttackRequestData,
  AttackResponseData,
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
import { Game, GameBoard } from './game.types';

class DataService {
  static instance: DataService = new DataService();

  private playersOrder: number | null = null;
  private userStorage: User[] = new Array<User>();
  private roomStorage: Room[] = new Array<Room>();
  private gameStorage: Game[] = new Array<Game>();

  private constructor() {
    if (!DataService.instance) DataService.instance = this;
  }

  public static getInstance(): DataService {
    return DataService.instance;
  }

  public getAttackResult(data: AttackRequestData): [WebSocket[], AttackResponseData] {
    const { gameId, x, y, indexPlayer } = data;

    const game = this.gameStorage.filter(
      (game: Game): boolean => game.gameId === gameId.toString()
    )[0];

    const sockets: WebSocket[] = game.gameboards.map((board: GameBoard): WebSocket => board.ws);
    const attackedBoard = game.gameboards.filter(
      (board: GameBoard) => board.currentPlayerIndex !== indexPlayer
    )[0];

    const attackResult: AttackResult = this.getAttackStatus(attackedBoard, x, y);

    const response: AttackResponseData = {
      position: { x, y },
      currentPlayer: indexPlayer,
      status: attackResult,
    };

    return [sockets, response];
  }

  getAttackStatus(board: GameBoard, x: number, y: number): AttackResult {
    let attackedShip: Ship | undefined;
    let attackResult = AttackResult.Miss;

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
        attackedShip.shipStates.forEach(
          (shipState: ShipState): AttackResult => (shipState.state = AttackResult.Killed)
        );
        return AttackResult.Killed;
      }
      return AttackResult.Shot;
    }

    return attackResult;
  }

  public getPlayerOrder(): number {
    if (this.playersOrder == null) {
      this.playersOrder = Math.random() > 0.5 ? 1 : 0;
    } else {
      this.playersOrder = this.playersOrder ? 0 : 1;
    }

    return this.playersOrder;
  }

  public getGameBySocket(ws: WebSocket): Game | null {
    const user = this.getUserBySocket(ws);
    console.log('getGameBySocket.user.uuid: ', user?.uuid);

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
    this.userStorage
      .filter((user: User): boolean => user.wins > 0)
      .sort((a: User, b: User): number => a.wins - b.wins)
      .map(({ name, wins }: User): Winner => {
        return { name, wins };
      });
    return new Array<Winner>();
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

    if (room && user) {
      room.roomUsers.push({ name: user.name, index: user.uuid });
      return { error: false, errorText: '' };
    }
    return { error: true, errorText: 'Room or user not found' };
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
    const user: User = { name, password, wins: 0, uuid: randomUUID(), ws };
    this.userStorage.push(user);

    return { error: false, errorText: '' };
  }

  public getAvailableRooms(): Room[] {
    return [...this.roomStorage.filter((room: Room): boolean => room.roomUsers.length == 1)];
  }
}

export default DataService.getInstance();
