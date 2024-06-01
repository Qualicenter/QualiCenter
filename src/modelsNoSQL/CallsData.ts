import dynamodb from "../services/dynamoService";
import joi from "joi";
import { PREFIX_NAME } from "../config";

const CallsData = dynamodb.define(`${PREFIX_NAME}-CallsData`, {
    hashKey: "clientContactId", // Using clientContactId as the hash key
    timestamps: false,
    schema: {
        clientContactId: joi.string(),
        clientPhoneNumber: joi.string(),
        clientContactInformation: joi.object(), // You might want to define a more specific schema here
        agentContactInformation: joi.object(), // You might want to define a more specific schema here
        clientQueueDateTime: joi.string(),
        finalDuration: joi.number().allow(null),
        ended: joi.boolean()
    },
    tableName: `${PREFIX_NAME}-CallsData`
});

dynamodb.createTables((err: any) => {
    if (err) {
        console.log("Error creating tables", err);
    } else {
        console.log("Tables has been created");
    }
});

export default CallsData;