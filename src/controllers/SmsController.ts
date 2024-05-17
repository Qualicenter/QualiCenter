import {Request, Response} from "express";
import AbstractController from "./AbstractController";
import AWS from "../services/amazonSNS";

class SmsController extends AbstractController{
    private static _instance: SmsController;

    public static get instance(): AbstractController{
        if(!this._instance){
            this._instance = new SmsController("sms");
        }
        return this._instance;
    }

    protected initRoutes(): void {
        this.router.get('/pruebamensaje',this.getTestMensaje.bind(this));
        this.router.post('/enviarMensaje', this.postEnviarMensaje.bind(this));
    }

    private async postEnviarMensaje(req: Request, res: Response){
        try{
            console.log(req.body);
            const params = {
                Message: "Ajustador en camino a: " + req.body.message,
                PhoneNumber: req.body.number,
                MessageAttributes: {
                    'AWS.SNS.SMS.SenderID': {
                        'DataType': 'String',
                        'StringValue': 'String'
                    }
                }
                
            };
            const mensaje = await new AWS.SNS().publish(params).promise();
            console.log(mensaje);
            res.status(200).send("<h1>Mensaje mandado</h1>");
        } catch(err){
            console.log(err);
            res.status(500).send('Internal server error '+ err);
        }
    }

    private async getTestMensaje(req: Request, res: Response){
        try{
            console.log("Prueba exitosa");
            res.status(200).send("<h1>Prueba exitosa</h1>");
        }catch(err){
            console.log(err);
            res.status(500).send("Internal server error" + err);
        }
    }

    
}

export default SmsController;