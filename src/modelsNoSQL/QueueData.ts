import dynamodb from "../services/dynamoService";
import joi from "joi";

const QueueData = dynamodb.define(`CallsInQueueQualicenter`, {
    hashKey: "ContactID", // Using contactID as the hash key
    timestamps: false,
    schema: {
        ContactID: joi.string(),
        CurrentTime: joi.string(),
        InQueue: joi.boolean()
    },
    tableName: `CallsInQueueQualicenter`
});

export default QueueData;
