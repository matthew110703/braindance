import { Router } from "express";
import { genreController } from "./genre.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { genreQuerySchema } from "./genre.schema.js";

const router = Router();

// Get Movie genres
router.get(
  "/movies",
  validate(genreQuerySchema),
  genreController.getMovieGenres
);

router.get(
  "/movie",
  validate(genreQuerySchema),
  genreController.getMovieGenres
);

// Get TV genres
router.get(
  "/tv",
  validate(genreQuerySchema),
  genreController.getTvGenres
);

// Get All genres (Movie and TV)
router.get(
  "/",
  validate(genreQuerySchema),
  genreController.getAllGenres
);

export default router;
