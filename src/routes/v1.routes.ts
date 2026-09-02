import { Router } from "express";
import healthRoutes from "../modules/health/health.routes.js";
import discoverRoutes from "../modules/discover/discover.routes.js";
import movieRoutes from "../modules/movie/movie.routes.js";
import tvRoutes from "../modules/tv/tv.routes.js";
import trendingRoutes from "../modules/trending/trending.routes.js";
import searchRoutes from "../modules/search/search.routes.js";
import watchlistRoutes from "../modules/watchlist/watchlist.routes.js";
import listRoutes from "../modules/list/list.routes.js";
import genreRoutes from "../modules/genre/genre.routes.js";
import historyRoutes from "../modules/history/history.routes.js";
import collectionRoutes from "../modules/collection/collection.routes.js";

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
    path: "/genres",
    route: genreRoutes,
  },
  {
    path: "/collections",
    route: collectionRoutes,
  },
  {
    path: "/watchlist",
    route: watchlistRoutes,
  },
  {
    path: "/history",
    route: historyRoutes,
  },
  {
    path: "/lists",
    route: listRoutes,
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
  {
    path: "/search",
    route: searchRoutes,
  },
];

routes.forEach(({ path, route }) => {
  v1Router.use(path, route);
});

export default v1Router;

