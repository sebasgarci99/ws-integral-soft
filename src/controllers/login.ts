import sequelize from "../db/connection";
import { Request, Response } from "express"

import { Usuario } from "../models/usuario"

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; 

export const getUsuario = async (req: Request, res: Response) => {
    console.log("getUsuario")

    const listUsuario = await Usuario.findAll();
    // console.log(listUsuario)

    const { body } = req;

    res.json({
        msg: 'Get usuario',
        body : listUsuario
    })
}

export const loginUser = async (req: Request, res: Response) => {

    // 1 Validamos si el usuario existe en bd
    const { username, password } = req.body;

    const passwordEncry = await bcrypt.hash(
        password,
        12
    );

    console.log(username);
    console.log(passwordEncry);

    // 1 Validamos si existe el usuario
    const usuarioExiste:any = await Usuario.findOne({
        where : {
            usuario : username
        }
    });

    // Si el usuario NO existe
    if(!usuarioExiste) {
        res.status(400).json({
            msg: 'No existe el usuario: '+username+', en la base de datos'
        })
    }

    // Validamos si esta activo
    const usuarioActivo:any = await Usuario.findOne({
        where : {
            usuario : username,
            estado : 'A'
        }
    });

    // Si el usuario NO existe
    if(!usuarioActivo) {
        res.status(400).json({
            msg: 'El usuario: '+username+' se encuentra INACTIVO.'
        })
    }

    // 2 Validamos el password 
    // Encripta el primer parametro y lo compara contra el 2do parametro
    const passValida = await bcrypt.compare(password, usuarioExiste.password);

    // Si la contraseña no es valida
    if(!passValida) {
        res.status(400).json({
            msg: 'Contraseña incorrecta'
        })
    }

    // 3 Generamos el Token
    const token = jwt.sign( 
        {
            idUser: usuarioExiste.id,
            username: username,
        },
        process.env.SECRET_KEY || 'pRu3b4_4sD1*2*3',
        {
            expiresIn: '2h'
        }
    );

    res.json({token: token, idUser: usuarioExiste.id, idEmpresa: usuarioExiste.id_empresa, rol: usuarioExiste.id_rol});

    // Si fueramos a crear un usuario
    // try {
    //     await Usuario.create({
    //         usuario: usuario,
    //         password: passwordEncry
    //     })
    // } catch(e) {
    //     console.log(e);
    // }
}

export const getInfoUsuarioBD = async (req: Request, res: Response) => {
    console.log("getInformacionUsuario BD");

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

        const [results, metadata] = await sequelize.query(`
            select *
            from f_obtener_datos_usuario(
                ${tokenDesencriptado.idUser} 
            )
        `);

        res.json({
            msg: 'Get Info',
            state: 'OK',
            body: results
        });
    } catch (e) {
        res.json({
            msg: 'Get Info',
            state: 'NO_OK',
            body: e
        });
    }
}