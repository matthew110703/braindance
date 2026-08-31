import { Router } from "express";
import healthRoutes from "../modules/health/health.routes.js";
import userRoutes from "../modules/user/user.routes.js";

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
  {
    path: "/users",
    route: userRoutes,
  },
];

routes.forEach(({ path, route }) => {
  v1Router.use(path, route);
});

export default v1Router;
