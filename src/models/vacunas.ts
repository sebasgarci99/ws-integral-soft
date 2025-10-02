import { DataTypes } from "sequelize";
import sequelize from "../db/connection";

export const Vacunas = sequelize.define('t_vacuna', {
    id : {
        type : DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre_vacuna: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true
    },
    presentacion_comercial: {
        type: DataTypes.STRING,
        allowNull: true
    },
    principio_activo :  {
        type: DataTypes.STRING,
        allowNull: true
    },
    concentracion : {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true
    },
    unidad_medida : {
        type: DataTypes.STRING,
        allowNull: true
    },
    fecha_lote : {
        type: DataTypes.DATE,
        allowNull: true
    },
    fecha_vencimiento : {
        type: DataTypes.DATE,
        allowNull: true
    },
    id_laboratorio: {
        type : DataTypes.INTEGER,
        allowNull: true
    },
    registro_sanitario: {
        type : DataTypes.INTEGER,
        allowNull: true
    },
    cantidad_dosis: {
        type : DataTypes.INTEGER,
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
})