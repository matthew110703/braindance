import { UserModel, IUserDocument } from "./user.model.js";
import { CreateUserInput, UpdateUserInput, GetUsersQueryInput } from "./user.schema.js";

export class UserRepository {
  async create(data: CreateUserInput): Promise<IUserDocument> {
    return UserModel.create(data);
  }

  async findById(id: string): Promise<IUserDocument | null> {
    return UserModel.findById(id);
  }

  async findByEmail(email: string): Promise<IUserDocument | null> {
    return UserModel.findOne({ email });
  }

  async findAll(query: GetUsersQueryInput): Promise<{ users: IUserDocument[]; total: number }> {
    const { page = 1, limit = 10, search } = query;
    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      UserModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      UserModel.countDocuments(filter),
    ]);

    return { users, total };
  }

  async updateById(id: string, data: UpdateUserInput): Promise<IUserDocument | null> {
    return UserModel.findByIdAndUpdate(
      id,
      { $set: data },
      { returnDocument: "after", runValidators: true }
    );
  }

  async deleteById(id: string): Promise<IUserDocument | null> {
    return UserModel.findByIdAndDelete(id);
  }
}

export const userRepository = new UserRepository();
