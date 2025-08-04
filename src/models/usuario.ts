import { DataTypes } from "sequelize";
import sequelize from "../db/connection";

export const Usuario = sequelize.define('t_usuario', {
    id : {
        type : DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuario: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    estado: {
        type: DataTypes.STRING
    },
    id_rol: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_empresa: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: true
    },
    apellido: {
        type: DataTypes.STRING,
        allowNull: true
    }
})