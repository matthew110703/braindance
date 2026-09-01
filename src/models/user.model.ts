import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  deviceToken: string; // Unique client token / header
  watchlist: number[]; // Array of TMDB media IDs
  history: number[];   // Array of TMDB media IDs
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    deviceToken: { type: String, required: true, unique: true, index: true },
    watchlist: [{ type: Number }],
    history: [{ type: Number }],
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
