import { Router } from "express";
import healthRoutes from "../modules/health/health.routes.js";

const v1Router = Router();

interface RouteDefinition {
  path: string;
  route: Router;
}

const routes: RouteDefinition[] = [
  {
    path: "/health",
    route: healthRoutes,
  },
];

routes.forEach(({ path, route }) => {
  v1Router.use(path, route);
});

export default v1Router;
