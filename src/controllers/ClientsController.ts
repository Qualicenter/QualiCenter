import { Request, Response} from "express";
import AbstractController from "./AbstractController";


class ClientsController extends AbstractController{ 
    private static _instance: ClientsController;

    public static get instance():AbstractController{
        if(!this._instance){
            this._instance = new ClientsController("cliente");
        }
        return this._instance;
    }

    protected initRoutes(): void {
        
    }
}

export default ClientsController;