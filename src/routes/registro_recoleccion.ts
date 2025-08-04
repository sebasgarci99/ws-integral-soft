import { Router } from 'express';
import { borrarRegistroRecoleccion, crearActualizarRegistroRecoleccion, getRegistrosRecoleccion } from '../controllers/registro_recoleccion';
import validateToken from '../routes/validate-token';

const router = Router();

router.post('/getRegistrosRecoleccion', validateToken, getRegistrosRecoleccion);
router.post('/crear_actualizar_reg_recoleccion', validateToken, crearActualizarRegistroRecoleccion);
router.post('/eliminar_registro_recoleccion', validateToken, borrarRegistroRecoleccion);

export default router;