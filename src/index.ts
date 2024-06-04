import Server from './provider/Server';
import {PORT,NODE_ENV} from './config';
import express from 'express';
import MessageController from './controllers/MessagesController';
import AgenteController from './controllers/AgenteController';
import SmsController from './controllers/SmsController';
import CallsDataController from './controllers/CallsDataController';
import QueueController from './controllers/QueueController';
import ClientsController from './controllers/ClientsController';

const server = new Server({
    port:PORT,
    env:NODE_ENV,
    middlewares:[
        express.json(),
        express.urlencoded({extended:true})
    ],
    controllers:[
        MessageController.instance,
        AgenteController.instance,
        SmsController.instance,
        CallsDataController.instance,
        QueueController.instance,
        ClientsController.instance,
    ]
});

server.init();