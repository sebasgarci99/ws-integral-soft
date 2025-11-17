import { DataTypes } from "sequelize";
import sequelize from "../db/connection";

export const Doc_Consentimiento = sequelize.define('t_doc_consentimiento', {
    id_consentimiento: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_vacunacion: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    nombre_paciente: {
        type: DataTypes.STRING,
        allowNull: false
    },
    num_documento_paciente: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    nombre_acudiente: {
        type: DataTypes.STRING,
        allowNull: true
    },
    num_documento_acudiente: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    aplica_acudiente : {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    fecha_registro : {
        type: DataTypes.DATE,
        allowNull: true
    },
    firma_digital_paciente : {
        type: DataTypes.TEXT
    },
    firma_digital_usuario : {
        type: DataTypes.TEXT
    },
    logo_empresa : {
        type: DataTypes.TEXT
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