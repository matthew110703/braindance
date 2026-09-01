import { Router } from "express";
import { searchController } from "./search.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  searchMultiSchema,
  searchMovieSchema,
  searchTvSchema,
  searchKeywordSchema,
} from "./search.schema.js";

const router = Router();

// Multi Search (Movies, TV Shows, People)
router.get(
  "/",
  validate(searchMultiSchema),
  searchController.searchMulti
);

router.get(
  "/multi",
  validate(searchMultiSchema),
  searchController.searchMulti
);

// Movie Search
router.get(
  "/movies",
  validate(searchMovieSchema),
  searchController.searchMovies
);

router.get(
  "/movie",
  validate(searchMovieSchema),
  searchController.searchMovies
);

// TV Search
router.get(
  "/tv",
  validate(searchTvSchema),
  searchController.searchTv
);

// Keyword Search
router.get(
  "/keywords",
  validate(searchKeywordSchema),
  searchController.searchKeywords
);

router.get(
  "/keyword",
  validate(searchKeywordSchema),
  searchController.searchKeywords
);

export default router;

