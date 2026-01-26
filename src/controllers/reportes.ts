
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

// ================================
// Función para obtener el idEmpresa desde el token
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

export const getReporteVacunacion = async (req: Request, res: Response) => {
    console.log("getReporteVacunacion");

    const idUsuario = getIdUsuarioDesdeToken(req);
    const idEmpresa = getIdEmpresaDesdeToken(req);
    const fechaInicio = req.body.fecha_inicio;
    const fechaFin = req.body.fecha_fin;
    const idPaciente = req.body.paciente;

    if (!idUsuario || !idEmpresa) {
        res.status(401).json({
            msg: "Token inválido o NO enviado.",
            state: "NO_OK",
            body: null,
        });
    } else {

        try {
            const results = await sequelize.query(
                `
                SELECT 
                    EXTRACT(YEAR FROM r.fecha_registro) AS anio_vacunacion,
                    EXTRACT(MONTH FROM r.fecha_registro) AS mes_vacunacion,
                    r.aplica_acudiente,
                    r.acudiente,
                    CONCAT(p.nombres, ' ', p.apellidos) AS nombre_paciente,
                    p.tipo_documento,
                    p.numero_documento,
                    p.fecha_nacimiento,
                    p.sexo,
                    p.telefono_contacto,
                    p.correo_electronico,
                    v.nombre_vacuna,
                    r.fecha_registro AS fecha_vacunacion,
                    rv.registro_sanitario_vacuna AS lote_vacuna_aplicada,
                    rv.dosis_aplicada,
                    EXTRACT(YEAR FROM AGE(r.fecha_registro, p.fecha_nacimiento))::int || ' años ' ||
                    EXTRACT(MONTH FROM AGE(r.fecha_registro, p.fecha_nacimiento))::int || ' meses ' ||
                    EXTRACT(DAY FROM AGE(r.fecha_registro, p.fecha_nacimiento))::int || ' días' AS edad_vacuna
                FROM t_registro_vacunacions r
                JOIN t_registro_vacunacion_vacunas rv 
                    ON r.id_vacunacion = rv.id_vacunacion
                JOIN t_vacunas v 
                    ON rv.id_vacuna = v.id
                JOIN t_pacientes p 
                    ON p.id_paciente = r.id_paciente
                WHERE 
                    r.estado = 'A'
                    AND (
                        r.id_usuario = :idUsuario
                        OR r.id_empresa = :idEmpresa
                    )
                    and (
                        :idPaciente is null
                        or r.id_paciente = :idPaciente
                    )
                    and r.fecha_registro between :fechaInicio and :fechaFin
                ORDER BY 
                    anio_vacunacion DESC,
                    mes_vacunacion DESC,
                    nombre_paciente
                `,
                {
                    replacements: {
                        idUsuario,
                        idEmpresa,
                        idPaciente,
                        fechaInicio,
                        fechaFin
                    },
                    type: QueryTypes.SELECT
                }
            );

            res.json({
                msg: 'Get Reporte Vacunacion',
                state: 'OK',
                body: results
            });
        } catch (e) {
            res.json({
                msg: 'Get Reporte Vacunacion',
                state: 'NO_OK',
                body: e
            });
        }
    }
}

export const getReporteVacunasAplicadas = async (req: Request, res: Response) => {
    console.log("getReporteVacunasAplicadas");

    const idUsuario = getIdUsuarioDesdeToken(req);
    const idEmpresa = getIdEmpresaDesdeToken(req);
    const fechaInicio = req.body.fecha_inicio;
    const fechaFin = req.body.fecha_fin;
    const idVacuna = req.body.idVacuna;

    if (!idUsuario || !idEmpresa) {
        res.status(401).json({
            msg: "Token inválido o NO enviado.",
            state: "NO_OK",
            body: null,
        });
    } else {

        try {
            const results = await sequelize.query(
                `
                select 
                    extract(year from r.fecha_registro) anio_vacunacion,
                    extract(month from r.fecha_registro) mes_vacunacion,
                    r.fecha_registro as fecha_vacunacion,
                    v.nombre_vacuna,
                    l.nombre as nombre_laboratorio,
                    v.cantidad_dosis as cantidad_dosis_parametrizada,
                    rv.registro_sanitario_vacuna as lote_vacuna_aplicada,
                    rv.dosis_aplicada
                from t_registro_vacunacions r
                join t_registro_vacunacion_vacunas rv 
                    on r.id_vacunacion = rv.id_vacunacion
                join t_vacunas v 
                    on rv.id_vacuna = v.id 
                join t_laboratorios l 
                    on l.id = v.id_laboratorio
                where 
                    r.estado = 'A'
                    and (
                        r.id_usuario = :idUsuario 
                        OR r.id_empresa = :idEmpresa
                    )
                    and (
                        :idVacuna is null
                        or v.id = :idVacuna
                    )
                    and r.fecha_registro between :fechaInicio and :fechaFin
                order by 
                    r.fecha_registro desc,
                    v.nombre_vacuna asc
                `,
                {
                    replacements: {
                        idUsuario,
                        idEmpresa,
                        idVacuna,
                        fechaInicio,
                        fechaFin
                    },
                    type: QueryTypes.SELECT
                }
            );

            res.json({
                msg: 'Get Reporte Vacunas Aplicadas',
                state: 'OK',
                body: results
            });
        } catch (e) {
            res.json({
                msg: 'Get Reporte Vacunas Aplicadas',
                state: 'NO_OK',
                body: e
            });
        }
    }
}
