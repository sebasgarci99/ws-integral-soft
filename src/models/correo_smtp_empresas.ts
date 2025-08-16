import { DataTypes } from "sequelize";
import sequelize from "../db/connection";

export const CorreoSmtpEmpresa = sequelize.define('t_correo_smtp_empresas', {
    id_correo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    correo_electronico: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    password: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    puerto: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    host: {
        type: DataTypes.STRING(50), 
        allowNull: true
    },
    id_empresa: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    servicio: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
});
