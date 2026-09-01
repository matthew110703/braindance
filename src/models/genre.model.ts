import mongoose, { Schema, Document } from "mongoose";

export interface IGenreItem {
  id: number;
  name: string;
}

export interface IGenreDoc extends Document {
  type: "movie" | "tv";
  language: string;
  genres: IGenreItem[];
  lastFetchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GenreItemSchema = new Schema<IGenreItem>(
  {
    id: { type: Number, required: true },
    name: { type: String, required: true },
  },
  { _id: false }
);

const GenreSchema = new Schema<IGenreDoc>(
  {
    type: { type: String, enum: ["movie", "tv"], required: true },
    language: { type: String, default: "en", required: true },
    genres: [GenreItemSchema],
    lastFetchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Compound unique index for type and language
GenreSchema.index({ type: 1, language: 1 }, { unique: true });

export const GenreModel =
  mongoose.models.Genre || mongoose.model<IGenreDoc>("Genre", GenreSchema);
