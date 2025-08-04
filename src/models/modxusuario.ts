import { DataTypes } from "sequelize";
import sequelize from "../db/connection";

export const ModuloxUsuario = sequelize.define('t_modxusuarios', {
    id_modxusua : {
        type : DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_modulo : {
        type : DataTypes.INTEGER
    },
    id_usuario : {
        type : DataTypes.INTEGER
    }
});