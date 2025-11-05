import { Request, Response } from "express";

import { Paciente } from "../models/pacientes";
import { AntecedenteMedico } from "../models/antecedentes_medicos";
import { DatoAdministrativo } from "../models/datos_admin_pacientes";

import sequelize from "../db/connection";
import { Op } from "sequelize";
import jwt from "jsonwebtoken"; // para decodificar el token


// ================================
// Función para obtener el idUser desde el token
// ================================
const getIdUsuarioDesdeToken = (req: Request): number | null => {
    const headerToken = req.headers["authorization"];

    if (!headerToken) return null;

    // Capturamos exclusivamente el token quitando "Bearer "
    const bearerToken = headerToken.slice(7);

    try {
        const tokenDesencriptado: any = jwt.verify(
            bearerToken, 
            process.env.SECRET_KEY || 'pRu3b4_4sD1*2*3'
        );
        return tokenDesencriptado.idUser;
    } catch (error) {
        console.error("Error al decodificar el token:", error);
        return null;
    }
};

// ================================
// Función para obtener el idUser desde el token
// ================================
const getIdEmpresaDesdeToken = (req: Request): number | null => {
    const headerToken = req.headers["authorization"];

    if (!headerToken) return null;

    // Capturamos exclusivamente el token quitando "Bearer "
    const bearerToken = headerToken.slice(7);

    try {
        const tokenDesencriptado: any = jwt.verify(
            bearerToken, 
            process.env.SECRET_KEY || 'pRu3b4_4sD1*2*3'
        );
        return tokenDesencriptado.idEmpresa;
    } catch (error) {
        console.error("Error al decodificar el token:", error);
        return null;
    }
};

/**
 * Crea un nuevo paciente con sus datos de anamnesis.
 * Utiliza una transacción para asegurar la integridad de los datos en las tres tablas.
 */
export const crearPaciente = async (req: Request, res: Response) => {
    
    // Validamos que el token sea valido y vengan las llaves necesarias
    const idUsuario = getIdUsuarioDesdeToken(req);
    const idEmpresa = getIdEmpresaDesdeToken(req);

    if (!idUsuario || !idEmpresa) {
        res.status(401).json({
            msg: "Token inválido o ausente",
            state: "NO_OK",
            body: null,
        });

    } else {
        const t = await sequelize.transaction();

        try {
            const {
                // Datos de t_pacientes
                nombres, 
                apellidos, 
                tipo_documento, 
                numero_documento, 
                fecha_nacimiento, 
                sexo, 
                direccion_residencia, 
                municipio_residencia, 
                telefono_contacto,
                correo_electronico,
                
                // Datos de t_antecedentes_medicos
                enfermedades_actuales, 
                uso_medicamentos, 
                esta_embarazada, 
                esta_lactando, 
                reacciones_previas_vacunas, 
                alergias_graves,
                tiene_enfermedad_actual,
                es_alergico,
                tiene_fiebre_actual,
                padece_convulsiones,
                reaccion_vacuna,
                tenido_vacuna_ultsemanas,
                
                // Datos de t_datos_admin_pacientes
                eps, 
                tipo_poblacion, 
                nombre_acompanante
            } = req.body;

            // Verificar si el paciente ya existe por número de documento
            const pacienteExistente = await Paciente.findOne({
                where: { 
                    numero_documento,
                    [Op.or]: [
                        { id_usuario : idUsuario },
                        { id_empresa : idEmpresa }
                    ]
                    
                },
                transaction: t
            });

            if (pacienteExistente) {
                await t.rollback();
                res.status(409).json({
                    msg: 'Crear Paciente',
                    state: 'NO_OK',
                    body: `Ya existe un paciente con el número de documento: ${numero_documento}.`
                });

            } else {
                // 1. Crear el registro en la tabla Pacientes
                const nuevoPaciente = await Paciente.create({
                    nombres, 
                    apellidos, 
                    tipo_documento, 
                    numero_documento, 
                    fecha_nacimiento, 
                    sexo, 
                    direccion_residencia, 
                    municipio_residencia, 
                    telefono_contacto,
                    correo_electronico,
                    id_usuario : idUsuario,
                    id_empresa : idEmpresa
                }, { transaction: t });


                // 2. Crear el registro en la tabla de Antecedentes Médicos
                await AntecedenteMedico.create({
                    id_paciente: nuevoPaciente.getDataValue('id_paciente'),
                    enfermedades_actuales, 
                    uso_medicamentos, 
                    esta_embarazada, 
                    esta_lactando, 
                    reacciones_previas_vacunas, 
                    alergias_graves,
                    tiene_enfermedad_actual,
                    es_alergico,
                    tiene_fiebre_actual,
                    padece_convulsiones,
                    reaccion_vacuna,
                    tenido_vacuna_ultsemanas,
                    id_usuario : idUsuario,
                    id_empresa : idEmpresa
                }, { transaction: t });

                // 3. Crear el registro en la tabla de Datos Administrativos
                await DatoAdministrativo.create({
                    id_paciente: nuevoPaciente.getDataValue('id_paciente'),
                    eps, 
                    tipo_poblacion, 
                    nombre_acompanante,
                    id_usuario : idUsuario,
                    id_empresa : idEmpresa
                }, { transaction: t });

                await t.commit();

                res.json({
                    msg: 'Crear Paciente',
                    state: 'OK',
                    body: 'Paciente y datos de anamnesis creados correctamente.'
                });
            }

        } catch (error) {
            await t.rollback();
            console.error(error);
            res.status(500).json({
                msg: 'Crear Paciente',
                state: 'NO_OK',
                body: 'Error al crear el paciente.',
                error: error
            });
        }
    }
};

/**
 * Actualiza la información de un paciente y sus datos de anamnesis.
 * También utiliza una transacción.
 */
export const actualizarPaciente = async (req: Request, res: Response) => {

    // Validamos que el token sea valido y vengan las llaves necesarias
    const idUsuario = getIdUsuarioDesdeToken(req);
    const idEmpresa = getIdEmpresaDesdeToken(req);
    if (!idUsuario || !idEmpresa) {
        res.status(401).json({
            msg: "Token inválido o ausente",
            state: "NO_OK",
            body: null,
        });

    } else {
        const t = await sequelize.transaction();

        try {
            const { id_paciente } = req.body; // ID del paciente a actualizar
            const {
                // Datos a actualizar
                nombres, 
                apellidos, 
                tipo_documento, 
                numero_documento, 
                fecha_nacimiento, 
                sexo, 
                direccion_residencia, 
                municipio_residencia, 
                telefono_contacto,
                correo_electronico,

                // Datos de t_antecedentes_medicos
                enfermedades_actuales, 
                uso_medicamentos, 
                esta_embarazada, 
                esta_lactando, 
                reacciones_previas_vacunas, 
                alergias_graves,
                tiene_enfermedad_actual,
                es_alergico,
                tiene_fiebre_actual,
                padece_convulsiones,
                reaccion_vacuna,
                tenido_vacuna_ultsemanas,

                // Datos de t_datos_admin_pacientes
                eps, 
                tipo_poblacion, 
                nombre_acompanante
            } = req.body;

            const paciente = await Paciente.findByPk(id_paciente, { transaction: t });

            if (!paciente) {
                await t.rollback();
                res.status(404).json({
                    msg: 'Actualizar Paciente',
                    state: 'NO_OK',
                    body: `No se encontró un paciente con el ID: ${id_paciente}.`
                });

            } else {
                // 1. Actualizar el registro en la tabla Pacientes
                await paciente.update({
                    nombres, 
                    apellidos, 
                    tipo_documento, 
                    numero_documento, 
                    fecha_nacimiento, 
                    sexo, 
                    direccion_residencia, 
                    municipio_residencia, 
                    telefono_contacto,
                    correo_electronico
                }, { transaction: t });

                // 2. Actualizar el registro en la tabla de Antecedentes Médicos
                const antecedentes = await AntecedenteMedico.findOne(
                    { 
                        where: { id_paciente: id_paciente }, transaction: t 
                    }
                );
                if (antecedentes) {
                    await antecedentes.update({
                        enfermedades_actuales, 
                        uso_medicamentos, 
                        esta_embarazada, 
                        esta_lactando, 
                        reacciones_previas_vacunas, 
                        alergias_graves,
                        tiene_enfermedad_actual,
                        es_alergico,
                        tiene_fiebre_actual,
                        padece_convulsiones,
                        reaccion_vacuna,
                        tenido_vacuna_ultsemanas
                    }, { transaction: t });
                }

                // 3. Actualizar el registro en la tabla de Datos Administrativos
                const datosAdmin = await DatoAdministrativo.findOne(
                    { 
                        where: { id_paciente: id_paciente }, 
                        transaction: t 
                    }
                );
                if (datosAdmin) {
                    await datosAdmin.update({
                        eps, 
                        tipo_poblacion, 
                        nombre_acompanante
                    }, { transaction: t });
                }

                await t.commit();
                res.json({
                    msg: 'Actualizar Paciente',
                    state: 'OK',
                    body: 'Paciente y datos de anamnesis actualizados correctamente.'
                });
            }

        } catch (error) {
            await t.rollback();
            console.error(error);
            res.status(500).json({
                msg: 'Actualizar Paciente',
                state: 'NO_OK',
                body: 'Error al actualizar el paciente.',
                error: error
            });
        }
    }
};

/**
 * Lista todos los pacientes y sus datos de anamnesis.
 * Utiliza 'include' para traer datos de las tablas relacionadas.
 */
export const getPacientes = async (req: Request, res: Response) => {
    console.log("getPacientes");
    
    // Validamos que el token sea valido y vengan las llaves necesarias
    const idUsuario = getIdUsuarioDesdeToken(req);
    const idEmpresa = getIdEmpresaDesdeToken(req);
    if (!idUsuario || !idEmpresa) {
        res.status(401).json({
            msg: "Token inválido o ausente",
            state: "NO_OK",
            body: null,
        });

    } else {
        try {
            // Construimos las asociaciones de paciente con las tablas hijas
            Paciente.hasOne(AntecedenteMedico, { foreignKey: 'id_paciente' });
            Paciente.hasOne(DatoAdministrativo, { foreignKey: 'id_paciente' });

            // Y las tablas hijas con los pacientes
            AntecedenteMedico.belongsTo(Paciente, { foreignKey: 'id_paciente' });
            DatoAdministrativo.belongsTo(Paciente, { foreignKey: 'id_paciente' });
        
            // Construimos posteriormente al objeto de respuesta
            const listPacientes = await Paciente.findAll({
                include: [
                    { model: AntecedenteMedico },
                    { model: DatoAdministrativo }
                ],
                order: [
                    ['createdAt', 'DESC']
                ]
            });

            res.json({
                msg: 'Get Pacientes',
                state: 'OK',
                body: listPacientes
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                msg: 'Get Pacientes',
                state: 'NO_OK',
                body: 'Error al listar los pacientes.',
                error: error
            });
        }
    }
};

/**
 * Elimina (cambia de estado) un paciente.
 * Dado que no hay un campo 'estado' en la tabla, el borrado se considera como una eliminación lógica.
 * En este caso, simplemente se elimina el registro. Si necesitas un 'estado', se debe agregar al modelo.
 */
export const eliminarPaciente = async (req: Request, res: Response) => {
    // Validamos que el token sea valido y vengan las llaves necesarias
    const idUsuario = getIdUsuarioDesdeToken(req);
    const idEmpresa = getIdEmpresaDesdeToken(req);
    if (!idUsuario || !idEmpresa) {
        res.status(401).json({
            msg: "Token inválido o ausente",
            state: "NO_OK",
            body: null,
        });

    } else {
        const t = await sequelize.transaction();

        try {
            const { id_paciente } = req.body; // ID del paciente a eliminar

            const paciente = await Paciente.findByPk(id_paciente, { transaction: t });

            if (!paciente) {
                await t.rollback();
                res.status(404).json({
                    msg: 'Eliminar Paciente',
                    state: 'NO_OK',
                    body: `No se encontró un paciente con el ID: ${id_paciente}.`
                });

            } else {
                // Al usar onDelete: 'CASCADE', Sequelize eliminará automáticamente los registros
                // relacionados en las tablas de antecedentes y datos administrativos.
                await paciente.update({
                        estado : 'I' 
                    },
                    { transaction: t }
                );

                await t.commit();
                res.json({
                    msg: 'Eliminar Paciente',
                    state: 'OK',
                    body: 'Paciente inactivado correctamente.'
                });
            }

        } catch (error) {
            await t.rollback();
            console.error(error);
            res.status(500).json({
                msg: 'Eliminar Paciente',
                state: 'NO_OK',
                body: 'Error al eliminar el paciente.',
                error: error
            });
        }
    }
};