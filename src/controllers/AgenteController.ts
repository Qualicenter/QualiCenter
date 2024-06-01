import { Request,Response } from "express";
import AbstractController from "./AbstractController";
import connectLens from "../services/connectLensService";
import AWS from "../services/amazonSNS";
import { connectService, customerProfilesService } from "../services/clientsService";

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
        this.router.get('/consultaTranscripcionPrueba',this.getTranscripcionPrueba.bind(this));
        this.router.get('/consultaLlamadas',this.getLlamadas.bind(this));
        this.router.get('/consultaLlamada1',this.getLlamada1.bind(this));
        this.router.get('/prueba',this.getPrueba.bind(this));
        this.router.get('/consultaCustomerInfo/:contactId', this.getCustomerInfo.bind(this));
    }

    private getTranscripcionPrueba(req: Request,res: Response){
        
        const data = [
        {
            "Segments": [
                {
                    "Transcript": {
                        "Id": "151fdea7-60ac-4136-8d76-3dc29b3c2ecd",
                        "ParticipantId": "AGENT",
                        "ParticipantRole": "AGENT",
                        "Content": "Bueno.",
                        "BeginOffsetMillis": 757,
                        "EndOffsetMillis": 1275,
                        "Sentiment": "NEUTRAL"
                    }
                },
                {
                    "Transcript": {
                        "Id": "64038535-f936-4546-9108-0a8fb820602c",
                        "ParticipantId": "CUSTOMER",
                        "ParticipantRole": "CUSTOMER",
                        "Content": "Bueno.",
                        "BeginOffsetMillis": 867,
                        "EndOffsetMillis": 1307,
                        "Sentiment": "NEUTRAL"
                    }
                },
                {
                    "Transcript": {
                        "Id": "dbbff659-8c98-4cd4-85a0-a4c8f60d2d90",
                        "ParticipantId": "AGENT",
                        "ParticipantRole": "AGENT",
                        "Content": "Hola. En quΘ le puedo ayudar?",
                        "BeginOffsetMillis": 4880,
                        "EndOffsetMillis": 6235,
                        "Sentiment": "NEUTRAL"
                    }
                },
                {
                    "Transcript": {
                        "Id": "f06fac63-7f10-4ab5-8c95-3087e8830946",
                        "ParticipantId": "CUSTOMER",
                        "ParticipantRole": "CUSTOMER",
                        "Content": "Hola. Necesito ayudar. Con una compra. Estoy muy bien o jado. Y de satisfecho. Mi sentimientos muy malo.",
                        "BeginOffsetMillis": 10427,
                        "EndOffsetMillis": 21095,
                        "Sentiment": "POSITIVE"
                    }
                },
                {
                    "Transcript": {
                        "Id": "d13a14fa-9d80-48c7-86b9-69a20d6eab5f",
                        "ParticipantId": "AGENT",
                        "ParticipantRole": "AGENT",
                        "Content": "Okay. Me puede dar especificaciones de su compra.",
                        "BeginOffsetMillis": 24150,
                        "EndOffsetMillis": 27925,
                        "Sentiment": "POSITIVE"
                    }
                },
                {
                    "Transcript": {
                        "Id": "9a36a828-e92d-46ca-a46a-0b54fca11a23",
                        "ParticipantId": "CUSTOMER",
                        "ParticipantRole": "CUSTOMER",
                        "Content": "Compre un producto. Y Estoy de satisfecho con este producto por la orden, la devoluci≤n",
                        "BeginOffsetMillis": 31310,
                        "EndOffsetMillis": 39355,
                        "Sentiment": "POSITIVE"
                    }
                },
                {
                    "Transcript": {
                        "Id": "e3faee5b-65f0-47ce-bc63-ec223ab3c956",
                        "ParticipantId": "AGENT",
                        "ParticipantRole": "AGENT",
                        "Content": "Okay. Te darΘ esto. Devoluci≤n. Cußl es su nombre completo?",
                        "BeginOffsetMillis": 42240,
                        "EndOffsetMillis": 45852,
                        "Sentiment": "NEUTRAL"
                    }
                },
                {
                    "Transcript": {
                        "Id": "624cecfe-52f7-4577-9d15-410a9840ecda",
                        "ParticipantId": "CUSTOMER",
                        "ParticipantRole": "CUSTOMER",
                        "Content": "Mi nombre completo es Gustavo TΘllez. Por favor, denme de vuelos. Si ah!",
                        "BeginOffsetMillis": 49587,
                        "EndOffsetMillis": 54267,
                        "Sentiment": "NEUTRAL"
                    }
                },
                {
                    "Transcript": {
                        "Id": "57e5499d-887e-43ad-a2d6-47d7fc779fdf",
                        "ParticipantId": "AGENT",
                        "ParticipantRole": "AGENT",
                        "Content": "Okay. Su devoluci≤n ha sido Realizada.",
                        "BeginOffsetMillis": 60077,
                        "EndOffsetMillis": 63345,
                        "Sentiment": "NEGATIVE"
                    }
                },
                {
                    "Transcript": {
                        "Id": "458a7316-cd99-4bd0-955c-256442ff2ff6",
                        "ParticipantId": "CUSTOMER",
                        "ParticipantRole": "CUSTOMER",
                        "Content": "Muchas gracias. Ahora estoy muy feliz. Estoy satisfecho. Se lo agradezco mucho.",
                        "BeginOffsetMillis": 66250,
                        "EndOffsetMillis": 73625,
                        "Sentiment": "POSITIVE"
                    }
                },
                {
                    "Transcript": {
                        "Id": "538f11be-7965-4b48-8d1c-b38d4bd4d5b5",
                        "ParticipantId": "AGENT",
                        "ParticipantRole": "AGENT",
                        "Content": "Adi≤s.",
                        "BeginOffsetMillis": 77547,
                        "EndOffsetMillis": 78125,
                        "Sentiment": "POSITIVE"
                    }
                }
            ]
        
        }
        ];
        res.json(data);
    
    }

    private getPrueba(req: Request,res: Response){
        const respuesta = {
            "mensaje": "Prueba exitosa"
        }
        res.status(200).json(respuesta);
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
                ContactId: 'efca4975-7066-49df-ba18-dff5282e6469' // required
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

    private async getCustomerInfo(req: Request, res: Response) {
        try {
            const contactId = req.params.contactId;

            if (!contactId) {
                return res.status(400).send('Missing required parameter: contactId');
            }

            // 1. Get customer phone number from the contact ID
            const getContactAttributesResponse = await connectService.getContactAttributes({
                InstanceId: 'e730139b-8673-445e-8307-c3a9250199a2',
                InitialContactId: contactId
            }).promise();

            if (!getContactAttributesResponse.Attributes) {
                return res.status(404).send('Contact attributes not found');
            }

            const phoneNumber = getContactAttributesResponse.Attributes['Customer number'];
            
            // 2. Use the phone number to get customer information
            const response = await customerProfilesService.searchProfiles({
                DomainName: 'amazon-connect-qualicentec',
                KeyName: 'PhoneNumber',
                Values: [phoneNumber],
                MaxResults: 1
            }).promise();
            
            const customerInfo = response.Items![0];
            const name = `${customerInfo.FirstName} ${customerInfo.LastName}`;

            const responseObject = { clientName: name };
            res.status(200).json(responseObject);
            
        } catch (error) {
            console.error("Error fetching contact information:", error);
            res.status(500).send('Internal server error');
        }
    }
    

}

export default AgenteController;
