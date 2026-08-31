import { Request, Response } from "express";
import { userService, UserService } from "./user.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { CreateUserInput, UpdateUserInput } from "./user.schema.js";

export class UserController {
  constructor(private readonly service: UserService = userService) {}

  createUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.service.createUser(req.body as CreateUserInput);
    res
      .status(201)
      .json(new ApiResponse(201, user, "User created successfully"));
  });

  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.service.getUserById(req.params.id as string);
    res.status(200).json(new ApiResponse(200, user, "User retrieved successfully"));
  });

  getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search ? String(req.query.search) : undefined;

    const result = await this.service.getAllUsers({ page, limit, search });
    res.status(200).json(new ApiResponse(200, result, "Users retrieved successfully"));
  });

  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.service.updateUser(req.params.id as string, req.body as UpdateUserInput);
    res.status(200).json(new ApiResponse(200, user, "User updated successfully"));
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    await this.service.deleteUser(req.params.id as string);
    res.status(200).json(new ApiResponse(200, null, "User deleted successfully"));
  });
}

export const userController = new UserController();
