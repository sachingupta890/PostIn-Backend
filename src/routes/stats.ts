import { dashboardStats, getBarCharts, getLineCharts, getPieCharts } from "../controllers/stats.js";
import express from "express";

const router = express.Router();


router.get('/stats',dashboardStats)

router.get("/pie", getPieCharts);

router.get('/bar',getBarCharts)

router.get("/line", getLineCharts);



export default router;