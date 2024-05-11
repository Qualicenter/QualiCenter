import Server from './provider/Server';
import {PORT,NODE_ENV} from './config';
import express from 'express';
// import AgenteController from './controllers/AgenteController';

const server = new Server({
    port:PORT,
    env:NODE_ENV,
    middlewares:[
        express.json(),
        express.urlencoded({extended:true})
    ],
    controllers:[
        // AgenteController.instance
    ]
});

server.init();