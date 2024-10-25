import { LoginRequest } from '../types/api.types';
import Guid from '../utils/guid';
import { User } from './user.types';

export default class DataService {
  static instance: DataService = new DataService();

  private userStorage: User[] = new Array<User>();

  private constructor() {
    if (!DataService.instance) DataService.instance = this;
  }

  public static getInstance(): DataService {
    return DataService.instance;
  }

  public GetState(): string {
    return `db started: users ${this.userStorage.length}`;
  }

  public LoginUser(message: LoginRequest): boolean {
    const { name, password } = message.data;
    const user = { name, password, wins: 0, id: Guid.newGuid() };
    this.userStorage.push(user as User);

    return true;
  }
}
