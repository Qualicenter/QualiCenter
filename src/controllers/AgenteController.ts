import { Request,Response } from "express";
import AbstractController from "./AbstractController";
import connectLens from "../services/connectLensService";
import AWS from "../services/amazonSNS";
import { connectService, customerProfilesService } from "../services/clientsService";
import connect from "../services/connectService";
import customer from "../services/customerService";

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
        // Transcripción de prueba elegante (usada en los videos)
        this.router.get('/consultaTranscripcionPrueba',this.getTranscripcionPrueba.bind(this));
        this.router.get('/consultaTranscripcion2/:contactId',this.getTranscripcion2.bind(this));
        this.router.get('/consultaTranscripcionPrueba',this.getTranscripcionPrueba.bind(this));
        this.router.get('/prueba',this.getPrueba.bind(this));
        this.router.get('/consultaCustomerInfo/:contactId', this.getCustomerInfo.bind(this));
        this.router.get('/infoAgente/:agenteNombre', this.getInfoAgente.bind(this));

        // Llamadas activas 
        this.router.get('/consultaContacts',this.getContacts.bind(this));
        this.router.get('/verificarContacts',this.verificarConctacts.bind(this));
       


    }

    private async getNumberActiva(initialContactId: string) {
        try {
            const input = { // GetContactAttributesRequest
                InstanceId: "e730139b-8673-445e-8307-c3a9250199a2", // required
                InitialContactId: initialContactId, // use the passed in initialContactId
            };
    
            const command = await connect.getContactAttributes(input).promise();
            console.log([command]);
            return ([command]);
            
        } catch (err) {
            console.log(err);
            throw new Error('Internal server error' + err);
        }
    }

    private async getTranscripcionActiva(contactId: string) {
        const MAX_RETRIES = 5; // Define the maximum number of retries
        let attempt = 0; // Initialize attempt counter
    
        const request = async (): Promise<any> => {
            try {
                const input = {
                    InstanceId: 'e730139b-8673-445e-8307-c3a9250199a2', // required
                    ContactId: contactId // required
                };
                
                // Obtener las métricas actuales
                const command = await connectLens.listRealtimeContactAnalysisSegments(input).promise();
                return command;
            } catch (err) {
                if (err instanceof Error) {
                    if (err.name === 'TooManyRequestsException' && attempt < MAX_RETRIES) {
                        attempt++;
                        // Wait 1 second before retrying
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        return request();
                    } else if (err.name === 'ResourceNotFoundException') {
                        console.log('Real-time contact analysis not found for contactId: ' + contactId);
                        return null; // or handle this case differently as per your requirements
                    } else {
                        console.log(err);
                        throw new Error('Internal server error' + err);
                    }
                } else {
                    // Handle the case where err is not an Error
                    console.log(err);
                    throw err;
                }
            }
        }
    
        return request();
    }

    private async getUserActiva(userId: string) {
        try {
            const input = { // DescribeUserRequest
                InstanceId: "e730139b-8673-445e-8307-c3a9250199a2", // required
                UserId: userId, // required
              };
            const command = await connect.describeUser(input).promise();
            console.log([command]);
            return ([command]);
            
        } catch (err) {
            console.log(err);
            throw new Error('Internal server error' + err);
        }
    }

    private async getCustomerProfileActiva(phoneNumber: string) {
        try {
            const input = {
                DomainName: "amazon-connect-qualicentec", // required
                KeyName: "PhoneNumber",
                Values: [phoneNumber]
                }
            const command = await customer.searchProfiles(input).promise();
            console.log([command])
            return ([command]);
            
        } catch (err) {
            console.log(err);
            throw new Error('Internal server error' + err);
        }
    }

    private async getContacts(req: Request, res: Response) {
        try {
            const st = new Date(new Date().getTime() - (1000 * 60 * 60 * 24)); // Hace un día
            const et = new Date(new Date().getTime() - (1000)); // Hace un segundo
            const input = {
                InstanceId: 'e730139b-8673-445e-8307-c3a9250199a2', // required
                TimeRange: {
                    Type: "INITIATION_TIMESTAMP", // puedes cambiar esto a "SCHEDULED_TIMESTAMP", "CONNECTED_TO_AGENT_TIMESTAMP" o "DISCONNECT_TIMESTAMP" según sea necesario
                    // StartTime: new Date("2024-05-27T00:00:00Z"), // Comienzo del día 27 de mayo de 2024
                    // EndTime: new Date("2024-05-27T23:59:59Z"), // Final del día 27 de mayo de 2024

                    StartTime: st, // Comienzo del día v2
                    EndTime: et, // Final del día v2
                }
            };
            const command = await connect.searchContacts(input).promise();
            const result = ([command]);
            const llamada = await Promise.all(result[0].Contacts
                .filter((contact) => !contact.DisconnectTimestamp)
                .map(async (contact) => {
                    const numberData = await this.getNumberActiva(contact.Id? contact.Id : '');
                    const transcripcion = await this.getTranscripcionActiva(contact.Id? contact.Id : '');
                    
                    let customerNumber;
                    let currentTime;
                    let elapsedTime;
                    let elapsedTimeInMilliseconds;
                    let sentimiento = 'NEUTRAL'
                    if (numberData && numberData[0] && numberData[0].Attributes
                        && transcripcion && transcripcion.Segments && transcripcion.Segments.length > 0) {
                        customerNumber = numberData[0].Attributes["Customer number"];
                        currentTime = numberData[0].Attributes["CurrentTime"];

                        // Calculate elapsed time
                        const initiationTimestamp = new Date(contact.InitiationTimestamp? contact.InitiationTimestamp : '');
                        const currentTimestamp = new Date(currentTime);
                        elapsedTimeInMilliseconds = currentTimestamp.getTime() - initiationTimestamp.getTime();
                        let elapsedTimeInSeconds = Math.floor(elapsedTimeInMilliseconds / 1000);
                        let minutes = Math.floor(elapsedTimeInSeconds / 60);
                        let seconds = elapsedTimeInSeconds % 60;

                        elapsedTime = minutes + ":" + seconds;
                    }
                    if (customerNumber && numberData) {
                        const agentInfo = await this.getUserActiva(contact.AgentInfo?.Id ? contact.AgentInfo.Id : '');
                        const clientInfo = await this.getCustomerProfileActiva(customerNumber);
                        let nombreCliente = '';
                        let nombreAgente = '';
                        let usernameAgente = '';
                        if(clientInfo && clientInfo[0] && clientInfo[0].Items && clientInfo[0].Items[0]
                            && agentInfo && agentInfo[0] && agentInfo[0].User) {
                            nombreCliente = clientInfo[0].Items[0].FirstName + ' ' +  clientInfo[0].Items[0].LastName;
                            nombreAgente = agentInfo[0].User.IdentityInfo?.FirstName + ' ' + agentInfo[0].User.IdentityInfo?.LastName;
                            usernameAgente = agentInfo[0].User.Username!;
                        }
                        return {
                           
                            NombreCliente: nombreCliente,
                            NombreAgente: nombreAgente,
                            InitiationTimestamp: contact.InitiationTimestamp,
                            CurrentTime: currentTime,
                            ElapsedTime: elapsedTime,
                            Sentimiento: sentimiento,
                            UserNameAgente: usernameAgente,
                            //Transcripcion: transcripcion
                            
                        };
                    }
                    
                }));
            res.status(200).json(llamada);

            console.log(command);
            
        } catch (err) {
            console.log(err);
            res.status(500).send('Internal server error' + err);
        }
    }

    private async verificarConctacts(req: Request, res: Response) {
        try {
            const st = new Date(new Date().getTime() - (1000 * 60 * 60 * 24)); // Hace un día
            const et = new Date(new Date().getTime() - (1000)); // Hace un segundo
            const input = {
                InstanceId: 'e730139b-8673-445e-8307-c3a9250199a2', // required
                TimeRange: {
                    Type: "INITIATION_TIMESTAMP", // puedes cambiar esto a "SCHEDULED_TIMESTAMP", "CONNECTED_TO_AGENT_TIMESTAMP" o "DISCONNECT_TIMESTAMP" según sea necesario
                    // StartTime: new Date("2024-05-27T00:00:00Z"), // Comienzo del día 27 de mayo de 2024
                    // EndTime: new Date("2024-05-27T23:59:59Z"), // Final del día 27 de mayo de 2024

                    StartTime: st, // Comienzo del día v2
                    EndTime: et, // Final del día v2
                }
            };
            const command = await connect.searchContacts(input).promise();
            const result = ([command]);
            const llamadaId = result[0].Contacts
            .filter((contact) => !contact.DisconnectTimestamp)
            .map((contact) => contact.Id);
            res.status(200).json(llamadaId);
            console.log(command);
            
        } catch (err) {
            console.log(err);
            res.status(500).send('Internal server error' + err);
        }
    }

    private getPrueba(req: Request,res: Response){
        const respuesta = {
            "mensaje": "Prueba exitosa"
        }
        res.status(200).json(respuesta);
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

    private async getInfoAgente(req: Request, res: Response) {
        try {
            const agentName = req.params.agenteNombre;

            if (!agentName) {
                return res.status(400).send('Nombre de agente no proporcionado');
            }

            // const st = new Date(new Date().getTime() - (1000 * 60 * 60 * 24 * 7)); // Hace un día
            const st = new Date(new Date().setHours(0, 0, 0, 0)); // Hoy 00:00:00
            const et = new Date(new Date().getTime() - (1000)); // Hace un segundo
            // console.log(st, et);
            const input4 = {
                InstanceId: 'e730139b-8673-445e-8307-c3a9250199a2',
                TimeRange: { // SearchContactsTimeRange
                    Type: "INITIATION_TIMESTAMP", // required
                    StartTime: st, // required
                    EndTime: et, // required
                },
            };
            const data4 = await connect.searchContacts(input4).promise();

            const input = {
                InstanceId: 'e730139b-8673-445e-8307-c3a9250199a2',
                //getCurrentUserData
                Filters: {
                    Queues: ['f6512e90-b9c0-413b-beb9-702a5473435a'],
                },
            }
            const data = await connect.getCurrentUserData(input).promise();

            const userIds = data?.UserDataList?.map(user => user?.User?.Id) ?? []; // recuperar los IDs de todos los usuarios

            // const agenteId = contactIds.find(item => userIds.includes(item.userId)); // verificar si el agente está en la lista

            const list = [];
            for (const userId of userIds) {
                const input2 = {
                    InstanceId: 'e730139b-8673-445e-8307-c3a9250199a2',
                    UserId: userId ?? '', // Proporcionar el ID de usuario, en caso de que no se proporcione, se utilizará una cadena vacía
                }
                const data2 = await connect.describeUser(input2).promise();
                
                list.push({
                    userId: userId,
                    name: data2.User?.IdentityInfo?.FirstName + ' ' + data2.User?.IdentityInfo?.LastName,
                    username: data2.User?.Username,
                    //data: data2,
                });
            }

            // comparar el agentName con el firstName y lastName del agente ****[cambiar username por name]****
            const infoAgente = list.find(item => item.username?.toLowerCase().replace(/\s/g, '') === agentName.toLowerCase().replace(/\s/g, ''));


            // Si encontramos el agente, recuperamos sus métricas con su id

            // ID del agente que estamos interesados
            const agenteId = infoAgente?.userId ?? '';

            // Filtrar los contactos por el Id del AgentInfo
            const filteredContacts = data4.Contacts.filter(contact => contact.AgentInfo?.Id === agenteId);

            // Mapear los contactos para extraer los campos requeridos
            const contacts = filteredContacts.map(contact => ({
                ContactId: contact.Id,
                ConnectedToAgentTimestamp: contact.AgentInfo?.ConnectedToAgentTimestamp,
                InitiationTimestamp: contact.InitiationTimestamp,
                DisconnectTimestamp: contact.DisconnectTimestamp
            }));
            //console.log(contacts);

            const metricaAgente = [];
            if (infoAgente) {
                const input3 = {
                    ResourceArn: 'arn:aws:connect:us-east-1:744102162455:instance/e730139b-8673-445e-8307-c3a9250199a2',
                    StartTime: st,
                    EndTime: et,
                    Filters: [
                        {
                            FilterKey: 'AGENT', // Recuperar datos de un agente específico
                            FilterValues: [infoAgente.userId ?? ''],
                        },
                    ],
                    Metrics: [
                        {
                            Name: 'AVG_HANDLE_TIME',
                        }, // Tiempo promedio de manejo de llamadas AHT
                        {
                            Name: 'CONTACTS_HANDLED',
                        }, // Llamadas respondidas
                        {
                            Name: 'AGENT_NON_RESPONSE',
                        }, // Llamadas no respondidas
                        {
                            Name: 'CONTACTS_ABANDONED',
                        }, // Llamadas abandonadas
                        {
                            Name: 'AGENT_ANSWER_RATE',
                        }, // Tasa de respuesta del agente
                        {
                            Name: 'AGENT_OCCUPANCY',
                        }, // Ocupación del agente
                        {
                            Name: 'SERVICE_LEVEL',
                            Threshold: [ // ThresholdCollections
                                { // ThresholdV2
                                    Comparison: "LT",
                                    ThresholdValue: 20,
                                },
                            ],
                        }, // Nivel de servicio
                    ],
                };
                
                const data3 = await connect.getMetricDataV2(input3).promise();

                metricaAgente.push({
                    agenteID: infoAgente.userId,
                    //contactID: agenteId?.contactId,
                    nombre: infoAgente.name,
                    username: infoAgente.username,
                    llamadas: contacts,
                    data: data3
                });
                //res.status(200).json([infoAgente, data3]);
            }
            res.status(200).json(metricaAgente);
            //res.status(200).json([list, xAgente]);
            //res.status(200).json(data);
        } catch (err) {
            console.log(err);
            res.status(500).send('Internal server error' + err);
        }
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
                        "Content": "Buenas tardes, gracias por llamar a Qualicenter. ¿En qué puedo asistirle hoy?",
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
                        "Content": "Hola, buenas tardes. Acabo de tener un accidente con mi coche y necesito reportarlo.",
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
                        "Content": "Lamento escuchar eso. Espero que usted esté bien. ¿Hay alguien herido?",
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
                        "Content": "No, por suerte no hay heridos. Pero mi coche tiene daños importantes.",
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
                        "Content": "Me alegra saber que todos están bien. Para proceder con el reporte, necesito algunos detalles. ¿Podría darme su nombre completo y número de póliza?",
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
                        "Content": "Claro, mi nombre es Juan Pérez y mi número de póliza es 123456789.",
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
                        "Content": "Gracias, señor Pérez. Ahora, ¿podría describirme brevemente cómo ocurrió el accidente?",
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
                        "Content": "Sí, estaba conduciendo por la avenida principal cuando un coche se saltó el semáforo y chocó contra mi lateral derecho.",
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
                        "Content": "Entiendo. ¿Tiene información sobre el otro conductor, como su nombre, número de matrícula o su aseguradora?",
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
                        "Content": "Sí, tengo su nombre y matrícula. Se llama María López y su matrícula es ABC1234. Me dijo que también está asegurada con ustedes.",
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
                        "Content": "Perfecto. Eso facilitará las cosas. ¿Llamaron a la policía para hacer un informe del accidente?",
                        "BeginOffsetMillis": 77547,
                        "EndOffsetMillis": 78125,
                        "Sentiment": "POSITIVE"
                    }
                },
                {
                    "Transcript": {
                        "Id": "538f11be-7965-4b48-8d1c-b38d4234d5b5",
                        "ParticipantId": "CUSTOMER",
                        "ParticipantRole": "CUSTOMER",
                        "Content": "Sí, ya vino la policía y tomaron nota de todo. Me dieron una copia del informe.",
                        "BeginOffsetMillis": 77547,
                        "EndOffsetMillis": 78125,
                        "Sentiment": "POSITIVE"
                    }
                },
                {
                    "Transcript": {
                        "Id": "238f11be-7965-4b48-8d1c-b38d4bd4d5b5",
                        "ParticipantId": "AGENT",
                        "ParticipantRole": "AGENT",
                        "Content": " Excelente. Eso nos será muy útil. Ahora, necesito saber la ubicación exacta del accidente y si su coche es remolcable.",
                        "BeginOffsetMillis": 77547,
                        "EndOffsetMillis": 78125,
                        "Sentiment": "POSITIVE"
                    }
                },
                {
                    "Transcript": {
                        "Id": "532311be-7965-4b48-8d1c-b38d4bd4d5b5",
                        "ParticipantId": "CUSTOMER",
                        "ParticipantRole": "CUSTOMER",
                        "Content": "Fue en la intersección de la avenida Principal con la calle 5. Mi coche no puede moverse, necesita ser remolcado.",
                        "BeginOffsetMillis": 77547,
                        "EndOffsetMillis": 78125,
                        "Sentiment": "POSITIVE"
                    }
                },
                {
                    "Transcript": {
                        "Id": "538f23be-7965-4b48-8d1c-b38d4bd4d5b5",
                        "ParticipantId": "AGENT",
                        "ParticipantRole": "AGENT",
                        "Content": "Entendido. Vamos a enviar una grúa a su ubicación. ¿Se encuentra seguro y fuera del vehículo mientras espera?",
                        "BeginOffsetMillis": 77547,
                        "EndOffsetMillis": 78125,
                        "Sentiment": "POSITIVE"
                    }
                },
                {
                    "Transcript": {
                        "Id": "538f11be-7965-7848-8d1c-b38d4bd4d5b5",
                        "ParticipantId": "CUSTOMER",
                        "ParticipantRole": "CUSTOMER",
                        "Content": " Sí, estoy en un lugar seguro.",
                        "BeginOffsetMillis": 77547,
                        "EndOffsetMillis": 78125,
                        "Sentiment": "POSITIVE"
                    }
                },
                {
                    "Transcript": {
                        "Id": "538f11be-4335-4b48-8d1c-b38d4bd4d5b5",
                        "ParticipantId": "AGENT",
                        "ParticipantRole": "AGENT",
                        "Content": "Perfecto, señor Pérez. Enviaremos una grúa lo antes posible. También un ajustador se pondrá en contacto con usted dentro de las próximas 24 horas para evaluar los daños y proceder con la reclamación. ¿Hay algo más en lo que pueda ayudarle hoy?",
                        "BeginOffsetMillis": 77547,
                        "EndOffsetMillis": 78125,
                        "Sentiment": "POSITIVE"
                    }
                },
                {
                    "Transcript": {
                        "Id": "538f11be-7965-4b48-8d1c-b38d4bd4d5b5",
                        "ParticipantId": "CUSTOMER",
                        "ParticipantRole": "CUSTOMER",
                        "Content": "No, eso sería todo por ahora. Muchas gracias por su ayuda.",
                        "BeginOffsetMillis": 77547,
                        "EndOffsetMillis": 78125,
                        "Sentiment": "POSITIVE"
                    }
                },
                {
                    "Transcript": {
                        "Id": "538f11be-7965-4b48-8d1c-b44d4bd4d5b5",
                        "ParticipantId": "AGENT",
                        "ParticipantRole": "AGENT",
                        "Content": "De nada, señor Pérez. Lamento el inconveniente, pero me alegra saber que está bien. Recuerde que estamos aquí para asistirle en cualquier momento. Que tenga un buen día.",
                        "BeginOffsetMillis": 77547,
                        "EndOffsetMillis": 78125,
                        "Sentiment": "POSITIVE"
                    }
                },
                {
                    "Transcript": {
                        "Id": "538f11be-7965-4b48-333c-b38d4bd4d5b5",
                        "ParticipantId": "CUSTOMER",
                        "ParticipantRole": "CUSTOMER",
                        "Content": "Gracias, igualmente. Adiós.",
                        "BeginOffsetMillis": 77547,
                        "EndOffsetMillis": 78125,
                        "Sentiment": "POSITIVE"
                    }
                },
                {
                    "Transcript": {
                        "Id": "538f11be-7965-4b48-8d1c-b38d4bd4d5b5",
                        "ParticipantId": "AGENT",
                        "ParticipantRole": "AGENT",
                        "Content": "Adiós.",
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
    

}

export default AgenteController;
