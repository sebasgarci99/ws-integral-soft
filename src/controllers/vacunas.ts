import { Request, Response } from "express";
import { Vacunas } from "../models/vacunas";
import { Usuario } from "../models/usuario";
import { Op } from "sequelize";
import jwt from "jsonwebtoken"; // para decodificar el token
import { Laboratorio } from "../models/laboratorio";

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
// GET - listar vacunas
// ================================
export const getVacunas = async (req: Request, res: Response) => {
    console.log("getVacunas");

    try {
        console.log("token")
        const idUsuario = getIdUsuarioDesdeToken(req);
        
        if (!idUsuario) {
            res.status(401).json({
                msg: "Token inválido o NO enviado.",
                state: "NO_OK",
                body: null,
            });
        } else {

            // Info del usuario enviado en el token
            const usuarioEnviado = await Usuario.findOne({
                where: { 
                    id: idUsuario 
                }
            });

            const dataVacunas = await Vacunas.findAll({
                where: {
                    [Op.or]: [
                        { id_usuario: idUsuario },
                        { id_empresa: usuarioEnviado?.getDataValue("id_empresa") },
                    ],
                }
            });

            res.json({
                msg: "Get Vacunas",
                state: "OK",
                body: dataVacunas,
            });

        }
    } catch (e) {
        res.json({
            msg: "Get Vacunas",
            state: "NO_OK",
            body: e,
        });
    }
};

// ================================
// DELETE (lógico) - marcar vacuna como inactiva
// ================================
export const borrarVacuna = async (req: Request, res: Response) => {
    console.log("borrarVacuna");

    if (!getIdUsuarioDesdeToken(req)) {
        res.status(401).json({
            msg: "Token inválido o NO enviado.",
            state: "NO_OK",
            body: null,
        });
    } else {
        const idVacuna = req.body.id_vacuna;

        try {
            const vacunaExiste = await Vacunas.findByPk(idVacuna);

            if (!vacunaExiste) {
                res.json({
                    msg: "Delete Vacuna",
                    state: "NO_OK",
                    body: `Vacuna con ID: ${idVacuna} NO existe`,
                });
            } else {
                await Vacunas.update(
                    { estado: "I" },
                    { where: { id: idVacuna } }
                );

                res.json({
                    msg: "Delete Vacuna",
                    state: "OK",
                    body: "Vacuna eliminada correctamente.",
                });
            }
        } catch (e) {
            res.json({
                msg: "Delete Vacuna",
                state: "NO_OK",
                body: e,
            });
        }   
    }
};

// ================================
// POST/PUT - crear o actualizar vacuna
// ================================
export const crearActualizarVacuna = async (req: Request, res: Response) => {
    console.log("crearActualizarVacuna");

    try {
        const idUsuario = getIdUsuarioDesdeToken(req);
        if (!idUsuario) {
            res.status(401).json({
                msg: "Token inválido o ausente",
                state: "NO_OK",
                body: null,
            });
        } else {
            const idVacuna = req.body.id_vacuna;

            const vacuna: any = {
                nombre_vacuna: req.body.nombre_vacuna,
                presentacion_comercial: req.body.presentacion_comercial,
                principio_activo: req.body.principio_activo,
                concentracion: req.body.concentracion,
                unidad_medida: req.body.unidad_medida,     
                fecha_lote: req.body.fecha_lote,
                fecha_vencimiento: req.body.fecha_vencimiento,  
                id_laboratorio: req.body.id_laboratorio,
                registro_sanitario: req.body.registro_sanitario,
                cantidad_dosis: req.body.cantidad_dosis,
                id_usuario: idUsuario,
                id_empresa: req.body.id_empresa,
                estado: "A",
            };

            if (idVacuna) {
                const existe = await Vacunas.findByPk(idVacuna);

                if (!existe) {
                    res.json({
                        msg: "Actualizar Vacuna",
                        state: "NO_OK",
                        body: `No existe la vacuna con ID: ${idVacuna}`,
                    });
                    return;
                }

                await Vacunas.update(vacuna, {
                    where: { id: idVacuna },
                });

                res.json({
                    msg: "Actualizar Vacuna",
                    state: "OK",
                    body: "Vacuna actualizada correctamente.",
                });
            } else {
                await Vacunas.create(vacuna);

                res.json({
                    msg: "Crear Vacuna",
                    state: "OK",
                    body: "Vacuna creada correctamente.",
                });
            }   
        }
    } catch (e) {
        res.json({
            msg: "Crear/Actualizar Vacuna",
            state: "NO_OK",
            body: e,
        });
    }
};

// ================================
// GET - listar laboratorios
// ================================
export const getLaboratorios = async (req: Request, res: Response) => {
    console.log("getLaboratorios");

    try {
        console.log("token")
        const idUsuario = getIdUsuarioDesdeToken(req);
        
        if (!idUsuario) {
            res.status(401).json({
                msg: "Token inválido o NO enviado.",
                state: "NO_OK",
                body: null,
            });
        } else {

            // Info del usuario enviado en el token
            const usuarioEnviado = await Usuario.findOne({
                where: { 
                    id: idUsuario 
                }
            });

            const dataLab = await Laboratorio.findAll();

            res.json({
                msg: "Get Labotarios",
                state: "OK",
                body: dataLab,
            });

        }
    } catch (e) {
        res.json({
            msg: "Get Labotarios",
            state: "NO_OK",
            body: e,
        });
    }
};
