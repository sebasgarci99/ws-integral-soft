import { Router } from "express";
import {
    getRegistrosTemperatura,
    crearRegistroTemperatura,
    eliminarRegistroTemperatura
} from "../controllers/registro_temperatura";
import validateToken from "../routes/validate-token";

const router = Router();

router.post("/getRegistrosTemperatura", validateToken, getRegistrosTemperatura);
router.post("/crearRegistroTemperatura", validateToken, crearRegistroTemperatura);
router.post("/eliminarRegistroTemperatura", validateToken, eliminarRegistroTemperatura);

export default router;
