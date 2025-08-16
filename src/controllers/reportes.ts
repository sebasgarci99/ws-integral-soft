
import sequelize from "../db/connection";
import { Request, Response } from "express"

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
