import dotenv from 'dotenv';

import { httpServer } from './http-server';
import { createWsServer } from './ws-server';
import { Message } from './types/message';
import DataService from './services/data.service';

dotenv.config();

const HTTP_PORT = Number.parseInt(process.env.HTTP_PORT || '8181');
const WS_PORT = Number.parseInt(process.env.WS_PORT || '3000');

httpServer.listen(HTTP_PORT, () => console.log(`${Message.FrontStart} ${HTTP_PORT}`));
createWsServer(WS_PORT);

console.log(DataService.getState());
