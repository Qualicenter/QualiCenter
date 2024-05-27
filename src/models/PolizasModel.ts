import { Model, Sequelize } from 'sequelize';

interface PolizasAttributes {
    numPoliza: number;
    Telefono: string;
    placa: string;
}

module.exports = (sequelize: Sequelize, DataTypes: any) => {
    class Poliza extends Model<PolizasAttributes> implements PolizasAttributes {
        public numPoliza!: number;
        public Telefono!: string;
        public placa!: string;

        static associate(models: any) {
            this.belongsTo(models.Cliente, { foreignKey: 'Telefono', as: 'cliente' })
            this.belongsTo(models.Vehicle, { foreignKey: 'numPoliza', as: 'vehicle' });
        }
    }

    Poliza.init({
        numPoliza: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        }, 
        Telefono: {
            type: DataTypes.STRING,
            allowNull: false
        },
        placa: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Poliza',
    });

    return Poliza;
}