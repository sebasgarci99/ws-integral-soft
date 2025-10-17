import { DataTypes } from "sequelize";
import sequelize from "../db/connection";

export const AntecedenteMedico = sequelize.define('t_antecedentes_medicos', {
    id_antecedente: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    enfermedades_actuales: {
        type: DataTypes.TEXT // Texto libre
    },
    uso_medicamentos: {
        type: DataTypes.TEXT // Texto libre
    },
    esta_embarazada: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    esta_lactando: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    reacciones_previas_vacunas: {
        type: DataTypes.TEXT
    },
    alergias_graves: {
        type: DataTypes.TEXT // Texto libre (ej. lista separada por comas)
    },
    id_paciente: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_empresa: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_usuario: {
        type : DataTypes.INTEGER,
        allowNull: false
    }
});