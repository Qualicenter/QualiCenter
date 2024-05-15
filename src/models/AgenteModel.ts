import {DataTypes, Model, Sequelize} from 'sequelize';

interface AgenteAttributes {
    id:number;
    nombre:string;
    email:string;
}

module.exports = (sequelize:Sequelize, type:any) => {
    class Agente extends Model<AgenteAttributes> implements AgenteAttributes {
        public id!:number;
        public nombre!:string;
        public email!:string;

        static associate(models:any){
            
        }
    }

    Agente.init({
        id:{
            type:DataTypes.INTEGER,
            allowNull:false,
            primaryKey:true,
            autoIncrement:true
        },
        nombre:{
            type:DataTypes.STRING,
            allowNull:false
        },
        email:{
            type:DataTypes.STRING(50),
            allowNull:false
        }
    }, {
        sequelize,
        modelName:'Agente'
    });
    return Agente;
}