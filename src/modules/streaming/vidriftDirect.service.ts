import https from "node:https";
import { ApiError } from "../../utils/apiError.js";

const VIDRIFT_ORIGIN = "https://embed.vidrift.net";

interface OrionRung {
  width?: number;
  height?: number;
}

interface EmbedMetaPayload {
  orionStreams?: Array<{
    url?: string;
    type?: string;
    direct?: boolean;
    rungs?: OrionRung[];
  }>;
  evionUrl?: string;
  vexonUrl?: string;
  bigbangUrl?: string;
  selfhostUrl?: string | null;
}

export interface DirectStreamCandidate {
  url: string;
  source: string;
  maxHeight?: number;
}

export interface ResolvedDirectStream {
  streamUrl: string;
  alternateStreams: string[];
  source: string;
  maxHeight: number | null;
  subtitles: Array<{ id: number; label: string; lang: string; url: string }>;
}

function maxRungHeight(rungs?: OrionRung[]): number {
  if (!Array.isArray(rungs) || rungs.length === 0) return 0;
  return Math.max(...rungs.map((r) => (typeof r.height === "number" ? r.height : 0)));
}

function normalizeHttpsUrl(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const resolved =
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? new URL(trimmed)
        : new URL(trimmed.startsWith("/") ? trimmed : `/${trimmed}`, VIDRIFT_ORIGIN);

    if (resolved.protocol !== "https:") return null;
    return resolved.toString();
  } catch {
    return null;
  }
}

function sortCandidatesByQuality(candidates: DirectStreamCandidate[]): DirectStreamCandidate[] {
  return [...candidates].sort((a, b) => (b.maxHeight ?? 0) - (a.maxHeight ?? 0));
}

function extractStreamCandidates(html: string): DirectStreamCandidate[] {
  const candidates: DirectStreamCandidate[] = [];
  const seen = new Set<string>();

  const pushCandidate = (rawUrl: string | null | undefined, source: string, maxHeight = 0) => {
    const normalized = normalizeHttpsUrl(rawUrl);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    candidates.push({
      url: normalized,
      source,
      maxHeight: maxHeight > 0 ? maxHeight : undefined,
    });
  };

  const metaMatch = html.match(/var embedMeta = (\{[\s\S]*?\});/);
  if (metaMatch?.[1]) {
    try {
      const meta = JSON.parse(metaMatch[1]) as EmbedMetaPayload;
      if (Array.isArray(meta.orionStreams)) {
        for (const stream of meta.orionStreams) {
          pushCandidate(stream?.url, "vidrift-orion-direct", maxRungHeight(stream?.rungs));
        }
      }
      pushCandidate(meta.evionUrl, "vidrift-evion-direct");
      pushCandidate(meta.vexonUrl, "vidrift-vexon-direct");
      pushCandidate(meta.bigbangUrl, "vidrift-bigbang-direct");
      pushCandidate(meta.selfhostUrl, "vidrift-selfhost-direct");
    } catch {
      // ignore malformed embedMeta
    }
  }

  const orionMatches = html.match(/\/api\/orion\/[a-f0-9]+\/master\.m3u8/g);
  if (orionMatches) {
    for (const match of orionMatches) {
      pushCandidate(match, "vidrift-orion-direct");
    }
  }

  return sortCandidatesByQuality(candidates);
}

function extractSubtitleTracks(html: string): ResolvedDirectStream["subtitles"] {
  const subsMatch = html.match(/var subtitleTracks = (\[[\s\S]*?\]);/);
  if (!subsMatch?.[1]) return [];

  try {
    const rawSubs = JSON.parse(subsMatch[1]) as Array<{
      label?: string;
      lang?: string;
      code?: string;
      url?: string;
    }>;

    return rawSubs.reduce<ResolvedDirectStream["subtitles"]>((acc, s, idx) => {
      if (!s.url) return acc;
      const absoluteUrl = normalizeHttpsUrl(s.url);
      if (!absoluteUrl) return acc;
      acc.push({
        id: idx,
        label: s.label || s.lang || `Track ${idx + 1}`,
        lang: s.lang || s.code || "en",
        url: absoluteUrl,
      });
      return acc;
    }, []);
  } catch {
    return [];
  }
}

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
} as const;

function fetchRawHtmlHttps(url: string): Promise<{ status: number; data: string }> {
  return new Promise((resolve, reject) => {
    const req = https
      .get(
        url,
        {
          headers: BROWSER_HEADERS,
          timeout: 10000,
        },
        (res) => {
          // Node's https.get does not follow redirects; treat 3xx as non-success
          // so the fetch()-based path / relay can retry with redirect following.
          let data = "";
          res.setEncoding("utf8");
          res.on("data", (chunk: string) => {
            data += chunk;
          });
          res.on("end", () => resolve({ status: res.statusCode || 200, data }));
        }
      )
      .on("timeout", () => {
        req.destroy(new Error("Upstream stream timeout"));
      })
      .on("error", (err) => reject(err));
  });
}

async function fetchRawHtmlFollow(url: string, timeoutMs = 12000): Promise<{ status: number; data: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      redirect: "follow",
      signal: controller.signal,
    });
    const data = await res.text();
    return { status: res.status, data };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Datacenter IPs (Render/Vercel) often get Cloudflare 403 on embed.vidrift.net.
 * Google Translate fetches the page from Google's network and mirrors HTML that
 * still contains embedMeta / Orion URLs.
 */
async function fetchViaTranslateRelay(embedUrl: string): Promise<{ status: number; data: string }> {
  const relayUrl =
    "https://translate.google.com/translate?sl=auto&tl=en&u=" +
    encodeURIComponent(embedUrl);
  return fetchRawHtmlFollow(relayUrl, 15000);
}

async function fetchEmbedHtml(embedUrl: string): Promise<{ status: number; data: string; via: string }> {
  // 1) Direct (works from residential / unblocked egress)
  try {
    const direct = await fetchRawHtmlFollow(embedUrl);
    if (direct.status === 200 && /embedMeta|\/api\/orion\//.test(direct.data)) {
      return { ...direct, via: "direct" };
    }
    if (direct.status === 200 && direct.data.length > 1000) {
      return { ...direct, via: "direct" };
    }

    // 2) Translate relay when Cloudflare blocks datacenter IPs (403/etc.)
    if (direct.status !== 200) {
      const relayed = await fetchViaTranslateRelay(embedUrl);
      if (relayed.status === 200 && /embedMeta|\/api\/orion\//.test(relayed.data)) {
        return { ...relayed, via: "translate-relay" };
      }
      return { ...direct, via: "direct" };
    }
  } catch {
    // fall through to https.get / relay
  }

  // 3) Legacy https.get fallback, then relay
  try {
    const legacy = await fetchRawHtmlHttps(embedUrl);
    if (legacy.status === 200 && /embedMeta|\/api\/orion\//.test(legacy.data)) {
      return { ...legacy, via: "https.get" };
    }
  } catch {
    // ignore
  }

  const relayed = await fetchViaTranslateRelay(embedUrl);
  return { ...relayed, via: "translate-relay" };
}

export class VidriftDirectService {
  buildEmbedPageUrl(
    type: "movie" | "tv",
    tmdbId: number,
    season = 1,
    episode = 1
  ): string {
    return type === "tv"
      ? `${VIDRIFT_ORIGIN}/embed/tv/${tmdbId}/${season}/${episode}`
      : `${VIDRIFT_ORIGIN}/embed/movie/${tmdbId}`;
  }

  async resolveDirectStream(options: {
    type: "movie" | "tv";
    tmdbId: number;
    season?: number;
    episode?: number;
  }): Promise<ResolvedDirectStream> {
    const embedUrl = this.buildEmbedPageUrl(
      options.type,
      options.tmdbId,
      options.season ?? 1,
      options.episode ?? 1
    );

    const { status, data: html, via } = await fetchEmbedHtml(embedUrl);
    if (status !== 200) {
      throw new ApiError(502, `Upstream error: ${status}`, [
        `via:${via}`,
        `embed:${embedUrl}`,
      ]);
    }

    const candidates = extractStreamCandidates(html);
    if (candidates.length === 0) {
      throw new ApiError(404, "No direct stream found in upstream manifest", [
        `via:${via}`,
      ]);
    }

    const best = candidates[0];
    return {
      streamUrl: best.url,
      alternateStreams: candidates.slice(1).map((c) => c.url),
      source: best.source,
      maxHeight: best.maxHeight ?? null,
      subtitles: extractSubtitleTracks(html),
    };
  }
}

export const vidriftDirectService = new VidriftDirectService();
