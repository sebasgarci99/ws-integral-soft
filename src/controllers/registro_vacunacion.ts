import { Request, Response } from "express";
import { RegVacunacion } from "../models/registro_vacunacion";
import { RegVacunacionVacunas } from "../models/registro_vacunacion_vacunas";
import { Usuario } from "../models/usuario";


import jwt from "jsonwebtoken";
import sequelize from "../db/connection";
import { Op, QueryTypes } from "sequelize";
import { Vacunas } from "../models/vacunas";


// ================================
// Función para obtener el idUser desde el token
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

const crearDocumentoConsentimiento = async (idVacunacion: number, firma_digital: any): Promise<any | null> => {
    try {
        if (idVacunacion != 0 || idVacunacion != null) {
            let firma = firma_digital === null || firma_digital == 'null' ? '' : String(firma_digital);

            let sql = `
                INSERT INTO public.t_doc_consentimientos( 
                    id_vacunacion, 
                    nombre_paciente, 
                    num_documento_paciente, 
                    nombre_acudiente, 
                    num_documento_acudiente, 
                    aplica_acudiente, 
                    fecha_registro, 
                    firma_digital_paciente, 
                    firma_digital_usuario, 
                    logo_empresa, 
                    id_empresa, 
                    id_usuario,
                    vacunas_aplicadas,
                    ciudad,
                    nombre_personal,
                    r1_tiene_enfermedad_actual,
                    r2_es_alergico,
                    r3_tiene_fiebre_act,
                    r4_padece_convulsiones,
                    r5_reaccion_vacuna,
                    r6_tenido_vacuna_ultsemanas,
                    r7_esta_embarazada
                )
                select 
                    r.id_vacunacion,
                    concat(p.nombres, ' ', p.apellidos) as nombre_paciente,
                    p.numero_documento,
                    r.acudiente,
                    r.num_documento_acudiente,
                    r.aplica_acudiente,
                    current_timestamp, -- fecha registro 
                    :firma::text, -- firma digital paciente
                    NULL, -- u.firma_digital, -- firma digital usuario o empresa NOTA=Se deja en NULL para no generar tanto peso
                    null, -- e.logo_empresa, -- NOTA=Se deja en NULL para no generar tanto peso
                    r.id_empresa,
                    r.id_usuario,
                    STRING_AGG(v.nombre_vacuna, ', ') AS vacunas,
                    e.ciudad AS ciudad_empresa,
                    e.empresa AS personal, 
                    case 
                        when coalesce(ant.tiene_enfermedad_actual, false) 
                        then 'S' 
                        else 'N' 
                    end as tiene_enfermedad_actual, 
                    case 
                        when coalesce(ant.es_alergico, false) 
                        then 'S' 
                        else 'N' 
                    end as es_alergico, 
                    case 
                        when coalesce(ant.tiene_fiebre_actual, false) 
                        then 'S' 
                        else 'N' 
                    end as tiene_fiebre_actual, 
                    case 
                        when coalesce(ant.padece_convulsiones, false) 
                        then 'S' 
                        else 'N' 
                    end as padece_convulsiones,
                    case 
                        when coalesce(ant.reaccion_vacuna, false) 
                        then 'S' 
                        else 'N' 
                    end as reaccion_vacuna,
                    case 
                        when coalesce(ant.tenido_vacuna_ultsemanas, false) 
                        then 'S' 
                        else 'N' 
                    end as tenido_vacuna_ultsemanas,
                    case 
                        when coalesce(ant.esta_embarazada, false) 
                        then 'S' 
                        else 'N' 
                    end as esta_embarazada
                from t_registro_vacunacions r
                join t_registro_vacunacion_vacunas rv
                    on rv.id_vacunacion = r.id_vacunacion
                join t_pacientes p 
                    ON p.id_paciente = r.id_paciente
                join t_antecedentes_medicos ant
                    on ant.id_paciente = p.id_paciente
                join t_vacunas v 
                    on v.id = rv.id_vacuna
                join t_empresa e 
                    ON e.id_empresa = r.id_empresa
                join t_usuarios u 
                    ON u.id = r.id_usuario
                where 
                    r.id_vacunacion = :idVacunacion
                group by
                    r.id_vacunacion, 
                    p.nombres, 
                    p.apellidos, 
                    p.numero_documento,
                    r.acudiente, 
                    r.num_documento_acudiente,
                    e.ciudad, 
                    e.empresa,
                    p.nombres, 
                    p.apellidos,
                    u.firma_digital, -- firma digital usuario
                    e.logo_empresa,
                    r.id_empresa,
                    r.id_usuario,
                    ant.tiene_enfermedad_actual,
                    ant.es_alergico,
                    ant.tiene_fiebre_actual,
                    ant.padece_convulsiones,
                    ant.reaccion_vacuna,
                    ant.tenido_vacuna_ultsemanas,
                    ant.esta_embarazada
                RETURNING *;
            `;

            const result: any = await sequelize.query(
                sql,
                {
                    replacements: {
                        idVacunacion,
                        firma
                    },
                    type: QueryTypes.RAW
                }
            );

            const rows = result[0];
            if (rows && rows[0] && rows[0].id_consentimiento) {
                // Extraemos el HTML del consentimiento creado.
                sql = `
                    select f_procesar_datos_consentimiento(:idVacunacion);
                `;

                const resultDocConsentimiento: any = await sequelize.query(
                    sql,
                    {
                        replacements: {
                            idVacunacion
                        },
                        type: QueryTypes.SELECT,
                    }
                );

                return resultDocConsentimiento[0].f_procesar_datos_consentimiento;
            } else {
                console.log("No se inserto correctamente.");
            }

        }
    } catch (error) {
        console.error("Error al crear el registro de datos del consentimiento:", error);
        return null;
    }
}

// ================================
// GET - Listar registros con vacunas aplicadas
// ================================
export const getRegVacunaciones = async (req: Request, res: Response) => {
    console.log("getRegVacunaciones");

    try {
        const idUsuario = getIdUsuarioDesdeToken(req);
        if (!idUsuario) {
            res.status(401).json({
                msg: "Token inválido o NO enviado.",
                state: "NO_OK",
                body: null,
            });
        } else {

            const usuario = await Usuario.findByPk(idUsuario);
            const idEmpresa = usuario?.getDataValue("id_empresa");

            // SQL base
            let sql = `
                SELECT
                    rv.id_vacunacion,
                    rv.id_paciente,
                    rv.fecha_registro,
                    rv.aplica_acudiente,
                    rv.acudiente,
                    rv.estado,
                    rv.id_empresa,
                    rv.id_usuario,
                    rvv.id_regvacunas,
                    rvv.id_vacuna,
                    v.nombre_vacuna,
                    v.presentacion_comercial,
                    v.principio_activo,
                    v.concentracion,
                    v.unidad_medida,
                    v.fecha_lote,
                    v.fecha_vencimiento,
                    v.registro_sanitario,
                    v.cantidad_dosis
                FROM t_registro_vacunacions rv
                LEFT JOIN t_registro_vacunacion_vacunas rvv 
                    ON rv.id_vacunacion = rvv.id_vacunacion
                INNER JOIN t_vacunas v 
                    ON rvv.id_vacuna = v.id
                WHERE 
                    rv.estado = 'A'
                    AND (
                        rv.id_usuario = :idUsuario 
                        OR rv.id_empresa = :idEmpresa
                    )
                ORDER BY 
                    rv.fecha_registro DESC
            `;

            const registros = await sequelize.query(sql, {
                replacements: { idUsuario, idEmpresa },
                type: QueryTypes.SELECT,
            });

            res.json({
                msg: "Get Registros de Vacunación",
                state: "OK",
                body: registros
            });
        }
    } catch (error) {
        res.json({
            msg: "Get Registros de Vacunación",
            state: "NO_OK",
            body: error,
        });
    }
};

// ================================
// GET - Listar registro de vacunas aplicadas x paciente
// ================================
export const getRegVacunacionesxPaciente = async (req: Request, res: Response) => {
    console.log("getRegVacunacionesxPaciente");

    try {
        const idUsuario = getIdUsuarioDesdeToken(req);
        if (!idUsuario) {
            res.status(401).json({
                msg: "Token inválido o NO enviado.",
                state: "NO_OK",
                body: null,
            });
        } else {

            let usuario = await Usuario.findByPk(idUsuario);
            let idEmpresa = usuario?.getDataValue("id_empresa");
            let idPaciente = req.body.id_paciente;

            await sequelize.query(`SET TIME ZONE 'America/Bogota';`);

            // SQL base
            let sql = `
                select
                    rv.id_vacunacion,
                    v.id as id_vacuna,
                    v.nombre_vacuna,
                    v.presentacion_comercial,
                    v.cantidad_dosis,
                    to_char(
                        r.fecha_registro::timestamp,
                        'DD/MM/YYYY HH24:MI:SS'
                    ) AS fecha_registro,
                    rv.registro_sanitario_vacuna,
                    rv.dosis_aplicada
                FROM t_registro_vacunacions r
                JOIN t_registro_vacunacion_vacunas rv 
                    ON r.id_vacunacion = rv.id_vacunacion
                INNER JOIN t_vacunas v 
                    ON rv.id_vacuna = v.id
                WHERE 
                    r.estado = 'A'
                    AND (
                        r.id_usuario = :idUsuario 
                        OR r.id_empresa = :idEmpresa
                    )
                    and r.id_paciente = :idPaciente
                ORDER BY 
                    r.id_vacunacion DESC
            `;

            const registros = await sequelize.query(
                sql,
                {
                    replacements: {
                        idUsuario,
                        idEmpresa,
                        idPaciente
                    },
                    type: QueryTypes.SELECT,
                }
            );

            res.json({
                msg: "Get Registros de Vacunación",
                state: "OK",
                body: registros
            });
        }
    } catch (error) {
        res.json({
            msg: "Get Registros de Vacunación",
            state: "NO_OK",
            body: error,
        });
    }
};

// ================================
// GET - Listar registro de vacunas aplicadas x paciente
// ================================
export const getRegConsentimientosxPaciente = async (req: Request, res: Response) => {
    console.log("getRegConsentimientosxPaciente");

    try {
        const idUsuario = getIdUsuarioDesdeToken(req);
        if (!idUsuario) {
            res.status(401).json({
                msg: "Token inválido o NO enviado.",
                state: "NO_OK",
                body: null,
            });
        } else {

            let usuario = await Usuario.findByPk(idUsuario);
            let idEmpresa = usuario?.getDataValue("id_empresa");
            let idPaciente = req.body.id_paciente;

            await sequelize.query(`SET TIME ZONE 'America/Bogota';`);

            // SQL base
            let sql = `
                select
                    c.id_consentimiento,
                    to_char(c.fecha_registro, 'DD/MM/YYYY HH24:MI') as fecha_reg,
                    c.nombre_paciente,
                    r.acudiente,
                    f_procesar_datos_consentimiento(r.id_vacunacion)
                FROM t_doc_consentimientos c 
                join t_registro_vacunacions r  
                    on c.id_vacunacion = r.id_vacunacion
                WHERE 
                    r.estado = 'A'
                    AND (
                        r.id_usuario = :idUsuario 
                        OR r.id_empresa = :idEmpresa
                    )
                    and r.id_paciente = :idPaciente
                ORDER BY 
                    r.fecha_registro DESC
            `;

            const registros = await sequelize.query(
                sql,
                {
                    replacements: {
                        idUsuario,
                        idEmpresa,
                        idPaciente
                    },
                    type: QueryTypes.SELECT,
                }
            );

            res.json({
                msg: "Get Registros de Vacunación",
                state: "OK",
                body: registros
            });
        }
    } catch (error) {
        res.json({
            msg: "Get Registros de Vacunación",
            state: "NO_OK",
            body: error,
        });
    }
};


// ================================
// POST/PUT - Crear o actualizar registro con sus vacunas
// ================================
export const crearActualizarRegVacunacion = async (req: Request, res: Response) => {
    console.log("crearActualizarRegVacunacion");

    try {
        const idUsuario = getIdUsuarioDesdeToken(req);
        const idEmpresa = getIdEmpresaDesdeToken(req);
        if (!idUsuario || !idEmpresa) {
            res.status(401).json({
                msg: "Token inválido o ausente",
                state: "NO_OK",
                body: null,
            });
        } else {

            const id_vacunacion = req.body.id_vacunacion;
            const vacunas = req.body.vacunas_aplicadas || []; // arreglo con vacunas

            const registro: any = {
                id_paciente: req.body.id_paciente,
                fecha_registro: req.body.fecha_registro,
                aplica_acudiente: req.body.aplica_acudiente,
                num_documento_acudiente: req.body.num_documento_acudiente,
                acudiente: req.body.acudiente,
                estado: req.body.estado || "A",
                id_empresa: idEmpresa,
                id_usuario: idUsuario,
            };

            let registroCreado: any;

            if (id_vacunacion) {
                const existe = await RegVacunacion.findByPk(id_vacunacion);
                if (!existe) {
                    res.json({
                        msg: "Actualizar Registro Vacunación",
                        state: "NO_OK",
                        body: `No existe el registro con ID: ${id_vacunacion}`,
                    });
                } else {

                    await RegVacunacion.update(
                        registro,
                        {
                            where: { id_vacunacion },
                        }
                    );

                    registroCreado = await RegVacunacion.findByPk(id_vacunacion);

                    // Borramos las vacunas inyectadas en el proceso anterior y volvemos a insertar las seleccionas 
                    await RegVacunacionVacunas.destroy({
                        where: { id_vacunacion },
                    });


                }
            } else {
                registroCreado = await RegVacunacion.create(registro);
            }

            // Insertar las vacunas asociadas
            if (vacunas.length > 0) {

                // aplanar todos los id_vacuna en una sola lista
                const idsVacunas = vacunas.flatMap((v: any) => v.id_vacuna);

                const registrosVacunas = await Promise.all(
                    idsVacunas.map(async (idVacuna: number) => {
                        const vacuna = await Vacunas.findByPk(idVacuna) as any;

                        return {
                            id_vacunacion: registroCreado.id_vacunacion,
                            id_vacuna: idVacuna,
                            id_empresa: req.body.id_empresa,
                            id_usuario: idUsuario,
                            registro_sanitario_vacuna: vacuna?.registro_sanitario ?? null,
                            dosis_aplicada: req.body.vacunas_aplicadas?.find((v: any) => v.id_vacuna === idVacuna)?.dosis_aplicada ?? null
                        };
                    })
                );

                await RegVacunacionVacunas.bulkCreate(registrosVacunas);
            }

            // Construimos el arreglo de datos del consentimiento 
            let data_consentimiento = await crearDocumentoConsentimiento(
                registroCreado.id_vacunacion,
                req.body.firma_usuario_acudiente
            );

            res.json({
                msg: id_vacunacion
                    ? "Actualizar Registro Vacunación"
                    : "Crear Registro Vacunación",
                state: "OK",
                body: {
                    registroCreado,
                    f_procesar_datos_consentimiento: data_consentimiento
                }
            });
        }
    } catch (error) {
        res.json({
            msg: "Crear/Actualizar Registro Vacunación",
            state: "NO_OK",
            body: error,
        });
    }
};

// ================================
// DELETE (lógico) - marcar registro como inactivo
// ================================
export const borrarRegVacunacion = async (req: Request, res: Response) => {
    console.log("borrarRegVacunacion");

    try {
        const idUsuario = getIdUsuarioDesdeToken(req);
        if (!idUsuario) {
            res.status(401).json({
                msg: "Token inválido o NO enviado.",
                state: "NO_OK",
                body: null,
            });
        } else {

            const id_vacunacion = req.body.id_vacunacion;
            const registro = await RegVacunacion.findByPk(id_vacunacion);

            if (!registro) {
                res.json({
                    msg: "Delete Registro Vacunación",
                    state: "NO_OK",
                    body: `Registro con ID: ${id_vacunacion} NO existe`,
                });
            } else {

                await RegVacunacion.update(
                    { estado: "I" },
                    { where: { id_vacunacion } }
                );

                res.json({
                    msg: "Delete Registro Vacunación",
                    state: "OK",
                    body: "Registro marcado como inactivo correctamente.",
                });
            }
        }
    } catch (error) {
        res.json({
            msg: "Delete Registro Vacunación",
            state: "NO_OK",
            body: error,
        });
    }
};
