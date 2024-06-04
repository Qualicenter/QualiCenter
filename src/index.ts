import Server from './provider/Server';
import {PORT,NODE_ENV} from './config';
import express from 'express';
import MessageController from './controllers/MessagesController';
import AgenteController from './controllers/AgenteController';
import SmsController from './controllers/SmsController';
import ClientsController from './controllers/ClientsController';
import KPIsController from './controllers/KPIController';
import HistoricoController from './controllers/HistoricoControllers';

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
        ClientsController.instance,
        KPIsController.instance,
        HistoricoController.instance

    ]
});

server.init();