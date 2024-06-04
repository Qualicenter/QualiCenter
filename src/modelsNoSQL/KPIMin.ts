import dynamodb from "../services/dynamoService";
import joi from 'joi';
import { PREFIX_NAME } from '../config';

const KPIMinPruebaModel = dynamodb.define('kpiMinPrueba', {
    hashKey: 'kpiId',
    timestamps: false,
    schema:{
        kpiId: dynamodb.types.uuid(),
        Tipo: joi.string(),
        Metrica: joi.number(),
        Fecha: joi.date()
    },
    tableName:`KPIMinPrueba${PREFIX_NAME}`
});

dynamodb.createTables((err) =>{
    if (err)
        return console.log(err);
    console.log('Tabla KPIMin exitosamente')
})

export default KPIMinPruebaModel;