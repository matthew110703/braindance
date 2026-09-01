import { Router } from "express";
import { movieController } from "./movie.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  movieListQuerySchema,
  movieDetailsSchema,
  movieRecommendationsSchema,
} from "./movie.schema.js";

const router = Router();

// Static list routes (Must be declared before dynamic /:id routes)
router.get(
  "/now-playing",
  validate(movieListQuerySchema),
  movieController.getNowPlaying
);

router.get(
  "/popular",
  validate(movieListQuerySchema),
  movieController.getPopular
);

router.get(
  "/top-rated",
  validate(movieListQuerySchema),
  movieController.getTopRated
);

router.get(
  "/upcoming",
  validate(movieListQuerySchema),
  movieController.getUpcoming
);

// Dynamic /:id item routes
router.get(
  "/:id",
  validate(movieDetailsSchema),
  movieController.getMovieDetails
);

router.get(
  "/:id/recommendations",
  validate(movieRecommendationsSchema),
  movieController.getMovieRecommendations
);

export default router;
