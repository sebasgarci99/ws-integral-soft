import { Router } from 'express';
import { borrarConsultorio, crearActualizarConsultorio, getConsultorios } from '../controllers/consultorio';
import validateToken from '../routes/validate-token';

const router = Router();

router.post('/getConsultorios', validateToken, getConsultorios);
router.post('/crear_actualizar_consultorio', validateToken, crearActualizarConsultorio);
router.post('/eliminar_consultorio', validateToken, borrarConsultorio);

export default router;