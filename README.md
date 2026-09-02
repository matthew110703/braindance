# 🧠 Braindance API

> High-performance media discovery, watch telemetry, franchise collections, and device-isolated watchlist engine powered by TMDB and MongoDB Atlas.

---

## 📌 Overview

**Braindance API** is a production-grade backend service built to power modern streaming and media exploration clients. It orchestrates external metadata from The Movie Database (TMDB), enriches responses with production-sanitized payloads, caches high-frequency datasets in MongoDB Atlas, and manages device-isolated watchlists and video playback progress telemetry.

---

## 🚀 Core Features (High-Level)

- 🎬 **Media Discovery & Franchise Collections**: Comprehensive filtering, trending content, movie details, multi-season TV series, and franchise collections (e.g., Star Wars, Avengers).
- ⚡ **TTL-Cached Official Genres**: Movie and TV genres cached in MongoDB with automated TTL revalidation to ensure sub-30ms responses.
- 📱 **Device-Isolated Watchlists**: Anonymous, zero-login user watchlists isolated by `X-Device-Id` with full TMDB hydration.
- ⏱️ **Watch History & Telemetry Optimization**: High-frequency playback progress tracking (`timeupdate`, `seeked`, `ended`) storing flat media metadata with embedded progress and MRU ordering.
- 🛡️ **App-Level API Key Security**: Route protection powered by constant-time string comparison (`crypto.timingSafeEqual`) on `X-API-Key`.
- 🗜️ **Optimized Production Pipeline**: Built with SWC for sub-second compilation, Pino for structured JSON logging, Helmet, CORS, and Express rate limiting.

---

## 🏷️ Versioning Strategy

Braindance follows **Semantic Versioning (SemVer)** and **URI-Path Versioning**:

### 1. Semantic Versioning (`MAJOR.MINOR.PATCH`)
The application version is managed centrally in [`package.json`](./package.json) and dynamically reported by the public API status route (`GET /`).

To bump the version:
```bash
# Bug fixes & non-breaking patches (1.0.0 -> 1.0.1)
pnpm version patch

# New backward-compatible features & endpoints (1.0.0 -> 1.1.0)
pnpm version minor

# Breaking architectural changes (1.0.0 -> 2.0.0)
pnpm version major
```

### 2. URI-Path Routing (`/api/v1/*`)
All business routes are mounted under `/api/v1/`. If breaking contract changes are introduced in future releases, a new `/api/v2/` router can be added alongside `/api/v1/` without breaking existing mobile or web clients.

---

## 📂 Architecture Overview

```text
braindance/
├── .github/workflows/      # Automated CI/CD & Render deployment pipeline
├── src/
│   ├── adapters/           # External API integrations (TMDB Axios adapter)
│   ├── config/             # Zod-validated environment, database & logger config
│   ├── middleware/         # Auth (protect), rate-limiting, device ID, error handler
│   ├── models/             # Mongoose schemas (users, cached genres)
│   ├── modules/            # Modular feature domains:
│   │   ├── collection/     # Franchise collections
│   │   ├── discover/       # Movie & TV discovery with advanced filters
│   │   ├── genre/          # MongoDB-cached official genres
│   │   ├── health/         # System & database health monitoring
│   │   ├── history/        # Watch progress telemetry & history
│   │   ├── list/           # TMDB custom curated lists
│   │   ├── movie/          # Movie details, now-playing, recommendations
│   │   ├── search/         # Multi, title, and keyword search
│   │   ├── trending/       # Daily & weekly trending media
│   │   ├── tv/             # TV series, seasons & episode details
│   │   └── watchlist/      # Device-isolated user watchlist
│   ├── routes/             # Central v1 and global Express routing
│   ├── utils/              # ApiResponse, ApiError, sanitizers & cache helpers
│   ├── app.ts              # Express application setup
│   └── server.ts           # HTTP server bootstrap & graceful shutdown
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (refer to [`.env.example`](./.env.example)):

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Environment mode (`development`, `production`, `test`) | `development` |
| `PORT` | HTTP server port | `8001` |
| `DATABASE_URL` | MongoDB connection URI (Atlas / ReplicaSet) | `mongodb://...` |
| `CORS_ORIGIN` | Allowed CORS origins | `*` |
| `TMDB_ACCESS_TOKEN` | TMDB API Read Access Token (Bearer JWT) | `eyJhbGciOi...` |
| `TMDB_BASE_URL` | TMDB API base URL | `https://api.themoviedb.org/3` |
| `API_KEY` | Secret key required in the `X-API-Key` request header | `bd_live_secret_key` |
| `CACHE_TTL_HOURS` | Cache TTL in hours for official genres | `168` (7 days) |
| `LOG_LEVEL` | Pino logging level (`info` for prod, `debug` for dev) | `info` |
| `RATE_LIMIT_WINDOW_MS` | Rate limiting window in milliseconds | `900000` (15 mins) |
| `RATE_LIMIT_MAX` | Max requests per IP within the rate limit window | `100` |

---

## 🛠️ Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Development Mode
Runs the TypeScript watcher and live reload server concurrently:
```bash
pnpm dev
```

### 3. Production Build & Start
```bash
# Type check and compile with SWC to dist/
pnpm run build

# Start production server
pnpm start
```

---

## 🚢 CI/CD & Deployment

- **Continuous Integration**: On every push or pull request to `main`, GitHub Actions validates dependencies, runs strict TypeScript checking (`pnpm run typecheck`), and verifies the production build (`pnpm run build`).
- **Render Deployment**: Upon successful build checks on `main`, the workflow automatically triggers a zero-downtime deployment on Render via the configured Deploy Hook.
