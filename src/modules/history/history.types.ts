export type PlaybackEvent = "timeupdate" | "play" | "pause" | "ended" | "seeked";

export interface PlaybackProgressInput {
  event: PlaybackEvent;
  currentTime: number;
  duration: number;
  progress: number;
  id?: string | number;
  mediaType?: "movie" | "tv";
  season?: number | null;
  episode?: number | null;
  timestamp?: number;
}

export interface IPlaybackProgress {
  event: PlaybackEvent;
  currentTime: number;
  duration: number;
  progress: number;
  season?: number | null;
  episode?: number | null;
  timestamp: number;
}

export interface HistoryItem {
  id: number;
  media_type?: "movie" | "tv";
  progress: IPlaybackProgress;
  updatedAt: Date | string;
  [key: string]: any;
}

export interface HistoryListResponse {
  page: number;
  total_pages: number;
  total_results: number;
  results: HistoryItem[];
}

export interface HistoryActionResponse {
  success: boolean;
  message: string;
  media_id?: number;
  data?: HistoryItem | null;
}

export interface HistoryStatusResponse {
  media_id: number;
  item_present: boolean;
  data?: HistoryItem | null;
}
