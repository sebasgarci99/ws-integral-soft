import express, {Request, Response} from 'express';
import routeUsuario from '../routes/usuario';
import routeConsultorio from '../routes/consultorios';
import routeRecoleccion from '../routes/registro_recoleccion';
import routeReportes from '../routes/reportes';
import routeCorreoSmtp from '../routes/correo_smtp_empresa';
import routeVacunas from '../routes/vacunas';
import routePacientes from '../routes/pacientes';
import routeRegVacunacion from '../routes/registro_vacunacion';

import sequelize from '../db/connection';
import { Usuario } from './usuario';
import { getUsuario, loginUser } from '../controllers/login';
import validateToken from '../routes/validate-token';

import cors from 'cors'; // ✅ Importar cors
import { Consultorio } from './consultorio';
import { RegistroRecoleccion } from './registro_recoleccion';
import { ModuloxUsuario } from './modxusuario';
import { CorreoSmtpEmpresa } from './correo_smtp_empresas';
import { Laboratorio } from './laboratorio';
import { Vacunas } from './vacunas';
import { Paciente } from './pacientes';
import { AntecedenteMedico } from './antecedentes_medicos';
import { DatoAdministrativo } from './datos_admin_pacientes';

import { RegVacunacion } from './registro_vacunacion';
import { RegVacunacionVacunas } from './registro_vacunacion_vacunas';
import { Doc_Consentimiento } from './doc_consentimiento';

class Server {
    private app : express.Application;
    private port : string;

    constructor() {
        this.app = express();
        this.port = process.env.PORT || "3001";
        this.listen();
        this.midlewares();
        this.routes();
        this.dbConnect();
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log('Aplicacion corriendo en el puerto ', this.port);
        });
    }

    routes() {
        this.app.get('/', (req: Request, res: Response) => {
            res.json({
                msg: 'API Working'
            });
        });

        this.app.get('/api/getUsuarios', validateToken, getUsuario);

        //this.app.post('/api/login', loginUser)
        
        this.app.use('/api/usuario', routeUsuario);
        this.app.use('/api/consultorio', routeConsultorio);
        this.app.use('/api/reg_recoleccion', routeRecoleccion);
        this.app.use('/api/reportes', routeReportes);
        this.app.use('/api/enviarmail', routeCorreoSmtp);
        this.app.use('/api/vacunas', routeVacunas);
        this.app.use('/api/pacientes', routePacientes);
        this.app.use('/api/reg_vacunacion', routeRegVacunacion);
    }

    midlewares() {
        // this.app.use(express.json());

        // ✅ Habilitar CORS para Angular
        this.app.use(cors({
            // origin: 'https://integral-soft.com.co',
            origin: process.env.ENDPOINT_CONSUMO,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            credentials: true
        }));

        this.app.use(express.json());

        // ✅ Habilitar preflight para todas las rutas
        this.app.use(cors());
    }

    async dbConnect() {
        try {
            await sequelize.authenticate();
            console.log("Conexión con éxito a la bd, actualizando tablas en bd...");

            // Se crean o actualizan las tablas y clases instanciadas del proyecto
            await Usuario.sync();
            await Consultorio.sync();
            await RegistroRecoleccion.sync();
            await ModuloxUsuario.sync();
            await CorreoSmtpEmpresa.sync();
            await Laboratorio.sync();
            await Vacunas.sync(); 
            await Paciente.sync();
            await AntecedenteMedico.sync();
            await DatoAdministrativo.sync();
            await RegVacunacion.sync();
            await RegVacunacionVacunas.sync();
            await Doc_Consentimiento.sync();

        } catch(error) {
            console.error("Error de conexión a la bd: ", error);
        }
    }
}

export default Server;