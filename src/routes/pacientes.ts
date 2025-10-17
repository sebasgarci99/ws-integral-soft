import { Router } from 'express';
import { 
    getPacientes, 
    actualizarPaciente, 
    crearPaciente, 
    eliminarPaciente 
} from '../controllers/pacientes';
import validateToken from '../routes/validate-token';

const router = Router();

router.post('/getPacientes', validateToken, getPacientes);
router.post('/crearPaciente', validateToken, crearPaciente);
router.post('/actualizarPaciente', validateToken, actualizarPaciente);
router.post('/eliminarPaciente', validateToken, eliminarPaciente);

export default router;