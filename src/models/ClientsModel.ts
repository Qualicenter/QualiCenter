import { Model, Sequelize } from 'sequelize';

interface ClientsAttributes {
    Id: number;
    nombre: string;
    Telefono: string;
    email: string;
}

module.exports = (sequelize: Sequelize, DataTypes: any) => {
    class Cliente extends Model<ClientsAttributes> implements ClientsAttributes {
        public Id!: number;
        public nombre!: string;
        public Telefono!: string;
        public email!: string;
    
        static associate(models: any) {
            this.hasMany(models.Poliza, { foreignKey: 'Telefono', as: 'poliza' });
        }
    }

    Cliente.init({
        Id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Telefono: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Cliente',
        indexes: [
            {
                unique: true,
                fields: ['Telefono']
            }
        ]
    });

    return Cliente;
}