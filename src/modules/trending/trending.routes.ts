import { Router } from "express";
import { trendingController } from "./trending.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { trendingRequestSchema } from "./trending.schema.js";

const router = Router();

// Trending All (Movies, TV Shows, People)
router.get(
  "/all",
  validate(trendingRequestSchema),
  trendingController.getTrendingAll
);

router.get(
  "/all/:time_window",
  validate(trendingRequestSchema),
  trendingController.getTrendingAll
);

// Trending Movies
router.get(
  "/movies",
  validate(trendingRequestSchema),
  trendingController.getTrendingMovies
);

router.get(
  "/movies/:time_window",
  validate(trendingRequestSchema),
  trendingController.getTrendingMovies
);

// Trending TV Shows
router.get(
  "/tv",
  validate(trendingRequestSchema),
  trendingController.getTrendingTv
);

router.get(
  "/tv/:time_window",
  validate(trendingRequestSchema),
  trendingController.getTrendingTv
);

export default router;
