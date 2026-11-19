import { Router } from "express";
import { watchlistController } from "./watchlist.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  addWatchlistSchema,
  removeWatchlistSchema,
  checkWatchlistSchema,
  getWatchlistSchema,
} from "./watchlist.schema.js";

const router = Router();

// Get Watchlist items
router.get(
  "/",
  validate(getWatchlistSchema),
  watchlistController.getWatchlist
);

// Add to Watchlist
router.post(
  "/",
  validate(addWatchlistSchema),
  watchlistController.addToWatchlist
);

// Check if item is in Watchlist
router.get(
  "/check/:media_id",
  validate(checkWatchlistSchema),
  watchlistController.checkStatus
);

router.get(
  "/status/:media_id",
  validate(checkWatchlistSchema),
  watchlistController.checkStatus
);

// Remove from Watchlist
router.delete(
  "/:media_id",
  validate(removeWatchlistSchema),
  watchlistController.removeFromWatchlist
);

router.post(
  "/remove",
  validate(addWatchlistSchema),
  watchlistController.removeFromWatchlist
);

export default router;
