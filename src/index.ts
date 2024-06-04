import Server from './provider/Server';
import {PORT,NODE_ENV} from './config';
import express from 'express';
import MessageController from './controllers/MessagesController';
import AgenteController from './controllers/AgenteController';
import SmsController from './controllers/SmsController';
<<<<<<< HEAD
import ClientsController from './controllers/ClientsController';
import KPIsController from './controllers/KPIController';
import HistoricoController from './controllers/HistoricoControllers';
=======
import CallsDataController from './controllers/CallsDataController';
>>>>>>> 8d21025dd0ed2763d5b2c6749b8db296f2bed860

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
<<<<<<< HEAD
        ClientsController.instance,
        KPIsController.instance,
        HistoricoController.instance

=======
        CallsDataController.instance
>>>>>>> 8d21025dd0ed2763d5b2c6749b8db296f2bed860
    ]
});

server.init();