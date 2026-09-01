import { Router } from "express";
import healthRoutes from "../modules/health/health.routes.js";
import discoverRoutes from "../modules/discover/discover.routes.js";
import movieRoutes from "../modules/movie/movie.routes.js";

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
    path: "/discover",
    route: discoverRoutes,
  },
  {
    path: "/movies",
    route: movieRoutes,
  },
];

routes.forEach(({ path, route }) => {
  v1Router.use(path, route);
});

export default v1Router;
