import { DataTypes } from "sequelize";
import sequelize from "../db/connection";

export const RegVacunacionVacunas = sequelize.define('t_registro_vacunacion_vacunas', {
    id_regvacunas: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_vacunacion: {
        type: DataTypes.INTEGER,
        allowNull: false
    }, 
    id_vacuna: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_empresa: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    id_usuario: {
        type : DataTypes.INTEGER,
        allowNull: true
    }
});