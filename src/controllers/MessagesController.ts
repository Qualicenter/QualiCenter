/**
 * @author Aldehil Sánchez
 * This file contains the controller for the messages system between the agents and the supervisor
 * It contains the API routes for the messages system.
 */

import { Request,Response } from "express";
import AbstractController from "./AbstractController";
import AgentHelpMessages from "../modelsNoSQL/AgentHelpMessages";

class MessageController extends AbstractController{
    private static _instance: MessageController;
    
    public static get instance(){
        if(!this._instance){
            this._instance = new MessageController("messages"); // Prefix for the routes
        }
        return this._instance;
    }

    // Contructor with the API routes for the messages system
    protected initRoutes(): void {
        this.router.get("/getMessages",this.getMessages.bind(this));
        this.router.post("/createMessage",this.createMessage.bind(this));
        this.router.get("/getLastMessages", this.getLastMessages.bind(this));
        this.router.get('/prueba',this.getPrueba.bind(this));
    }

    // Route for testing purposes
    private getPrueba(req: Request,res: Response){
        const respuesta = {
            "mensaje": "Prueba exitosa"
        }
        res.status(200).json(respuesta);
    }

    /** Function to get messages from the database,
     * the request can have filters for the sender, receiver and date 
     */
    private async getMessages(req:Request,res:Response){
        try{
            let query = AgentHelpMessages.scan();

            // Filter by sender
            if (req.query.Sender) {
                query = query.where('Sender').equals(req.query.Sender);
            }

            // Filter by receiver
            if (req.query.Receiver) {
                query = query.where('Receiver').equals(req.query.Receiver);
            }

            /** Filter by date
             * The date must be received in the format "YYYY-MM-DDTHH:MM:ss" in the user local time,
             * and the dynamodb library will transform it to UTC time to make the query
             */
            if (req.query.Date) {
                try {
                    const filterDate = new Date(req.query.Date.toString());
                    console.log("FilterDate:",filterDate);
                    const startDate = new Date(filterDate.getFullYear(),filterDate.getMonth(),filterDate.getDate());
                    console.log("StartDate:",startDate);
                    const endtDate = new Date(filterDate.getFullYear(),filterDate.getMonth(),filterDate.getDate()+1);
                    console.log("EndDate:",endtDate);
                    query = query.where('Date').gte(startDate);
                    query = query.where('Date').lt(endtDate);
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

    /** Function to get the last messages from the database,
     * the request can have a filter for the minutes ago to search
     */
    private async getLastMessages(req: Request, res: Response) {
        try {
            const minutesAgo = 10; // Defining the minutes to search
            const currentTime = new Date();
            const startTime = new Date(currentTime.getTime() - minutesAgo * 60000);

            const data = await AgentHelpMessages.scan().where('Date').gt(startTime.toISOString()).exec().promise();
            res.status(200).send(data);
        } catch (err) {
            console.error("Error retrieving messages:", err);
            res.status(500).send("Internal server error");
        }
    }

    /**
     * Function to create a message in the database
     * The request must have the following fields:
     * Sender, Receiver, Message, Date, nombreCliente (name of the client),
     * generoCliente (gender of the client), fechaNacimientoCliente (birthdate of the client),
     * polizaCliente (number of policy), tipoCliente (type of client: standard, premium, etc.)
     */
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