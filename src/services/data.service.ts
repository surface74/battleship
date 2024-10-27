import { randomUUID } from 'crypto';
import { Room, RoomUser, User, Winner } from '../types/api.types';
import { CustomError } from '../types/cusom-error.types';

import WebSocket from 'ws';

class DataService {
  static instance: DataService = new DataService();
  private userStorage: User[] = new Array<User>();
  private roomStorage: Room[] = new Array<Room>();

  private constructor() {
    if (!DataService.instance) DataService.instance = this;
  }

  public static getInstance(): DataService {
    return DataService.instance;
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
