import { Router } from "express";
import { userController } from "./user.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  createUserSchema,
  updateUserSchema,
  getUserByIdSchema,
  getUsersQuerySchema,
} from "./user.schema.js";

const router = Router();

router
  .route("/")
  .post(validate(createUserSchema), userController.createUser)
  .get(validate(getUsersQuerySchema), userController.getAllUsers);

router
  .route("/:id")
  .get(validate(getUserByIdSchema), userController.getUserById)
  .patch(validate(updateUserSchema), userController.updateUser)
  .delete(validate(getUserByIdSchema), userController.deleteUser);

export default router;
