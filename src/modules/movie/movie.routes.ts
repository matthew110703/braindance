import { Router } from "express";
import { movieController } from "./movie.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { movieListQuerySchema } from "./movie.schema.js";

const router = Router();

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

export default router;
