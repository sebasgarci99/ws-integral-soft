import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken'

const validateToken = (req: Request, res: Response, next: NextFunction) => {
    console.log('validate token');

    const headerToken = req.headers['authorization'];

    // Si hay token relacionado en el WS
    // Y a su vez es un Bearer Token
    if(headerToken == undefined) {
        res.status(401).json({
            msg: 'Acceso denegado, no token'
        })
    } else if(!headerToken?.startsWith('Bearer ')) {
        res.status(401).json({
            msg: 'No tiene autorización Bearer'
        })
    } else {
        try {
            // Capturamos exclusivamente el token
            const bearerToken = headerToken?.slice(7);

            // Validamos funcionalmente el token adjunto en el header
            jwt.verify(
                bearerToken,
                process.env.SECRET_KEY || 'pRu3b4_4sD1*2*3'
            )
            // Función que indica que continue y no espere
            next();

        } catch(e:any) {
            if (e.name === 'TokenExpiredError') {
                res.status(401).json({
                    msg: 'Token expirado'
                });
            }
            // Capturamos el error del verify del token
            res.status(401).json({
                msg: 'Token invalido'
            })
        }

        
    }
}

export default validateToken;