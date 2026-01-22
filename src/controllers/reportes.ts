
import { QueryTypes } from "sequelize";
import sequelize from "../db/connection";
import { Request, Response } from "express"
import jwt from "jsonwebtoken";

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

// Si tu consulta es GET
export const getReportTotalizado = async (req: Request, res: Response) => {
    console.log("getReportTotalizado");

    const idUsuario = req.body.id_usuario;
    const fechaInico = req.body.fecha_inicio;
    const fechaFin = req.body.fecha_fin;
    const consultorio = req.body.consultorio;

    try {
        const [results, metadata] = await sequelize.query(`
            select 
                codigo,
                no_aprovechables,
                biosanitarios,
                cortopunzantes_ng,
                cortopunzantes_k,
                anatomopatologicos,
                farmacos,
                chatarra_electronica,
                pilas,
                quimicos,
                iluminarias,
                total
            from 
                f_obtener_totalizado_registro_peso(
                    ${idUsuario},
                    '${fechaInico}'::date,
                    '${fechaFin}'::date,
                    ${consultorio}
                )
        `);

        res.json({
            msg: 'Get Reporte',
            state: 'OK',
            body: results
        });
    } catch (e) {
        res.json({
            msg: 'Get Reporte',
            state: 'NO_OK',
            body: e
        });
    }
};

export const getReportDetallado = async (req: Request, res: Response) => {
    console.log("getReportDetallado");

    const idUsuario = req.body.id_usuario;
    const fechaInico = req.body.fecha_inicio;
    const fechaFin = req.body.fecha_fin;
    const consultorio = req.body.consultorio;

    try {
        const [results, metadata] = await sequelize.query(`
            select 
                codigo,
                fecha,
                no_aprovechables,
                biosanitarios,
                cortopunzantes_ng,
                cortopunzantes_k,
                anatomopatologicos,
                farmacos,
                chatarra_electronica,
                pilas,
                quimicos,
                iluminarias,
                total
            from 
                f_obtener_detalle_registro_peso(
                    ${idUsuario},
                    '${fechaInico}'::date,
                    '${fechaFin}'::date,
                    ${consultorio}
                )
        `);

        res.json({
            msg: 'Get Reporte',
            state: 'OK',
            body: results
        });
    } catch (e) {
        res.json({
            msg: 'Get Reporte',
            state: 'NO_OK',
            body: e
        });
    }
};

export const getReporteMesGraficas = async (req: Request, res: Response) => {
    console.log("getReporteMesGraficas");

    const idUsuario = req.body.id_usuario;

    try {
        const [results, metadata] = await sequelize.query(`
            select *
            from f_obtener_resumen_mensual_pesos(
                ${idUsuario}
            )
        `);

        res.json({
            msg: 'Get Reporte Mes a Mes x Anio',
            state: 'OK',
            body: results
        });
    } catch (e) {
        res.json({
            msg: 'Get Reporte Mes a Mes x Anio',
            state: 'NO_OK',
            body: e
        });
    }
}

export const getReporteMesActualGraficas = async (req: Request, res: Response) => {
    console.log("getReporteMesActualGraficas");

    const idUsuario = req.body.id_usuario;

    try {
        const [results, metadata] = await sequelize.query(`
            select *
            from f_obtener_total_mes_pesos(
                ${idUsuario}
            )
        `);

        res.json({
            msg: 'Get Reporte Mes actual',
            state: 'OK',
            body: results
        });
    } catch (e) {
        res.json({
            msg: 'Get Reporte Mes actual',
            state: 'NO_OK',
            body: e
        });
    }
}

export const getReporteMesConsultorioGraficas = async (req: Request, res: Response) => {
    console.log("getReporteMesConsultorioGraficas");

    const idUsuario = req.body.id_usuario;

    try {
        const [results, metadata] = await sequelize.query(`
            select *
            from f_obtener_balance_x_consultorio_x_mes(
                ${idUsuario}
            )
        `);

        res.json({
            msg: 'Get Reporte Mes x Consultorio',
            state: 'OK',
            body: results
        });
    } catch (e) {
        res.json({
            msg: 'Get Reporte Mes x Consultorio',
            state: 'NO_OK',
            body: e
        });
    }
}

export const getReporteGraficaxUsuario = async (req: Request, res: Response) => {
    console.log("getReporteGraficaxUsuario");

    const idUsuario = getIdUsuarioDesdeToken(req);

    if (!idUsuario) {
        res.status(401).json({
            msg: "Token inválido o NO enviado.",
            state: "NO_OK",
            body: null,
        });
    } else {
        try {
            const [graficas] = await sequelize.query(
                'SELECT fn_graficas_por_usuario(:idUsuario) AS graficas',
                {
                    replacements: { idUsuario: idUsuario },
                    type: QueryTypes.SELECT
                }
            );

            res.json({
                msg: 'Get Reportes x Usuario',
                state: 'OK',
                body: graficas
            });
        } catch (e) {
            res.json({
                msg: 'Get Reportes x Usuario',
                state: 'NO_OK',
                body: e
            });
        }
    }
}
