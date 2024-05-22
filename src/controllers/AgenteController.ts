import { Request,Response } from "express";
import AbstractController from "./AbstractController";
import connectLens from "../services/connectLensService";
import AWS from "../services/amazonSNS";


class AgenteController extends AbstractController{
    //Singleton
    //Atributo de clase
    private static _instance: AgenteController;
    //Metodo de clase
    public static get instance():AbstractController{
        if(!this._instance){
            this._instance = new AgenteController("agente");
        }
        return this._instance;
    }
    //Declarar todas las rutas del controlador
    protected initRoutes(): void {
        
        this.router.get('/consultaTranscripcion1',this.getTranscripcion1.bind(this));
        this.router.get('/consultaTranscripcion2/:contactId',this.getTranscripcion2.bind(this));
        this.router.get('/consultaLlamadas',this.getLlamadas.bind(this));
        this.router.get('/consultaLlamada1',this.getLlamada1.bind(this));

        this.router.post('/enviarSMS',this.postEnviarSMS.bind(this));
        
    }

    private getLlamada1(req: Request,res: Response){
        const data = {
            "Llamada": {
                "Agente": "Aldehil Sanchez"
            }
        };
        res.json(data);     
    }

    private getLlamadas(req: Request,res: Response){
        const data = {
            "Llamadas": [
                {
                    "idArr": 1, 
                    "contenido": {
                        "id": 1,
                        "agente": 'Juan Perez',
                        "cliente": 'Gustavo Tellez',
                        "tiempo": '2:30',
                        "sentimiento": 'POSITIVE',
                        "asistencia": false,
                        "instanceid": 'e730139b-8673-445e-8307-c3a9250199a2'
                    }
                },
                {
                    "idArr": 2, 
                    "contenido": {
                        "id": 2,
                        "agente": 'Ana Rodriguez',
                        "cliente": 'Pedro Gomez',
                        "tiempo": '2:30',
                        "sentimiento": 'POSITIVE',
                        "asistencia": false,
                        "instanceid": 'e730139b-8673-445e-8307-c3a9250199a2'
                    }
                },
                {
                    "idArr": 1, 
                    "contenido": {
                        "id": 1,
                        "agente": 'Juan Perez',
                        "cliente": 'Pedro Gomez',
                        "tiempo": '2:30',
                        "sentimiento": 'POSITIVE',
                        "asistencia": false,
                        "instanceid": 'e730139b-8673-445e-8307-c3a9250199a2'
                    }
                },
                {
                    "idArr": 1, 
                    "contenido": {
                        "id": 1,
                        "agente": 'Juan Perez',
                        "cliente": 'Pedro Gomez',
                        "tiempo": '2:30',
                        "sentimiento": 'POSITIVE',
                        "asistencia": false,
                        "instanceid": 'e730139b-8673-445e-8307-c3a9250199a2'
                    }
                },
                {
                    "idArr": 1, 
                    "contenido": {
                        "id": 1,
                        "agente": 'Juan Perez',
                        "cliente": 'Pedro Gomez',
                        "tiempo": '2:30',
                        "sentimiento": 'POSITIVE',
                        "asistencia": false,
                        "instanceid": 'e730139b-8673-445e-8307-c3a9250199a2'
                    }
                },
                {
                    "idArr": 1, 
                    "contenido": {
                        "id": 1,
                        "agente": 'Juan Perez',
                        "cliente": 'Pedro Gomez',
                        "tiempo": '2:30',
                        "sentimiento": 'POSITIVE',
                        "asistencia": false,
                        "instanceid": 'e730139b-8673-445e-8307-c3a9250199a2'
                    }
                },
                {
                    "idArr": 1, 
                    "contenido": {
                        "id": 1,
                        "agente": 'Juan Perez',
                        "cliente": 'Pedro Gomez',
                        "tiempo": '2:30',
                        "sentimiento": 'POSITIVE',
                        "asistencia": false,
                        "instanceid": 'e730139b-8673-445e-8307-c3a9250199a2'
                    }
                }
            ]
        };
        res.json(data);     
        
    }

    private async getTranscripcion1(req: Request, res: Response) {
        try {
            // const contactId = req.params.contactId;
            const input = {
                InstanceId: 'e730139b-8673-445e-8307-c3a9250199a2', // required
                ContactId: '5f059e6b-2544-45e4-91c4-8d9f6e23cc87' // required
            };
            
            // Obtener las métricas actuales
            const command = await connectLens.listRealtimeContactAnalysisSegments(input).promise();
            res.status(200).json([command]);
            console.log(command);
        } catch (err) {
            console.log(err);
            res.status(500).send('Internal server error' + err);
        }
    }

    private async getTranscripcion2(req: Request, res: Response) {
        try {
            const contactId = req.params.contactId;

            if (!contactId) {
                // Si contactId no se proporciona, devolver un error al cliente
                return res.status(400).send('Missing required parameter: contactId');
            }
            const input = {
                InstanceId: 'e730139b-8673-445e-8307-c3a9250199a2', // required
                ContactId: contactId // required
            };
            
            // Obtener las métricas actuales
            const command = await connectLens.listRealtimeContactAnalysisSegments(input).promise();
            res.status(200).json([command]);
        } catch (err) {
            console.log(err);
            res.status(500).send('Internal server error' + err);
        }
    }

    private async postEnviarSMS(req:Request, res:Response){
        try{
            const service = req.body.service
            const name = req.body.clientName
            const direccion = req.body.direccion
            const params = {
                Message: name + ", tu " + service + " va en camino a: " + direccion,
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


}

export default AgenteController;
