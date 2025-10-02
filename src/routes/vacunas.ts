import { Router } from 'express';
import { getVacunas, crearActualizarVacuna, borrarVacuna, getLaboratorios } from '../controllers/vacunas';
import validateToken from '../routes/validate-token';

const router = Router();

router.post('/getVacunas', validateToken, getVacunas);
router.post('/crear_actualizar_vacunas', validateToken, crearActualizarVacuna);
router.post('/eliminar_vacunas', validateToken, borrarVacuna);

router.post('/getLaboratorios', validateToken, getLaboratorios);


export default router;