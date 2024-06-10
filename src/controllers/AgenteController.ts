import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import connectLens from "../services/connectLensService";
import AWS from "../services/amazonSNS";
import { connectService, customerProfilesService } from "../services/clientsService";
import connect from "../services/connectService";
import customer from "../services/customerService";

class AgenteController extends AbstractController {
    //Singleton
    //Atributo de clase
    private static _instance: AgenteController;
    //Metodo de clase
    public static get instance(): AbstractController {
        if (!this._instance) {
            this._instance = new AgenteController("agente");
        }
        return this._instance;
    }
    //Declarar todas las rutas del controlador
    protected initRoutes(): void {

        // Transcripción de prueba elegante (usada en los videos)
        this.router.get('/consultaTranscripcion2/:contactId', this.getTranscripcion2.bind(this));
        this.router.get('/prueba', this.getPrueba.bind(this));
        this.router.get('/consultaCustomerInfo/:contactId', this.getCustomerInfo.bind(this));
        // Agent information
        this.router.get('/infoAgente/:agenteNombre', this.getInfoAgente.bind(this));
        // Llamadas activas 
        this.router.get('/consultaContacts', this.getContacts.bind(this));
        this.router.get('/verificarContacts', this.verificarConctacts.bind(this));

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
            const data = [
                {
                    "Attributes": {
                        "Customer number": "+000000000000",
                        "CurrentTime": "2024-05-29T02:12:41.663142"
                    }
                }
            ];
            return data;
        }
    }

    private async getTranscripcion1(res: Response, contactId: string) {
        try {
            // const contactId = req.params.contactId;
            const input = {
                InstanceId: 'e730139b-8673-445e-8307-c3a9250199a2', // required
                ContactId: contactId // required
            };

            // Obtener las métricas actuales
            const command = await connectLens.listRealtimeContactAnalysisSegments(input).promise();
            console.log([command, command.Segments[command.Segments.length - 1].Transcript?.Sentiment]);
            res.json([command]);

        } catch (err) {
            console.log(err);
            const data = [
                {
                    "Segments": [
                        {
                            "Transcript": {
                                "Id": "151fdea7-60ac-4136-8d76-3dc29b3c2ecd",
                                "ParticipantId": "CUSTOMER",
                                "ParticipantRole": "CUSTOMER",
                                "Content": "...",
                                "BeginOffsetMillis": 757,
                                "EndOffsetMillis": 1275,
                                "Sentiment": "NEUTRAL"
                            }
                        },
                        {
                            "Transcript": {
                                "Id": "151fdea7-60ac-4136-8d76-3dc29b3c2ecd",
                                "ParticipantId": "AGENT",
                                "ParticipantRole": "AGENT",
                                "Content": "...",
                                "BeginOffsetMillis": 757,
                                "EndOffsetMillis": 1275,
                                "Sentiment": "NEUTRAL"
                            }
                        },
                    ]

                }
            ];
            res.json(data);
        }
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
            const data = [
                {
                    "User": {
                        "IdentityInfo": {
                            "FirstName": "...",
                            "LastName": "..."
                        },
                        "Username": "..."
                    }
                }
            ];
            return data;
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
            const data = [
                {
                    "Items": [
                        {
                            "FirstName": "...",
                            "LastName": "..."
                        }
                    ]
                }
            ];
            return data;
        }
    }

    private async getContacts(req: Request, res: Response) {
        try {
            const st = new Date(new Date().getTime() - (1000 * 60 * 60 * 24)); // Hace un día
            const et = new Date(new Date().getTime() - (1000)); // Hace un segundo
            const input = {
                InstanceId: 'e730139b-8673-445e-8307-c3a9250199a2', // required
                TimeRange: {
                    Type: "INITIATION_TIMESTAMP",
                    StartTime: st, // Comienzo del día v2
                    EndTime: et, // Final del día v2
                }
            };
            const command = await connect.searchContacts(input).promise();
            const result = ([command]);
            const filteredContacts = result[0].Contacts.filter((contact) => !contact.DisconnectTimestamp);

            if (filteredContacts.length === 0) {
                res.status(400).send('No contacts found');
                return;
            }
            const llamada = await Promise.all(result[0].Contacts
                .filter((contact) => !contact.DisconnectTimestamp)
                .map(async (contact) => {
                    const numberData = await this.getNumberActiva(contact.Id ? contact.Id : '');

                    let customerNumber;
                    let currentTime;
                    let elapsedTime;
                    let elapsedTimeInMilliseconds;
                    let sentimiento = 'NEUTRAL'
                    if (numberData && numberData[0] && numberData[0].Attributes) {
                        customerNumber = numberData[0].Attributes["Customer number"];
                        currentTime = numberData[0].Attributes["CurrentTime"];

                        // Calculate elapsed time
                        const EnqueueTimestamp = new Date(contact.QueueInfo?.EnqueueTimestamp ? contact.QueueInfo?.EnqueueTimestamp : '');
                        const currentTimestamp = new Date(currentTime);
                        elapsedTimeInMilliseconds = currentTimestamp.getTime() - EnqueueTimestamp.getTime();
                        let elapsedTimeInSeconds = Math.floor(elapsedTimeInMilliseconds / 1000);
                        let minutes = Math.floor(elapsedTimeInSeconds / 60);
                        let seconds = elapsedTimeInSeconds % 60;

                        elapsedTime = minutes + ":" + seconds;
                    } else {
                        throw new Error('No customer number found');
                    }
                    if (customerNumber && numberData) {
                        const agentInfo = await this.getUserActiva(contact.AgentInfo?.Id ? contact.AgentInfo.Id : '');
                        const clientInfo = await this.getCustomerProfileActiva(customerNumber);
                        let nombreCliente = '';
                        let nombreAgente = '';
                        let usernameAgente = '';
                        if (clientInfo && clientInfo[0] && clientInfo[0].Items && clientInfo[0].Items[0]
                            && agentInfo && agentInfo[0] && agentInfo[0].User) {
                            nombreCliente = clientInfo[0].Items[0].FirstName + ' ' + clientInfo[0].Items[0].LastName;
                            nombreAgente = agentInfo[0].User.IdentityInfo?.FirstName + ' ' + agentInfo[0].User.IdentityInfo?.LastName;
                            usernameAgente = agentInfo[0].User.Username!;
                        }
                        return {
                            contactId: contact.Id,
                            NombreCliente: nombreCliente,
                            NombreAgente: nombreAgente,
                            EnqueueTimestamp: contact.QueueInfo?.EnqueueTimestamp,
                            CurrentTime: currentTime,
                            ElapsedTime: elapsedTime,
                            Sentimiento: sentimiento,
                            UserNameAgente: usernameAgente,

                        };
                    } else {
                        throw new Error('No customer number found');
                    }

                }));
            res.status(200).json(llamada);

            console.log("Llamada activa:", llamada);

        } catch (err) {
            console.log(err);
            const llamada = [
                {
                    "contactId": null,
                    "NombreCliente": "...",
                    "NombreAgente": "...",
                    "InitiationTimestamp": "2024-05-27T21:48:40.526Z",
                    "CurrentTime": "2024-06-01T06:22:42.117319",
                    "ElapsedTime": "00:00",
                    "Sentimiento": "...",
                    "UserNameAgente": "..."
                }
            ];
            res.status(400).json(llamada)
        }
    }

    private async verificarConctacts(req: Request, res: Response) {
        try {
            const st = new Date(new Date().getTime() - (1000 * 60 * 60 * 24)); // Hace un día
            const et = new Date(new Date().getTime() - (1000)); // Hace un segundo
            const input = {
                InstanceId: 'e730139b-8673-445e-8307-c3a9250199a2', // required
                TimeRange: {
                    Type: "INITIATION_TIMESTAMP",
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

    private getPrueba(req: Request, res: Response) {
        const respuesta = {
            "mensaje": "Prueba exitosa"
        }
        res.status(200).json(respuesta);
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

    /* Function to get agent information */
    private async getInfoAgente(req: Request, res: Response) {
        try {
            // Get the agent name from the request parameters
            const agentName = req.params.agenteNombre;

            if (!agentName) {
                return res.status(400).send('Nombre de agente no proporcionado');
            }

            const st = new Date(new Date().setHours(0, 0, 0, 0)); // Today 00:00:00
            const et = new Date(new Date().getTime() - (1000)); // One second ago

            // Get all users 
            const input = {
                InstanceId: 'e730139b-8673-445e-8307-c3a9250199a2',
                Filters: {
                    Queues: ['f6512e90-b9c0-413b-beb9-702a5473435a'],
                },
            }
            const data = await connect.getCurrentUserData(input).promise();

            // Gets a list of all user IDs
            const userIds = data?.UserDataList?.map(user => user?.User?.Id) ?? [];

            // Get the list of users where it returns the id, name, and username of the user(agent)
            const list = await Promise.all(userIds.map(async (userId) => {

                // Get user data with the userId from the list of userIds
                const input2 = {
                    InstanceId: 'e730139b-8673-445e-8307-c3a9250199a2',
                    UserId: userId ?? '', // userId is retrieved from the list of userIds
                }
                const data2 = await connect.describeUser(input2).promise();

                return {
                    userId: userId,
                    name: data2?.User?.IdentityInfo?.FirstName + ' ' + data2?.User?.IdentityInfo?.LastName,
                    username: data2?.User?.Username,
                };
            }));

            // Compare the agentName with the firstName and lastName of the agent
            const infoAgente = list.find(item => item.name?.toLowerCase().replace(/\s/g, '') === agentName.toLowerCase().replace(/\s/g, ''));

            // If the agent is not found, return an error
            if (!infoAgente || !infoAgente.name) {
                return res.status(404).send('Agente no encontrado');
            }

            // If the agent is found, retrieve their metrics with their id
            // Get the agent ID we are interested in
            const agenteId = infoAgente?.userId ?? '';

            // Get all contacts (calls)
            const input4 = {
                InstanceId: 'e730139b-8673-445e-8307-c3a9250199a2',
                TimeRange: { // SearchContactsTimeRange
                    Type: "INITIATION_TIMESTAMP",
                    StartTime: st,
                    EndTime: et,
                },
            };
            const data4 = await connect.searchContacts(input4).promise();

            // Filter contacts by AgentInfo Id
            const filteredContacts = data4.Contacts.filter(contact => contact.AgentInfo?.Id === agenteId);

            // Map the contacts to extract the contact id, connected time, initiation time, disconnect time, and customer name
            const contactList = await Promise.all(filteredContacts.map(async (contact) => {
                
                // Get customer phone number from the contact Id
                const getContactAttributesResponse = await connectService.getContactAttributes({
                    InstanceId: 'e730139b-8673-445e-8307-c3a9250199a2',
                    InitialContactId: contact.Id ?? ''
                }).promise();
                
                if (!getContactAttributesResponse.Attributes) {
                    return res.status(404).send('Contact attributes not found');
                }

                const phoneNumber = getContactAttributesResponse.Attributes['Customer number'];

                // Get customer information with the phone number
                const response = await customerProfilesService.searchProfiles({
                    DomainName: 'amazon-connect-qualicentec',
                    KeyName: 'PhoneNumber',
                    Values: [phoneNumber],
                    MaxResults: 1
                }).promise();

                // Get the customer name
                const customerInfo = response.Items![0];
                const name = `${customerInfo.FirstName} ${customerInfo.LastName}`;

                return {
                    ContactId: contact.Id,
                    ConnectedToAgentTimestamp: contact.AgentInfo?.ConnectedToAgentTimestamp,
                    InitiationTimestamp: contact.InitiationTimestamp,
                    DisconnectTimestamp: contact.DisconnectTimestamp,
                    CustomerName: name,
                };
            }));

            // Get the agent information with the metrics, such as the agent ID, name, username, calls, and data(metrics)
            const metricaAgente = [];
            if (infoAgente) {
                const input3 = {
                    ResourceArn: 'arn:aws:connect:us-east-1:744102162455:instance/e730139b-8673-445e-8307-c3a9250199a2',
                    StartTime: st,
                    EndTime: et,
                    Filters: [
                        {
                            FilterKey: 'AGENT', // Get data for a specific agent
                            FilterValues: [infoAgente.userId ?? ''],
                        },
                    ],
                    Metrics: [
                        {
                            Name: 'AVG_HANDLE_TIME',
                        }, // AHT, or average handle time, is the average amount of time an agent spends on a call.
                        {
                            Name: 'CONTACTS_HANDLED',
                        }, // Calls handled 
                        {
                            Name: 'AGENT_NON_RESPONSE',
                        }, // Calls not answered 
                        {
                            Name: 'CONTACTS_ABANDONED',
                        }, // Calls abandoned 
                        {
                            Name: 'AGENT_ANSWER_RATE',
                        }, // Percentage of calls answered by the agent
                        {
                            Name: 'AGENT_OCCUPANCY',
                        }, // Percentage of time the agent is handling calls
                        {
                            Name: 'SERVICE_LEVEL',
                            Threshold: [ // ThresholdCollections
                                { // ThresholdV2
                                    Comparison: "LT",
                                    ThresholdValue: 20,
                                },
                            ],
                        }, // Service level is the percentage of calls answered within a certain threshold
                    ],
                };

                const data3 = await connect.getMetricDataV2(input3).promise();

                metricaAgente.push({
                    agenteID: infoAgente.userId,
                    nombre: infoAgente.name,
                    username: infoAgente.username,
                    llamadas: contactList,
                    data: data3
                });
            }
            res.status(200).json(metricaAgente);
        } catch (err) {
            console.log(err);
            res.status(500).send('Internal server error' + err);
        }
    }


}

export default AgenteController;
