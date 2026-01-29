import { DataTypes } from "sequelize";
import sequelize from "../db/connection";

export const RegistroTemperatura = sequelize.define(
    "t_registro_temperatura",
    {
        id_registro: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        area: {
            type: DataTypes.STRING,
            allowNull: true
        },
        responsable: {
            type: DataTypes.STRING,
            allowNull: true
        },
        horario: {
            type: DataTypes.STRING,
            allowNull: true
        },
        temperatura: {
            type: DataTypes.DECIMAL,
            allowNull: true
        },
        humedad: {
            type: DataTypes.DECIMAL,
            allowNull: true
        },
        tipo_medida: {
            type: DataTypes.STRING,
            allowNull: true
        },
        fecha_registro: {
            type: DataTypes.DATE,
            allowNull: true
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        id_empresa: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }
);
