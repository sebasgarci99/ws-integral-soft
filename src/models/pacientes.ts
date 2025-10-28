import { DataTypes } from "sequelize";
import sequelize from "../db/connection";

export const Paciente = sequelize.define('t_pacientes', {
    id_paciente: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombres: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    apellidos: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    tipo_documento: {
        type: DataTypes.STRING(10), // Ej: 'CC', 'TI', 'CE'
        allowNull: false
    },
    numero_documento: {
        type: DataTypes.STRING(30),
        unique: true,
        allowNull: false
    },
    fecha_nacimiento: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    sexo: {
        type: DataTypes.STRING(1), // Ej: 'F', 'M', 'O'
        allowNull: false
    },
    direccion_residencia: {
        type: DataTypes.STRING(250),
        allowNull: false
    },
    municipio_residencia: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    telefono_contacto: {
        type: DataTypes.STRING(20) // Nullable
    },
    correo_electronico: {
        type: DataTypes.STRING(50) // Nullable
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