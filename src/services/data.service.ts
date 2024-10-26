import { UpdateRoomResponseData } from '../types/api.types';
import Guid from '../utils/guid';
import { User } from './user.types';

class DataService {
  static instance: DataService = new DataService();

  private userStorage: User[] = new Array<User>();
  private roomStorage: UpdateRoomResponseData[] = new Array<UpdateRoomResponseData>();

  private constructor() {
    if (!DataService.instance) DataService.instance = this;
  }

  public static getInstance(): DataService {
    return DataService.instance;
  }

  public GetState(): string {
    return `db started: users ${this.userStorage.length}`;
  }

  public regUser(name: string, password: string): { error: boolean; errorText: string } {
    const user: User = { name, password, wins: 0, id: Guid.newGuid() };
    this.userStorage.push(user);

    return { error: false, errorText: '' };
  }

  public getRooms(): UpdateRoomResponseData[] {
    return [...this.roomStorage];
  }
}

export default DataService.getInstance();
