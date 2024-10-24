import { Server, WebSocket, WebSocketServer } from 'ws';

export const createWsServer = (port: number): Server => {
  const wss = new WebSocketServer({ port: port });

  wss.on('connection', function connection(ws) {
    ws.on('error', console.error);

    ws.on('message', function message(data) {
      console.log('received: %s', data);
    });

    ws.send('something');
  });
};

export const createSocket = (url: string) => {
  const ws = new WebSocket(url);

  ws.on('error', console.error);

  ws.on('open', function open() {
    ws.send('something');
  });

  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });
};
