/**
 * @author Angel Armando Marquez Curiel
 * @author 
 * @author
 * 
 * Controller in charge of managing the requests related to the agent
 */ 

import { Request,Response } from "express";
import AbstractController from "./AbstractController";
import connectLens from "../services/connectLensService";
import AWS from "../services/amazonSNS";
import { connectService, customerProfilesService } from "../services/clientsService";
import connect from "../services/connectService";
import customer from "../services/customerService";


class AgenteController extends AbstractController{
    
    /* Singleton */
    /* Class attributes and methods */
    private static _instance: AgenteController;
    public static get instance():AbstractController{
        if(!this._instance){
            this._instance = new AgenteController("agente");
        }
        return this._instance;
    }
    
    /* Initializes the routes for the AgenteController. */
    protected initRoutes(): void {
        this.router.get('/consultaTranscripcion2/:contactId',this.getTranscripcion2.bind(this));
        this.router.get('/prueba',this.getPrueba.bind(this));
        this.router.get('/consultaCustomerInfo/:contactId', this.getCustomerInfo.bind(this));
        this.router.get('/infoAgente/:agenteNombre', this.getInfoAgente.bind(this));
        this.router.get('/consultaContacts',this.getContacts.bind(this));
    }

    /*Function to get the number of the client of an active call*/
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

    /*Function to get the information of the client with the help of @aws-sdk/client-customer-profiles*/
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

    /*Main function in charge to get all the information of the active calls*/
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
                    const numberData = await this.getNumberActiva(contact.Id? contact.Id : '');
                    
                    let customerNumber;
                    let sentimiento = 'NEUTRAL'
                    if (numberData && numberData[0] && numberData[0].Attributes) {
                        customerNumber = numberData[0].Attributes["Customer number"];
                        
                    } else {
                        throw new Error('No customer number found');
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
                            contactId: contact.Id,
                            NombreCliente: nombreCliente,
                            NombreAgente: nombreAgente,
                            EnqueueTimestamp: contact.QueueInfo?.EnqueueTimestamp,
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

    private getPrueba(req: Request,res: Response){
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
    

}

export default AgenteController;
