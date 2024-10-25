import { WebSocket, WebSocketServer } from 'ws';
import { LoginRequest } from './types/api.types';

export const createWsServer = (port: number): void => {
  const wss = new WebSocketServer({ port: port });

  wss.on('connection', function connection(ws: WebSocket) {
    ws.on('error', (error: Error) => console.error(error.message));

    ws.on('message', function message(data: Buffer) {
      const message = JSON.parse(data.toString()) as LoginRequest;
      console.log('message: ', message);
      console.log('received: %s', data);
    });

    ws.on('close', (code: number, reason: Buffer) => console.log(`socket closed:${code} ${reason.toString()}`));

    ws.send(JSON.stringify({ value: 12 }));
  });

  wss.on('error', (error) => console.log(error.message));

  wss.on('listening', () => console.log(`Start ws-server on the port ${port}`));
};
