import { Router } from "express";
import healthRoutes from "../modules/health/health.routes.js";
import discoverRoutes from "../modules/discover/discover.routes.js";
import movieRoutes from "../modules/movie/movie.routes.js";
import tvRoutes from "../modules/tv/tv.routes.js";
import trendingRoutes from "../modules/trending/trending.routes.js";

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
  {
    path: "/tv",
    route: tvRoutes,
  },
  {
    path: "/trending",
    route: trendingRoutes,
  },
];

routes.forEach(({ path, route }) => {
  v1Router.use(path, route);
});

export default v1Router;
