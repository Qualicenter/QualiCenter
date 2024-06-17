/**
 * @author Eduardo Francisco Lugo Quintana
 * This file contains the model for the poliza table
 */

import { Model, Sequelize } from 'sequelize';

interface PolizasAttributes {
    numPoliza: string;
    Telefono: string;
}

module.exports = (sequelize: Sequelize, DataTypes: any) => {
    class Poliza extends Model<PolizasAttributes> implements PolizasAttributes {
        public numPoliza!: string;
        public Telefono!: string;

        /*
        The poliza table has a one to many relationship with the cliente table
        The poliza table has a one to one relationship with the vehicle table
        The poliza table has a one to many relationship with the siniestro table
        */
        static associate(models: any) {
            this.belongsTo(models.Cliente, { foreignKey: 'Telefono', as: 'cliente' });
            this.hasOne(models.Vehicle, { foreignKey: 'numPoliza', as: 'vehicle' });
            this.hasMany(models.Siniestro, { foreignKey: 'numPoliza', as: 'siniestro' });
        }
    }

    Poliza.init({
        numPoliza: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true, // The policy number is the primary key
        },
        Telefono: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }, {
        sequelize,
        modelName: 'Poliza',
        indexes: [
            {
                unique: true,
                fields: ['numPoliza']
            }
        ]
    });

    return Poliza;
}
