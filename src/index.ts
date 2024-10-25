import dotenv from 'dotenv';

import { httpServer } from './http-server';
import { createWsServer } from './ws-server';

dotenv.config();
console.log('http server port: ', process.env.HTTP_PORT);
console.log('ws server port: ', process.env.WS_PORT);

const HTTP_PORT = Number.parseInt(process.env.HTTP_PORT || '8181');
const WS_PORT = Number.parseInt(process.env.WS_PORT || '3000');

httpServer.listen(HTTP_PORT, () => console.log(`Start static http-server on the port ${HTTP_PORT}`));
createWsServer(WS_PORT);
