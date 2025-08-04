import { Request, Response } from "express";
import { RegistroRecoleccion } from "../models/registro_recoleccion";
import { Usuario } from "../models/usuario";
import { Op } from 'sequelize';

export const getRegistrosRecoleccion = async (req: Request, res: Response) => {
    console.log("getRegistrosRecoleccion");

    try {
        const idUsuario = req.body.id_usuario;

        const usuarioEnviado = await Usuario.findOne({
            where : {
                id : idUsuario
            }
        });

        const registros = await RegistroRecoleccion.findAll({
            where: {
                [Op.or]: [
                    { id_usuario: idUsuario },
                    { id_empresa: usuarioEnviado?.getDataValue('id_empresa')}
                ],
            },
            order: [
                // Will escape title and validate DESC against a list of valid direction parameters
                ['fecha_registro',   'DESC']
            ]
        });

        res.json({
            msg: 'Get Registros Recolección',
            state: 'OK',
            body: registros
        });
    } catch (e) {
        res.json({
            msg: 'Get Registros Recolección',
            state: 'NO_OK',
            body: e
        });
    }
};

export const borrarRegistroRecoleccion = async (req: Request, res: Response) => {
    console.log("borrarRegistroRecoleccion");

    const idRegistro = req.body.id_registropeso;

    try {
        const registroExiste = await RegistroRecoleccion.findByPk(idRegistro);

        if (!registroExiste) {
            res.json({
                msg: 'Delete REGISTRO RECOLECCIÓN',
                state: 'NO_OK',
                body: `Registro con ID: ${idRegistro} NO existe`
            });
        } else {
            await RegistroRecoleccion.update(
                {
                    // Actualizamos el estado a I
                    estado : 'I'
                },
                {
                    // Por la condicion de la llave
                    where : {
                        id_registropeso : idRegistro
                    }
                }
            )

            res.json({
                msg: 'Delete REGISTRO RECOLECCIÓN',
                state: 'OK',
                body: 'Registro eliminado correctamente.'
            });
        }
    } catch (e) {
        res.json({
            msg: 'Delete REGISTRO RECOLECCIÓN',
            state: 'NO_OK',
            body: e
        });
    }
};

export const crearActualizarRegistroRecoleccion = async (req: Request, res: Response) => {
    console.log("crearActualizarRegistroRecoleccion");

    try {
        const idRegistro = req.body.id_registropeso;

        const registro: any = {
            fecha_registro: req.body.fecha_registro,
            id_consultorio: req.body.id_consultorio,
            aprovechables: req.body.aprovechables,
            no_aprovechables: req.body.no_aprovechables,
            biosanitarios: req.body.biosanitarios,
            cortopunzantes_ng: req.body.cortopunzantes_ng,
            cortopunzantes_k: req.body.cortopunzantes_k,
            anatomopatologicos: req.body.anatomopatologicos,
            farmacos: req.body.farmacos,
            chatarra_electronica: req.body.chatarra_electronica,
            pilas: req.body.pilas,
            quimicos: req.body.quimicos,
            iluminarias: req.body.iluminarias,
            aceites_usados: req.body.aceites_usados,
            bolsas_g: req.body.bolsas_g,
            bolsas_b: req.body.bolsas_b,
            bolsas_r: req.body.bolsas_r,
            bolsas_n: req.body.bolsas_n,
            pret_usado: req.body.pret_usado,
            dias_almacenamiento: req.body.dias_almacenamiento,
            tratamiento: req.body.tratamiento,
            hora_roja: req.body.hora_roja,
            hora_negra: req.body.hora_negra,
            dotacion_perso_adecuada: req.body.dotacion_perso_adecuada,
            dotacion_pers_pseg_adecuada: req.body.dotacion_pers_pseg_adecuada,
            blob_firma: req.body.blob_firma,
            id_usuario: req.body.id_usuario,
            id_empresa: req.body.id_empresa,
            estado: 'A'
        };

        console.log(registro)

        if (idRegistro) {
            const existe = await RegistroRecoleccion.findByPk(idRegistro);

            if (!existe) {
                res.json({
                    msg: 'Actualizar REGISTRO RECOLECCIÓN',
                    state: 'NO_OK',
                    body: `No existe el registro con ID: ${idRegistro}`
                });
                return;
            }

            await RegistroRecoleccion.update(registro, {
                where: { id_registropeso: idRegistro }
            });

            res.json({
                msg: 'Actualizar REGISTRO RECOLECCIÓN',
                state: 'OK',
                body: 'Registro actualizado correctamente.'
            });
        } else {
            await RegistroRecoleccion.create(registro);

            res.json({
                msg: 'Crear REGISTRO RECOLECCIÓN',
                state: 'OK',
                body: 'Registro creado correctamente.'
            });
        }

    } catch (e) {
        res.json({
            msg: 'Crear/Actualizar REGISTRO RECOLECCIÓN',
            state: 'NO_OK',
            body: e
        });
    }
};

