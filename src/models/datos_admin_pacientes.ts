import { DataTypes } from "sequelize";
import sequelize from "../db/connection";

export const DatoAdministrativo = sequelize.define('t_datos_admin_pacientes', {
    id_data_admin: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    eps: {
        type: DataTypes.STRING(150)
    },
    tipo_poblacion: {
        type: DataTypes.STRING(20), // Ej: 'contributivo', 'subsidiado', 'especial'
        allowNull: false
    },
    nombre_acompanante: {
        type: DataTypes.STRING(200)
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
} );