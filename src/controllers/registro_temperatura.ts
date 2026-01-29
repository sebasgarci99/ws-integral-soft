import { Request, Response } from "express";
import { RegistroTemperatura } from "../models/registro_temperatura";
import jwt from "jsonwebtoken";
import { Usuario } from "../models/usuario";
import { Op } from "sequelize";

// ================================
// Obtener idUsuario desde token
// ================================
const getIdUsuarioDesdeToken = (req: Request): number | null => {
    const headerToken = req.headers["authorization"];
    if (!headerToken) return null;

    const bearerToken = headerToken.slice(7);

    try {
        const tokenDesencriptado: any = jwt.verify(
            bearerToken,
            process.env.SECRET_KEY || "pRu3b4_4sD1*2*3"
        );
        return tokenDesencriptado.idUser;
    } catch (error) {
        console.error("Error token:", error);
        return null;
    }
};

// ================================
// GET - listar registros
// ================================
export const getRegistrosTemperatura = async (req: Request, res: Response) => {
    try {
        const idUsuario = getIdUsuarioDesdeToken(req);

        if (!idUsuario) {
            res.status(401).json({
                msg: "Token inválido o NO enviado.",
                state: "NO_OK",
                body: null
            });
        } else {
            // Info del usuario enviado en el token
            const usuarioEnviado = await Usuario.findOne({
                where: {
                    id: idUsuario
                }
            });

            const data = await RegistroTemperatura.findAll({
                order: [["id_registro", "DESC"]],
                where: {
                    [Op.or]: [
                        { id_usuario: idUsuario },
                        { id_empresa: usuarioEnviado?.getDataValue("id_empresa") },
                    ],
                }
            });

            res.json({
                msg: "Get Registro Temperatura",
                state: "OK",
                body: data
            });
        }
    } catch (e) {
        res.json({
            msg: "Get Registro Temperatura",
            state: "NO_OK",
            body: e
        });
    }
};

// ================================
// POST - crear registro
// ================================
export const crearRegistroTemperatura = async (req: Request, res: Response) => {
    try {
        const idUsuario = getIdUsuarioDesdeToken(req);

        if (!idUsuario) {
            res.status(401).json({
                msg: "Token inválido o ausente",
                state: "NO_OK",
                body: null
            });
        } else {
            const usuarioEnviado = await Usuario.findOne({
                where: {
                    id: idUsuario
                }
            });

            const registro = {
                area: req.body.area,
                responsable: req.body.responsable,
                horario: req.body.horario,
                temperatura: req.body.temperatura,
                humedad: req.body.humedad,
                tipo_medida: req.body.tipo_medida,
                fecha_registro: req.body.fecha,
                id_usuario: idUsuario,
                id_empresa: usuarioEnviado?.getDataValue("id_empresa")
            };

            await RegistroTemperatura.create(registro);

            res.json({
                msg: "Crear Registro Temperatura",
                state: "OK",
                body: "Registro creado correctamente."
            });

        }
    } catch (e) {
        res.json({
            msg: "Crear Registro Temperatura",
            state: "NO_OK",
            body: e
        });
    }
};

// ================================
// DELETE - eliminar registro
// ================================
export const eliminarRegistroTemperatura = async (req: Request, res: Response) => {
    try {
        const idUsuario = getIdUsuarioDesdeToken(req);

        if (!idUsuario) {
            res.status(401).json({
                msg: "Token inválido o NO enviado.",
                state: "NO_OK",
                body: null
            });
        }

        const idRegistro = req.body.id_registro;

        const existe = await RegistroTemperatura.findByPk(idRegistro);

        if (!existe) {
            res.json({
                msg: "Eliminar Registro",
                state: "NO_OK",
                body: `Registro con ID ${idRegistro} no existe`
            });
        }

        await RegistroTemperatura.destroy({
            where: { id_registro: idRegistro }
        });

        res.json({
            msg: "Eliminar Registro",
            state: "OK",
            body: "Registro eliminado correctamente."
        });
    } catch (e) {
        res.json({
            msg: "Eliminar Registro",
            state: "NO_OK",
            body: e
        });
    }
};
