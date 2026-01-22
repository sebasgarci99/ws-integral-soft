import { Router } from 'express';
import {
    getReportDetallado,
    getReporteMesGraficas,
    getReportTotalizado,
    getReporteMesActualGraficas,
    getReporteMesConsultorioGraficas,
    getReporteGraficaxUsuario
} from '../controllers/reportes';
import validateToken from '../routes/validate-token';

const router = Router();

router.post('/getReportTotalizado', validateToken, getReportTotalizado);
router.post('/getReportDetallado', validateToken, getReportDetallado);
router.post('/getReporteMesGraficas', validateToken, getReporteMesGraficas);
router.post('/getReporteMesActualGraficas', validateToken, getReporteMesActualGraficas);
router.post('/getReporteMesConsultorioGraficas', validateToken, getReporteMesConsultorioGraficas);

router.post('/getReporteGraficaxUsuario', validateToken, getReporteGraficaxUsuario);

export default router;