/**
 * @author Eduardo Francisco Lugo Quintana
 * This file contains the model for the Sinester table
 */

import { Model, Sequelize } from 'sequelize';

interface SiniestrosAttributes {
    numSiniestro: number;
    direccion: string;
    ambulancia: boolean;
    grua: boolean;
    numPoliza: string;
}

module.exports = (sequelize: Sequelize, DataTypes: any) => {
    class Siniestro extends Model<SiniestrosAttributes> implements SiniestrosAttributes {
        public numSiniestro!: number;
        public direccion!: string;
        public ambulancia!: boolean;
        public grua!: boolean;
        public numPoliza!: string;

        // The sinester table has a one to one relationship with the poliza table
        static associate(models: any) {
            this.belongsTo(models.Poliza, { foreignKey: 'numPoliza', as: 'poliza' });
        }
    }

    Siniestro.init({
        numSiniestro: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true, // The sinester number is the primary key
            autoIncrement: true
        },
        numPoliza: {
            type: DataTypes.STRING,
            allowNull: false
        },
        direccion: {
            type: DataTypes.STRING,
            allowNull: false
        },
        ambulancia: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        grua: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Siniestro',
        indexes: [
            {
                unique: true,
                fields: ['numSiniestro']
            }
        ]
    });

    return Siniestro;
}