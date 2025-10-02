import { DataTypes } from "sequelize";
import sequelize from "../db/connection";

export const Laboratorio = sequelize.define('t_laboratorio', {
    id : {
        type : DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING
    },
    estado: {
        type: DataTypes.STRING
    }
})