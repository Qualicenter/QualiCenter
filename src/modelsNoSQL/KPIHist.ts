import dynamodb from "../services/dynamoService";
import joi from 'joi';
import { PREFIX_NAME } from '../config';

const KPIPruebaModel = dynamodb.define('kpiPrueba', {
    hashKey: 'kpiId',
    timestamps: false,
    schema:{
        kpiId: dynamodb.types.uuid(),
        Tipo: joi.string(),
        Metrica: joi.number(),
        Fecha: joi.date()
    },
    tableName:`KPIPrueba${PREFIX_NAME}`
});

dynamodb.createTables((err) =>{
    if (err)
        return console.log(err);
    console.log('Tabla KPIHist exitosamente')
})

export default KPIPruebaModel;