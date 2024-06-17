/**
 * @author Eduardo Francisco Lugo Quintana
 * This file contains the model for the vehicle table
 */

import { Model, Sequelize } from 'sequelize';

interface VehicleAttributes {
    Marca: string;
    Modelo: string;
    Año: number;
    Placa: string;
    Color: string;
}

module.exports = (sequelize: Sequelize, DataTypes: any) => {
    class Vehicle extends Model<VehicleAttributes> implements VehicleAttributes {
        public Marca!: string;
        public Modelo!: string;
        public Año!: number;
        public Placa!: string;
        public Color!: string;
        public numPoliza!: number;

        // The vehicle table has a one to one relationship with the poliza table
        static associate(models: any) {
            this.belongsTo(models.Poliza, { foreignKey: 'numPoliza', as: 'poliza' });
        }
    }

    Vehicle.init({
        Marca: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Modelo: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Año: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        Placa: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true // The license plate is the primary key
        },
        Color: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }, {
        sequelize,
        modelName: 'Vehicle',
        indexes: [
            {
                unique: true,
                fields: ['Placa']
            }
        ]
    });

    return Vehicle;
}