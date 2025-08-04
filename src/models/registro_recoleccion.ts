import { DataTypes } from "sequelize";
import sequelize from "../db/connection";

export const RegistroRecoleccion = sequelize.define('t_registro_recoleccion', {
    id_registropeso: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    fecha_registro: {
        type: DataTypes.DATE,
        allowNull: false
    },
    id_consultorio: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    aprovechables: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true
    },
    no_aprovechables: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true
    },
    biosanitarios: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true
    },
    cortopunzantes_ng: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true
    },
    cortopunzantes_k: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true
    },
    anatomopatologicos: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true
    },
    farmacos: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true
    },
    chatarra_electronica: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true
    },
    pilas: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true
    },
    quimicos: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true
    },
    iluminarias: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true
    },
    aceites_usados: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true
    },
    bolsas_g: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    bolsas_n: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    bolsas_b: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    bolsas_r: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    pret_usado: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    dias_almacenamiento: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    tratamiento: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    hora_roja: {
        type: DataTypes.TIME,
        allowNull: true
    },
    hora_negra: {
        type: DataTypes.TIME,
        allowNull: true
    },
    dotacion_perso_adecuada: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    dotacion_pers_pseg_adecuada: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    blob_firma: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    estado: {
        type: DataTypes.STRING(1),
        allowNull: true
    },
    id_empresa: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});
