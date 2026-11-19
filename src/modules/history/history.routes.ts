import { Router } from "express";
import { historyController } from "./history.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  updateHistorySchema,
  getHistoryItemSchema,
  getHistoryListSchema,
  getContinueWatchingSchema,
  removeHistoryItemSchema,
} from "./history.schema.js";

const router = Router();

// Get continue-watching entries (unfinished playback)
router.get(
  "/continue-watching",
  validate(getContinueWatchingSchema),
  historyController.getContinueWatching
);

// Update playback progress & media metadata
router.put(
  "/:media_id",
  validate(updateHistorySchema),
  historyController.updateProgress
);

// Get playback progress & media metadata for a specific media item
router.get(
  "/:media_id",
  validate(getHistoryItemSchema),
  historyController.getProgress
);

// Get paginated watch history
router.get(
  "/",
  validate(getHistoryListSchema),
  historyController.getHistory
);

// Remove specific media item from watch history
router.delete(
  "/:media_id",
  validate(removeHistoryItemSchema),
  historyController.removeFromHistory
);

// Clear entire watch history
router.delete(
  "/",
  historyController.clearHistory
);

export default router;
