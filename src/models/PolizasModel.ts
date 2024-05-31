import { Model, Sequelize } from 'sequelize';

interface PolizasAttributes {
    numPoliza: string;
    Telefono: string;
}

module.exports = (sequelize: Sequelize, DataTypes: any) => {
    class Poliza extends Model<PolizasAttributes> implements PolizasAttributes {
        public numPoliza!: string;
        public Telefono!: string;

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
            primaryKey: true,
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
