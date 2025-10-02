import { Request, Response } from "express";
import { Consultorio } from "../models/consultorio";
import { Usuario } from "../models/usuario";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Op } from "sequelize";
import { ModuloxUsuario } from "../models/modxusuario";

export const getConsultorios = async (req: Request, res: Response) => {

    console.log("getConsultorios") 
    try {
        let idUsuario = req.body.id_usuario;

        const usuarioEnviado = await Usuario.findOne({
            where : {
                id : idUsuario
            }
        });

        let listConsultorios:any = [{}];

        // Si el usuario que ejecuta el WS es de rol CONSULTORIO
        // Solo listamos el consultorio de la persona
        if(usuarioEnviado && usuarioEnviado?.getDataValue('id_rol') == 3) {
            listConsultorios = await Consultorio.findAll({
                where: {
                    codigo: usuarioEnviado?.getDataValue('nombre'),
                    correo: usuarioEnviado?.getDataValue('apellido'),
                }
            });
        } else {
            listConsultorios = await Consultorio.findAll({
                where: {
                    [Op.or]: [
                        { id_usuario: idUsuario },
                        { id_empresa: usuarioEnviado?.getDataValue('id_empresa')}
                    ]
                },
                order: [
                    ['createdAt', 'DESC']
                ]
            });
        }

        res.json({
            msg: 'Get Consultorios',
            state: 'OK',
            body : listConsultorios
        })
    } catch(e) {
        res.json({
            msg: 'Get Consultorios',
            state: 'NO_OK',
            body: e
        })
    }

    
}

export const borrarConsultorio = async (req: Request, res: Response) => {
    console.log("borrarConsultorio")

    //const listConsultorios = await Consultorio.findAll();
    // console.log(listConsultorios)
    let codigoConsultorioBD = req.body.id_consultorio;

    // Procedemos con la actualizacion
    try {
        let consultorioExiste = await Consultorio.findAll({
            where : {
                id : codigoConsultorioBD
            }
        });

        if(consultorioExiste.length == 0) {
            res.json({
                msg: 'Delete CONSULTORIO',
                state: 'NO_OK',
                body: ' Consultorio cod: '+codigoConsultorioBD+ ', NO Existe'
            })
        } else {

            let usuarioExiste = await Usuario.findOne({
                where : { 
                    usuario : consultorioExiste[0]?.getDataValue('correo'),
                    estado : 'A'
                }
            });

            // Inactivamos el consultorio
            await Consultorio.update(
                {
                    // Actualizamos el estado a I
                    estado : 'I'
                },
                {
                    // Por la condicion de la llave
                    where : {
                        id : codigoConsultorioBD
                    }
                }
            );

            // Inactivamos el usuario
            await Usuario.update(
                {
                    // Actualizamos el estado a I
                    estado : 'I'
                },
                {
                    // Por la condicion de la llave
                    where : {
                        id : usuarioExiste?.getDataValue('id')
                    }
                }
            );

            res.json({
                msg: 'Delete CONSULTORIO',
                state: 'OK',
                body : 'OK'
            })
        }

    } catch(e) {
        // Retornamos el mensaje de error
        res.json({
            msg: 'Delete CONSULTORIO',
            state: 'NO_OK',
            body : e
        })
    }
    
}

export const crearActualizarConsultorio = async (req: Request, res: Response) => {
    console.log("crearActualizarConsultorio")

    // Procedemos con la actualizacion
    try {
        let codigoConsultorioBD = req.body.id_consultorio;

        let consultorio:any = {};
        consultorio = {
            codigo : req.body.codigo,
            descripcion : req.body.descripcion,
            nombre_representante : req.body.nombre_representante,
            info_recoleccion : req.body.info_recoleccion,
            piso_ubicacion : req.body.piso_ubicacion,
            aforo : req.body.aforo,
            correo : req.body.correo,
            estado : req.body.estado,
            id_usuario: req.body.id_usuario,
            id_empresa: req.body.id_empresa
        }

        // Validar si el correo ya está en otro consultorio de otra empresa
        let correoExistenteOtraEmpresa = await Consultorio.findOne({
             where: {
                [Op.or]: [
                    // Caso 1: correo en otra empresa
                    {
                        correo: consultorio.correo,
                        id_empresa: { [Op.ne]: consultorio.id_empresa }
                    },
                    // Caso 2: correo en misma empresa pero con nombre distinto
                    {
                        correo: consultorio.correo,
                        id_empresa: consultorio.id_empresa,
                        codigo: { [Op.ne]: `${consultorio.codigo}` }
                    }
                ]
            }
        });

        console.log("-----------------------------------------------")

        if (correoExistenteOtraEmpresa) {
            res.json({
                msg: 'Crear/Actualizar CONSULTORIO',
                state: 'NO_OK',
                body: `El correo ${consultorio.correo} ya está registrado con otra empresa o en otro consultorio.`
            });
        } else {

            // Si el correo del consultorio a crear NO existe, continuamos el flujo
            // Validamos si el usuario del consultorio ya existe
            let usuarioExiste = await Usuario.findOne({
                where : { 
                    [Op.or]: [
                        { usuario: consultorio.correo },
                        { nombre: `${consultorio.codigo}` }
                    ],
                    estado : 'A'
                }
            });

            const passwordEncryConsultorio = await bcrypt.hash(
                consultorio.codigo+consultorio.correo,
                12
            );

            // Si envian el id del consultorio, se procede a actualizar
            if(codigoConsultorioBD != null && codigoConsultorioBD != '') {
                console.log("Actualizar CONSULTORIO")
                let existeConsultorio = await Consultorio.findAll({
                    where : {
                        id : codigoConsultorioBD
                    }
                });

                if(existeConsultorio.length == 0) {
                    res.json({
                        msg: 'Crear/Actualizar CONSULTORIO',
                        state: 'NO_OK',
                        body : 'NO existe el consultorio con ID: '+codigoConsultorioBD
                    })
                }

                // Actualizamos el consultorio
                await Consultorio.update(
                    {
                        codigo : consultorio.codigo,
                        descripcion : consultorio.descripcion,
                        nombre_representante : consultorio.nombre_representante,
                        info_recoleccion : consultorio.info_recoleccion,
                        piso_ubicacion : consultorio.piso_ubicacion,
                        aforo : consultorio.aforo,
                        correo : consultorio.correo,
                        id_usuario: consultorio.id_usuario
                    },
                    {
                        where : {
                            id : codigoConsultorioBD
                        }
                    }
                ); 

                console.log(consultorio.correo);
                console.log(passwordEncryConsultorio);
                console.log(usuarioExiste);
                    
                // De una vez actualizamos el usuario
                await Usuario.update(
                    {
                        usuario : consultorio.correo,
                        apellido : consultorio.correo,
                        password : passwordEncryConsultorio
                    },
                    {
                        where : {
                            id : usuarioExiste?.getDataValue('id')
                        }
                    }
                );

                res.json({
                    msg: 'Actualizar CONSULTORIO',
                    state: 'OK',
                    body : 'Consultorio actualizado correctamente.'
                })

            } else {
                console.log("Crear CONSULTORIO")
                // Si no envian el ID, se procede a INSERTAR
                await Consultorio.create({
                    codigo : consultorio.codigo,
                    descripcion : consultorio.descripcion,
                    nombre_representante : consultorio.nombre_representante,
                    info_recoleccion : consultorio.info_recoleccion,
                    piso_ubicacion : consultorio.piso_ubicacion,
                    aforo : consultorio.aforo,
                    correo : consultorio.correo,
                    estado : consultorio.estado,
                    id_usuario: consultorio.id_usuario,
                    id_empresa: consultorio.id_empresa
                });

                // De una vez actualizamos el usuario de CONSULTORIO
                let usuarioCreado = await Usuario.create(
                    {
                        usuario : consultorio.correo,
                        password : passwordEncryConsultorio,
                        estado: 'A',
                        id_rol: 3, // Siempre va a ser 3
                        id_empresa: consultorio.id_empresa,
                        nombre : consultorio.codigo,
                        apellido : consultorio.correo
                    }
                );

                // Y el respectivo permiso al modulo 3 de reportes
                await ModuloxUsuario.create({
                    id_modulo : 2,
                    id_usuario : usuarioCreado?.getDataValue('id')
                });

                res.json({
                    msg: 'Crear CONSULTORIO',
                    state: 'OK',
                    body : 'Consultorio creado correctamente.'
                })
            }            
        }

    } catch(e) {
        res.json({
            msg: 'Crear/Actualizar CONSULTORIO',
            state: 'NO_OK',
            body : e
        })
    };

    
}