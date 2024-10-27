import { WebSocket, WebSocketServer } from 'ws';
import { routes } from './routes/routes';
import { Message } from './types/message';

export const createWsServer = (port: number): void => {
  const wss = new WebSocketServer({ port: port });

  wss.on('connection', (ws: WebSocket): void => {
    ws.on('error', (error: Error): void => console.error(error.message));

    ws.on('message', (data: Buffer): void => routes(ws, data));

    ws.on('close', (code: number, reason: Buffer): void =>
      console.log(`socket closed:${code} ${reason.toString()}`)
    );
    ws.on('open', (): void => console.log('socket opened'));
  });

  wss.on('error', (error: Error): void => console.log(error.message));

  wss.on('close', (): void => console.log(`${Message.BackStop}`));

  wss.on('listening', (): void => console.log(`${Message.BackStart} ${port}`));
};
