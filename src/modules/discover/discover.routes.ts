import { Router } from "express";
import { discoverController } from "./discover.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  discoverMovieQuerySchema,
  discoverTvQuerySchema,
} from "./discover.schema.js";

const router = Router();

router.get(
  "/movies",
  validate(discoverMovieQuerySchema),
  discoverController.discoverMovies
);

router.get(
  "/tv",
  validate(discoverTvQuerySchema),
  discoverController.discoverTvShows
);

export default router;
