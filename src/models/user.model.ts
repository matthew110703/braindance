import mongoose, { Schema, Document } from "mongoose";

export interface IPlaybackProgress {
  event: "timeupdate" | "play" | "pause" | "ended" | "seeked";
  currentTime: number;
  duration: number;
  progress: number;
  season?: number | null;
  episode?: number | null;
  timestamp: number;
}

export interface IEpisodePlaybackProgress extends IPlaybackProgress {
  updatedAt?: Date | string;
}

export interface IHistoryItem {
  id: number;
  media_type?: "movie" | "tv";
  progress: IPlaybackProgress;
  episodes?: Record<string, IEpisodePlaybackProgress>;
  updatedAt?: Date;
  [key: string]: unknown;
}

export interface IWatchlistEntry {
  media_id: number;
  media_type: "movie" | "tv";
  addedAt: Date;
}

export interface IUser extends Document {
  deviceToken: string; // Unique client token / header
  watchlist: number[]; // Legacy movie IDs
  watchlistItems: IWatchlistEntry[]; // Typed movie & TV watchlist entries
  history: IHistoryItem[]; // Array of watch history items with compact media metadata & progress
  createdAt: Date;
  updatedAt: Date;
}

const WatchlistEntrySchema = new Schema<IWatchlistEntry>(
  {
    media_id: { type: Number, required: true },
    media_type: { type: String, enum: ["movie", "tv"], default: "movie" },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const HistoryItemSchema = new Schema<IHistoryItem>(
  {
    id: { type: Number, required: true },
    media_type: { type: String, enum: ["movie", "tv"], default: "movie" },
    progress: {
      event: {
        type: String,
        enum: ["timeupdate", "play", "pause", "ended", "seeked"],
        required: true,
      },
      currentTime: { type: Number, required: true },
      duration: { type: Number, required: true },
      progress: { type: Number, required: true },
      season: { type: Number, default: null },
      episode: { type: Number, default: null },
      timestamp: { type: Number, default: () => Date.now() },
    },
    episodes: { type: Schema.Types.Mixed, default: undefined },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false, strict: false }
);

const UserSchema = new Schema<IUser>(
  {
    deviceToken: { type: String, required: true, unique: true, index: true },
    watchlist: [{ type: Number }],
    watchlistItems: { type: [WatchlistEntrySchema], default: [] },
    history: [HistoryItemSchema],
  },
  { timestamps: true }
);

export const UserModel =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
