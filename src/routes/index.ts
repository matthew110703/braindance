import { Router } from "express";
import v1Router from "./v1.routes.js";

const globalRouter = Router();

// Mount API version routers
globalRouter.use("/api/v1", v1Router);

export default globalRouter;
