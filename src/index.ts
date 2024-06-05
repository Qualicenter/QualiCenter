import Server from './provider/Server';
import {PORT,NODE_ENV} from './config';
import express from 'express';
import MessageController from './controllers/MessagesController';
import AgenteController from './controllers/AgenteController';
import SmsController from './controllers/SmsController';
import CallsDataController from './controllers/CallsDataController';
<<<<<<< HEAD
import EncuestaController from './controllers/EncuestaControllers';
import HistoricoController from './controllers/HistoricoControllers';
import KPIsController from './controllers/KPIController';
import ClientsController from './controllers/ClientsController';
=======
import QueueController from './controllers/QueueController';
import ClientsController from './controllers/ClientsController';
import EncuestaController from './controllers/EncuestaControllers';
import HistoricoController from './controllers/HistoricoControllers';
import KPIsController from './controllers/KPIController';
>>>>>>> 13fef38c9a3708685d1511f2364b8282a091a83e

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
<<<<<<< HEAD
        EncuestaController.instance,
        HistoricoController.instance,
        KPIsController.instance,
        ClientsController.instance
=======
        QueueController.instance,
        ClientsController.instance,
        EncuestaController.instance,
        HistoricoController.instance,
        KPIsController.instance
>>>>>>> 13fef38c9a3708685d1511f2364b8282a091a83e
    ]
});

server.init();