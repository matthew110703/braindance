import { Request, Response } from "express";
import { streamingService, StreamingService } from "./streaming.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import {
  CreateServerBody,
  UpdateServerBody,
  ResolveEmbedUrlQuery,
  ResolveDirectStreamQuery,
} from "./streaming.schema.js";
import { vidriftDirectService } from "./vidriftDirect.service.js";

export class StreamingController {
  constructor(private readonly service: StreamingService = streamingService) {}

  getAllServers = asyncHandler(async (_req: Request, res: Response) => {
    const servers = await this.service.getAllServers();
    res
      .status(200)
      .json(new ApiResponse(200, servers, "Streaming servers retrieved successfully"));
  });

  getServerById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const server = await this.service.getServerById(id);
    res
      .status(200)
      .json(new ApiResponse(200, server, "Streaming server details retrieved successfully"));
  });

  createServer = asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as CreateServerBody;
    const server = await this.service.createServer(body);
    res
      .status(201)
      .json(new ApiResponse(201, server, "Streaming server created successfully"));
  });

  updateServer = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const body = req.body as UpdateServerBody;
    const server = await this.service.updateServer(id, body);
    res
      .status(200)
      .json(new ApiResponse(200, server, "Streaming server updated successfully"));
  });

  deleteServer = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await this.service.deleteServer(id);
    res
      .status(200)
      .json(new ApiResponse(200, null, "Streaming server deleted successfully"));
  });

  resolveEmbedUrl = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ResolveEmbedUrlQuery;
    const servers = await this.service.getAvailableServersForMedia({
      type: query.type,
      tmdbId: query.tmdbId,
      season: query.season,
      episode: query.episode,
      anilistId: query.anilistId,
    });

    const selectedServer = query.serverId
      ? servers.find((s) => s.id === query.serverId) || servers[0]
      : servers[0];

    res.status(200).json(
      new ApiResponse(
        200,
        {
          selectedServer,
          availableServers: servers,
        },
        "Stream embed URL resolved successfully"
      )
    );
  });

  resolveDirectStream = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ResolveDirectStreamQuery;
    const resolved = await vidriftDirectService.resolveDirectStream({
      type: query.type,
      tmdbId: query.tmdbId,
      season: query.season,
      episode: query.episode,
    });

    res
      .status(200)
      .json(new ApiResponse(200, resolved, "Direct HLS stream resolved successfully"));
  });
}

export const streamingController = new StreamingController();
