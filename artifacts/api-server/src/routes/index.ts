import { Router, type IRouter } from "express";
import healthRouter from "./health";
import clinicflowRouter from "./clinicflow";

const router: IRouter = Router();

router.use(healthRouter);
router.use(clinicflowRouter);

export default router;
