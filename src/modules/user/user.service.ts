import { userRepository, UserRepository } from "./user.repository.js";
import { CreateUserInput, UpdateUserInput, GetUsersQueryInput } from "./user.schema.js";
import { ApiError } from "../../utils/apiError.js";
import { IUserDocument } from "./user.model.js";

export class UserService {
  constructor(private readonly repo: UserRepository = userRepository) {}

  async createUser(input: CreateUserInput): Promise<IUserDocument> {
    const existingUser = await this.repo.findByEmail(input.email);
    if (existingUser) {
      throw new ApiError(409, "User with this email already exists");
    }

    return this.repo.create(input);
  }

  async getUserById(id: string): Promise<IUserDocument> {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return user;
  }

  async getAllUsers(query: GetUsersQueryInput) {
    const { page = 1, limit = 10 } = query;
    const { users, total } = await this.repo.findAll(query);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<IUserDocument> {
    if (input.email) {
      const existingUser = await this.repo.findByEmail(input.email);
      if (existingUser && existingUser._id.toString() !== id) {
        throw new ApiError(409, "Email is already taken by another user");
      }
    }

    const updated = await this.repo.updateById(id, input);
    if (!updated) {
      throw new ApiError(404, "User not found");
    }
    return updated;
  }

  async deleteUser(id: string): Promise<void> {
    const deleted = await this.repo.deleteById(id);
    if (!deleted) {
      throw new ApiError(404, "User not found");
    }
  }
}

export const userService = new UserService();
