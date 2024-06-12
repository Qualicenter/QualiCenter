/**
 * @author Aldehil Sánchez
 * This file contains the dynamo model for the messages system between the agents and the supervisor
 */

import dynamodb from "../services/dynamoService";
import joi from "joi";
import { PREFIX_NAME } from "../config";


// Define the model for the messages system
const AgentHelpMessages = dynamodb.define(`${PREFIX_NAME}-AgentHelpMessages`, {
    hashKey: "MessageId",
    timestamps: false,
    schema: {
        MessageId: dynamodb.types.uuid(),
        Sender: joi.string(),
        Receiver: joi.string(),
        Message: joi.string(),
        Date: joi.date(),
        nombreCliente: joi.string(),
        generoCliente: joi.string(),
        fechaNacimientoCliente: joi.date(),
        polizaCliente: joi.string(),
        tipoCliente: joi.string(),
    },
    tableName: `${PREFIX_NAME}-AgentHelpMessages`
});

// Create the table in the database
dynamodb.createTables((err: any) => {
    if (err) {
        console.log("Error creating tables", err);
    } else {
        console.log("Tables has been created");
    }
});

export default AgentHelpMessages;