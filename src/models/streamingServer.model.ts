import mongoose, { Schema, Document } from "mongoose";

export interface IVidriftParams {
  brand?: string;
  brandColor?: string;
  brandLogo?: string;
  poster?: string;
  font?: string;
  exit?: number;
  showTitle?: number;
  watermark?: number;
  uiScale?: number;
  controlBg?: string;
  caps?: number;
  muted?: number;
  autoplay?: number;
  mobileSheets?: boolean;
  hide?: string;
}

export interface IStreamingServerDoc extends Document {
  id: string;
  name: string;
  baseUrl: string;
  moviePattern: string;
  tvPattern: string;
  anilistPattern: string;
  defaultParams: IVidriftParams;
  isActive: boolean;
  priority: number;
  quality?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StreamingServerSchema = new Schema<IStreamingServerDoc>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    baseUrl: { type: String, required: true },
    moviePattern: { type: String, required: true },
    tvPattern: { type: String, required: true },
    anilistPattern: { type: String, required: true },
    defaultParams: { type: Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true },
    priority: { type: Number, default: 1 },
    quality: { type: String, default: "4K HLS" },
  },
  { timestamps: true }
);

StreamingServerSchema.index({ isActive: 1, priority: 1 });

export const StreamingServerModel =
  mongoose.models.StreamingServer ||
  mongoose.model<IStreamingServerDoc>("StreamingServer", StreamingServerSchema);
