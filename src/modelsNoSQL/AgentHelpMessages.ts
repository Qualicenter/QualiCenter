import dynamodb from "../services/dynamoService";
import joi from "joi";
import { PREFIX_NAME } from "../config";

const AgentHelpMessages = dynamodb.define(`${PREFIX_NAME}-AgentHelpMessages`, {
    hashKey: "MessageId",
    timestamps: false,
    schema: {
        MessageId: dynamodb.types.uuid(),
        Sender: joi.string(),
        Receiver: joi.string(),
        Message: joi.string(),
        Date: joi.date(),
    },
    tableName: `${PREFIX_NAME}-AgentHelpMessages`
});

dynamodb.createTables((err: any) => {
    if (err) {
        console.log("Error creating tables", err);
    } else {
        console.log("Tables has been created");
    }
});

export default AgentHelpMessages;