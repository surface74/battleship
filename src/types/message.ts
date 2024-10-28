export enum Message {
  UnknownAction = 'Unrecognized action',
  FrontStart = 'static http-server started on the port',
  BackStart = 'ws-server started on the port',
  BackStop = 'ws-server stoped',
  CantCreateRoom = 'Can`t create room',
}
