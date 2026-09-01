import { Router } from "express";
import { listController } from "./list.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  createListSchema,
  getListDetailsSchema,
  checkListItemStatusSchema,
  listMediaItemSchema,
} from "./list.schema.js";

const router = Router();

// Create List
router.post(
  "/",
  validate(createListSchema),
  listController.createList
);

// Get List Details
router.get(
  "/:list_id",
  validate(getListDetailsSchema),
  listController.getListDetails
);

// Check Item Status
router.get(
  "/:list_id/item-status",
  validate(checkListItemStatusSchema),
  listController.checkItemStatus
);

router.get(
  "/:list_id/item_status",
  validate(checkListItemStatusSchema),
  listController.checkItemStatus
);

// Add Movie to List
router.post(
  "/:list_id/add-item",
  validate(listMediaItemSchema),
  listController.addMovie
);

router.post(
  "/:list_id/add_item",
  validate(listMediaItemSchema),
  listController.addMovie
);

// Remove Movie from List
router.post(
  "/:list_id/remove-item",
  validate(listMediaItemSchema),
  listController.removeMovie
);

router.post(
  "/:list_id/remove_item",
  validate(listMediaItemSchema),
  listController.removeMovie
);

export default router;
