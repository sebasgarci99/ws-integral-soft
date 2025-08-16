import { Router } from 'express';
import { sendReportes } from '../controllers/correo_smtp_empresa';
import validateToken from './validate-token';

const router = Router();

router.post('/sendReportes', validateToken, sendReportes)

export default router;