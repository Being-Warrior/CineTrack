# CineTrack Project Context

## Project Overview
CineTrack is a full-stack movie and series tracking application. It allows users to create an account, maintain a personalized watch list, update viewing status, store notes and ratings, and fetch related entertainment news based on tracked titles.

This document captures the current implementation state of the codebase and serves as a quick onboarding/context reference.

## Repository Structure

- `movie-tracker-frontend/` - React + Vite web app (UI, routing, auth state, API integration)
- `movie-tracker-backend/` - Node.js + Express API (auth, content tracking, news integration, MySQL access)
- `README.md` - placeholder template documentation (not fully aligned with implemented code)

## Architecture

1. User interacts with the frontend SPA.
2. Frontend calls backend APIs via `/api` (Vite proxy in development).
3. Backend validates JWTs for protected endpoints.
4. Backend reads/writes application data in MySQL.
5. Backend fetches external news from The Guardian API and returns curated results.

## Technology Stack

### Frontend (`movie-tracker-frontend`)
- React 18
- Vite
- React Router DOM
- Axios
- Tailwind CSS
- PostCSS + Autoprefixer
- Lucide React icons
- React Hot Toast

### Backend (`movie-tracker-backend`)
- Node.js (ESM modules)
- Express
- MySQL (`mysql2/promise`)
- JWT auth (`jsonwebtoken`)
- Password hashing (`bcryptjs`)
- CORS
- Dotenv
- Axios (external API calls)
- Nodemon (development)

## Core Features (Currently Implemented)

### Authentication
- User registration with hashed passwords
- User login returning JWT + profile payload
- Authenticated "current user" endpoint (`/api/auth/me`)
- Frontend auth context stores token in local storage and attaches it to API requests

### Protected Application Flow
- Protected routes for authenticated-only pages
- Redirect to login when no valid token is found

### Content Tracking (Movies/Series)
- Add content entries (title + content type + optional metadata)
- Store status (`watchlist`, `watching`, `completed`, `dropped`)
- Optional rating, platform, notes
- View entries list
- Filter entries by status
- Update entries
- Delete entries

### Personalized News
- Fetch related entertainment news using recently tracked titles
- Display article list with title, section, date, and source link

### UI/UX
- Dark and light theme toggle
- Theme preference persistence in local storage
- Toast notifications for key user actions

## Data Model (MySQL)

### `users`
- `user_id` (PK)
- `username` (unique)
- `email` (unique)
- `password_hash`
- `created_at`

### `content`
- `content_id` (PK)
- `title`
- `content_type` (`movie` or `series`)
- `release_year`
- `genre`
- `poster_url`
- `overview`
- `created_at`

### `user_content`
- `id` (PK)
- `user_id` (FK -> users.user_id)
- `content_id` (FK -> content.content_id)
- `status` enum (`watchlist`, `watching`, `completed`, `dropped`)
- `rating` (1-10)
- `platform`
- `notes`
- timestamps
- unique pair (`user_id`, `content_id`) to prevent duplicates

## API Surface (Current Wiring)

### Auth Routes (`/api/auth`)
- `POST /register`
- `POST /login`
- `GET /me` (protected)

### Content Routes (`/api/content`) - protected
- `GET /` (optional status filter)
- `POST /`
- `PATCH /:id`
- `DELETE /:id`
- `GET /news`

## Frontend Routing (Current Wiring)
- `/` -> Home
- `/login` -> Login
- `/register` -> Register
- `/dashboard` -> Dashboard (protected)

## Environment Variables

### Backend expected by code
- `PORT`
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`
- `GUARDIAN_API_KEY`

> Note: `.env.example` currently uses `GNEWS_API_KEY`, while code expects `GUARDIAN_API_KEY`.

## Scripts

### Backend
- `npm run dev` - start server with nodemon
- `npm start` - start server with node

### Frontend
- `npm run dev` - start Vite development server
- `npm run build` - production build
- `npm run preview` - preview production build

## Current Capability Summary (What It Can Do End-to-End)

- Register and authenticate users
- Protect routes based on login state
- Let each user maintain a personal list of movies/series
- Update status/rating/notes/platform for each tracked item
- Filter tracked items by viewing status
- Delete tracked items
- Fetch and read related entertainment news
- Persist session token and UI theme preference in browser storage

## Known Gaps / Partially Wired Areas

- Frontend has pages/features for search and `user-content` workflows that are not fully wired in current router/backend mounting.
- Login flow navigates to `/search`, but `/search` is not currently defined in active frontend routes.
- `user-content` backend routes exist but are not mounted in backend app initialization.
- Search endpoint expected by frontend (`/api/content/search`) is not currently implemented in mounted backend routes.
- Top-level `README.md` still contains template placeholders and should be replaced/updated with project-specific docs.

## Recommended Next Documentation Actions

1. Update `README.md` with concise setup and feature summary.
2. Add endpoint request/response examples to backend docs.
3. Document intended search integration plan (TMDB/internal search).
4. Add deployment notes (hosting, environment strategy, database provisioning).
5. Add testing strategy and test coverage goals.
