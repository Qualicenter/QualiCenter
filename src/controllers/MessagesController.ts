import { Request,Response } from "express";
import AbstractController from "./AbstractController";
import AgentHelpMessages from "../modelsNoSQL/AgentHelpMessages";

class MessageController extends AbstractController{
    private static _instance: MessageController;
    
    public static get instance(){
        if(!this._instance){
            this._instance = new MessageController("messages");
        }
        return this._instance;
    }

    protected initRoutes(): void {
        this.router.get("/getMessages",this.getMessages.bind(this));
        this.router.post("/createMessage",this.createMessage.bind(this));
        this.router.get("/getLastMessages", this.getLastMessages.bind(this));
        this.router.get('/prueba',this.getPrueba.bind(this));
    }

    private getPrueba(req: Request,res: Response){
        const respuesta = {
            "mensaje": "Prueba exitosa"
        }
        res.status(200).json(respuesta);
    }

    private async getMessages(req:Request,res:Response){
        try{
            let query = AgentHelpMessages.scan();

            if (req.query.Sender) {
                query = query.where('Sender').equals(req.query.Sender);
            }

            if (req.query.Receiver) {
                query = query.where('Receiver').equals(req.query.Receiver);
            }

            if (req.query.Date) {
                try {
                    const filterDate = new Date(req.query.Date.toString());
                    const startDate = new Date(filterDate.getFullYear(),filterDate.getMonth(),filterDate.getUTCDate());
                    const endtDate = new Date(filterDate.getFullYear(),filterDate.getMonth(),filterDate.getUTCDate()+1);
                    query = query.where('Date').gte(startDate.toISOString());
                    query = query.where('Date').lt(endtDate.toISOString());
                } catch (err) {
                    console.error("Error parsing date:", err);
                    res.status(400).send("Invalid date format");
                    return;
                }
            }

            const messages = await query.exec().promise();
            console.log(messages);
            res.status(200).send(messages);
        }catch(err){
            res.status(500).send
        }
    }

    private async getLastMessages(req: Request, res: Response) {
        try {
            const minutesAgo = 10; // Define cuántos minutos atrás quieres buscar
            const currentTime = new Date();
            const startTime = new Date(currentTime.getTime() - minutesAgo * 60000);

            const data = await AgentHelpMessages.scan().where('Date').gt(startTime.toISOString()).exec().promise();
            res.status(200).send(data);
        } catch (err) {
            console.error("Error retrieving messages:", err);
            res.status(500).send("Internal server error");
        }
    }

    private async createMessage(req:Request,res:Response){
        console.log(req.body);
        const {Sender,Receiver,Message, nombreCliente, generoCliente, fechaNacimientoCliente, polizaCliente, tipoCliente} = req.body;
        try{
            const message = await AgentHelpMessages.create({
                Sender,
                Receiver,
                Message,
                Date: new Date(),
                nombreCliente,
                generoCliente,
                fechaNacimientoCliente,
                polizaCliente,
                tipoCliente,
            });
            console.log('Mensaje ayuda creado:', message);
            res.status(200).send("Mensaje creado correctamente");
        }catch(err){
            console.log(err);
            res.status(500).send("Internal server error" + err)
        }
    }
}

export default MessageController;