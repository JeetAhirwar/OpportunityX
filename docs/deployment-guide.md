# Deployment Guide

## Local

1. Install with `npm run install:all`.
2. Copy both `.env.example` files to `.env`.
3. Replace backend placeholders, especially `MONGODB_URI` and `JWT_SECRET`.
4. Start the backend with `npm run dev:backend`.
5. Start the frontend with `npm run dev`.

## Render backend

- Root directory: `backend`
- Build command: `npm ci`
- Start command: `npm start`
- Health check: `/api/health`
- Set `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`,
  `ACCESS_TOKEN_EXPIRY`, `CORS_ORIGIN`, and `CLIENT_URL`.

Render normally injects `PORT`; do not hardcode it. Local upload storage is
ephemeral on many hosting plans, so configure durable storage before
production uploads.

## Vercel or Render frontend

- Root directory: `frontend`
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_API_BASE_URL=https://your-backend-service.onrender.com/api`
- Add an SPA rewrite so unknown browser routes resolve to `index.html`.

`CORS_ORIGIN` on the backend must include the exact deployed frontend origin.
Do not use wildcard CORS with credentials in production.
