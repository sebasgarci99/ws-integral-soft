import { Router } from "express";
import validateToken from "./validate-token";
import {
    getRegVacunaciones,
    crearActualizarRegVacunacion,
    borrarRegVacunacion,
    getRegVacunacionesxPaciente,
    getRegConsentimientosxPaciente
} from "../controllers/registro_vacunacion";


const router = Router();

router.post("/getRegVacunacion", validateToken, getRegVacunaciones);
router.post("/getRegVacunacionxPaciente", validateToken, getRegVacunacionesxPaciente);
router.post("/getRegConsentimientosxPaciente", validateToken, getRegConsentimientosxPaciente);

router.post("/crearActualizarRegVacunacion", validateToken, crearActualizarRegVacunacion);
router.post("/borrarRegVacunacion", validateToken, borrarRegVacunacion);

export default router;
