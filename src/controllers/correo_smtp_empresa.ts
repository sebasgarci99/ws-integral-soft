import sequelize from "../db/connection";
import { Request, Response } from "express";

import jwt from 'jsonwebtoken'; 
import { Usuario } from "../models/usuario";
import { CorreoSmtpEmpresa } from "../models/correo_smtp_empresas";
import { Consultorio } from "../models/consultorio";
const nodemailer = require("nodemailer");

export const sendReportes = async (
    req: Request, 
    res: Response
) => {
    console.log("enviarReportes");

    const headerToken = req.headers['authorization'];

    // Capturamos exclusivamente el token
    const bearerToken = headerToken?.slice(7)

    try {
        // Validamos funcionalmente el token adjunto en el header
        const tokenDesencriptado = jwt.verify(
            String(bearerToken),
            process.env.SECRET_KEY || 'pRu3b4_4sD1*2*3'
        );

        // Verificamos que sea un objeto y no un string
        if (typeof tokenDesencriptado === 'string' || !tokenDesencriptado.idUser) {
            throw new Error("Token inválido al desencriptar o esta modificado");
        }

        // Parametros
        let fechaInico = req.body.fecha_inicio;
        let fechaFin = req.body.fecha_fin;
        let consultorio = req.body.consultorio;
        let idUsuario = tokenDesencriptado.idUser;
        let tipoReporte = req.body.tipo_reporte;
        let dataUsuario:any = {};
        let llaves_consultorios:number[] = [];

        dataUsuario = await Usuario.findOne({
            where : {
                id : idUsuario
            }
        });

        // Verificamos que el usuario tenga el rol designado para enviar correos
        if (dataUsuario?.getDataValue('id_rol') != 1) {
            throw new Error("El usuario no tiene el rol para enviar correos.");
        }

        let funcionEjecuta = tipoReporte == 'Totalizado' ? 'f_obtener_totalizado_registro_peso' : 'f_obtener_detalle_registro_peso';

        const [results] = await sequelize.query(`
            select *
            from 
                ${funcionEjecuta}(
                    ${idUsuario},
                    '${fechaInico}'::date,
                    '${fechaFin}'::date,
                    ${consultorio}
                )
        `); 

        // New set sirve para extraer los valores diferentes de un arreglo 
        // generamos un arreglo recorrido (...) con los datos de los ID CONSULTORIO
        llaves_consultorios = [...new Set(results.map((item: any) => item.id_consultorio))];

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Empezamos a construir el correo a enviar
        let transporter = null;
        
        let configCorreoEnvia = await CorreoSmtpEmpresa.findOne({
            where : {
                id_empresa : dataUsuario?.getDataValue('id_empresa')
            }
        });

        if(!configCorreoEnvia) {
            throw new Error("No se ha configurado el correo de envios para la empresa.");
        } 

        // Construirmos el transportes u objeto encargado de usar el correo configurado en base de datos para reenviar el reporte.
        if (configCorreoEnvia.getDataValue('servicio').toLowerCase() === "gmail") {
            transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: configCorreoEnvia.getDataValue('correo_electronico'),
                    pass: configCorreoEnvia.getDataValue('password')
                }
            });
        } else {
            transporter = nodemailer.createTransport({
                host: configCorreoEnvia.getDataValue('host'),
                port: configCorreoEnvia.getDataValue('puerto'),
                secure: configCorreoEnvia.getDataValue('password') == 465 ? true : false, // true para 465, false para 587
                auth: {
                    user: configCorreoEnvia.getDataValue('correo_electronico'),
                    pass: configCorreoEnvia.getDataValue('password')
                }
            });
        }

        // Construimos el cuerpo del reporte recorriendo los consultorios del reporte
        // y enviando reporte a reporte
        llaves_consultorios.forEach(
            async id_cons => {
                let fecha = new Date();
                let fechaActual = fecha.getDate() + "-"+ fecha.getMonth()+ "-" +fecha.getFullYear();
                let infoConsultorio = await Consultorio.findOne({
                    where: {
                        id : id_cons
                    }
                });

                let fromMail = `Reporte del registro de residuos - ${infoConsultorio?.getDataValue('correo')} - Software IntegralSoft`;
                let subjectMail = `Registro de residuos - ${tipoReporte.toUpperCase()} - Consultorio: ${infoConsultorio?.getDataValue('codigo')} | Software Integral-Soft`;
                
                // Encabezado de tabla del cuerpo del correo
                let htmlMail = `
                    Hola <strong>${infoConsultorio?.getDataValue('codigo')}-${infoConsultorio?.getDataValue('nombre_representante')}</strong>
                    <br>
                    Hemos realizado correcta y satisfactoriamente el registro de tus residuos peligrosos los cuales por ley deberán tener un proceso de disposición diferente.
                    <br>
                    Te adjuntamos la información general de lo recolectado, el reporte generado es: ${tipoReporte}, por lo que su análisis queda a completa disposición de ustedes.
                    <br>
                    <h2>Registro de residuos</h2>
                    <p><strong>Consultorio:</strong> ${infoConsultorio?.getDataValue("codigo")}-${infoConsultorio?.getDataValue('nombre_representante')} ${infoConsultorio?.getDataValue('descripcion')}</p>
                    <p><strong>Tipo de reporte:</strong> ${tipoReporte}</p>
                    <p><strong>Fecha de generación del reporte:</strong> ${fechaActual}</p>
                    <table border="1" cellspacing="0" cellpadding="5" style="border-collapse:collapse; width:100%;">
                        <thead>
                        <tr>
                            <th><b>Fecha</b></th>
                            <th><b>No aprovechables</b></th>
                            <th><b>Biosanitarios</b></th>
                            <th><b>Cortopunzantes NG</b></th>
                            <th><b>Cortopunzantes K</b></th>
                            <th><b>Anatomopatológicos</b></th>
                            <th><b>Fármacos</b></th>
                            <th><b>Chatarra electrónica</b></th>
                            <th><b>Pilas</b></th>
                            <th><b>Químicos</b></th>
                            <th><b>Iluminarias</b></th>
                            <th><b>Total</b></th>
                        </tr>
                        </thead>
                        <tbody>
                    `;

                // Filas
                (results as any[]).filter(e => e.id_consultorio === id_cons).forEach(
                    (data:any) => {
                        htmlMail += `
                            <tr>
                            <td>${data.fecha ?? 'Total'}</td>
                            <td>${data.no_aprovechables}</td>
                            <td>${data.biosanitarios}</td>
                            <td>${data.cortopunzantes_ng}</td>
                            <td>${data.cortopunzantes_k}</td>
                            <td>${data.anatomopatologicos}</td>
                            <td>${data.farmacos}</td>
                            <td>${data.chatarra_electronica}</td>
                            <td>${data.pilas}</td>
                            <td>${data.quimicos}</td>
                            <td>${data.iluminarias}</td>
                            <td><b>${data.total}</b></td>
                            </tr>
                        `;
                    }
                );

                // Cerrar tabla y terminamos el correo.
                htmlMail += `
                        </tbody>
                    </table>
                    <br>
                    <k>Powered by Integral-soft.com.co</k>`;

                await transporter.sendMail({
                    from: fromMail,
                    to: infoConsultorio?.getDataValue('correo'),
                    // to: 'sebasgarci99@gmail.com',
                    subject: subjectMail,
                    html: htmlMail
                });
            }
        );

        res.json({
            msg: 'sendReportes',
            state: 'OK',
            body: results
        });
    } catch (e: any) {
        res.json({
            msg: 'sendReportes',
            state: 'NO_OK',
            body: e.message
        });
    }

};