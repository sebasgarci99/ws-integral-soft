import { DataTypes } from "sequelize";
import sequelize from "../db/connection";

export const RegVacunacion = sequelize.define('t_registro_vacunacion', {
    id_vacunacion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_paciente: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fecha_registro: {
        type: DataTypes.DATE,
        allowNull: false
    },
    aplica_acudiente : {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    acudiente: {
        type: DataTypes.STRING,
        allowNull: true
    },
    num_documento_acudiente: {
        type: DataTypes.STRING,
        allowNull: true
    },
    estado: {
        type: DataTypes.STRING
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