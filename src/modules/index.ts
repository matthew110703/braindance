import { Router } from "express";
import healthRouter from "./health/health.routes.js";
import userRouter from "./user/user.routes.js";

const rootApiRouter = Router();

rootApiRouter.use("/health", healthRouter);
rootApiRouter.use("/users", userRouter);

export default rootApiRouter;
