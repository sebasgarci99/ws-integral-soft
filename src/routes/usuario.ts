import { Router } from 'express';
import { getUsuario, loginUser, getInfoUsuarioBD } from '../controllers/login';
import validateToken from './validate-token';

const router = Router();

router.get('/', getUsuario)
router.post('/login', loginUser);
router.post('/getInfoUser', validateToken, getInfoUsuarioBD)

export default router;