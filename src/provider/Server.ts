//const express = require('express'); //JS
import express, {Request, Response} from 'express'; //TS
import AbstractController from '../controllers/AbstractController';
import db from '../models/Index';
import cors from 'cors';

class Server{
    //Atributos de instancia
    private app: express.Application;
    private port: number;
    private env:string;
    //Metodos de instancia

    constructor(appInit:{port:number;env:string;middlewares:any[];controllers:AbstractController[]}){
        this.app = express();
        this.app.use(cors());
        this.port = appInit.port;
        this.env = appInit.env;
        this.loadmiddlewares(appInit.middlewares);
        this.loadRoutes(appInit.controllers);
        this.connectDB();        
        
    }

    private loadRoutes(controllers:AbstractController[]):void{
        this.app.get('/',(req:Request,res:Response)=>{
            res.status(200).send('Hello world');
        })
        
        controllers.forEach((controller:AbstractController )=> {
            this.app.use(`/${controller.prefix}`,controller.router);
        })
    }

    private loadmiddlewares(middlewares:any[]):void{
        middlewares.forEach((middleware:any)=>{
            this.app.use(middleware);
        })
    }

    private async connectDB(){
        await db.sequelize.sync({force:false});
    }

    public init(){
        this.app.listen(this.port,()=>{
            console.log(`Server running on port ${this.port}`);
        })       
    }

}

export default Server;