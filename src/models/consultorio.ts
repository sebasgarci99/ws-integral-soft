import { DataTypes } from "sequelize";
import sequelize from "../db/connection";

export const Consultorio = sequelize.define('t_consultorio', {
    id : {
        type : DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    codigo: {
        type: DataTypes.STRING,
        unique: false,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.STRING,
        unique: false,
        allowNull: false
    },
    nombre_representante: {
        type: DataTypes.STRING,
        unique: false,
        allowNull: false
    },
    info_recoleccion: {
        type: DataTypes.STRING,
        unique: false,
        allowNull: false
    },
    piso_ubicacion: {
        type: DataTypes.STRING,
        unique: false,
        allowNull: false
    },
    aforo: {
        type: DataTypes.INTEGER,
        unique: false,
        allowNull: false
    },
    correo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    estado: {
        type: DataTypes.STRING
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_empresa: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
})