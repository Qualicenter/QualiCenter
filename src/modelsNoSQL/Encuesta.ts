import dynamodb from "../services/dynamoService";
import joi from "joi";
import { PREFIX_NAME } from "../config/index";

const EncuestaModel = dynamodb.define("encuesta", { 
  hashKey: "EncuestaId",
  timestamps: false,
  schema: {
    EncuestaId: dynamodb.types.uuid(),
    username: joi.string(),
    score: joi.number(),
    comment:joi.array().items(joi.string())
  },
  tableName: `Encuesta${PREFIX_NAME}`, // Prefix name is used to separate production and development tables
});
/* */

dynamodb.createTables((err) => {
  if (err) 
    return console.log("Error creating tables: ", err);
  console.log("Table Encuesta created successfully");
});
export default EncuestaModel;