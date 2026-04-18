# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- Install dependencies: `pnpm install`
- Start development server: `pnpm dev`
- Build for production: `pnpm build`
- Preview production build: `pnpm preview`

There is currently no lint script or test script configured in `package.json`.

## Runtime requirements

The app requires these Vite env vars in `.env`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Without them, `src/lib/supabase.ts` throws during startup.

## Architecture overview

This is a React + TypeScript + Vite single-page app for managing job applications.

### App shell and routing

- `src/main.tsx` loads global styles and mounts the app.
- `src/app/App.tsx` wraps the router with `AuthProvider`.
- `src/app/router.tsx` defines two routes:
  - `/auth` → authentication page
  - `/` → protected board page
- `src/components/ProtectedRoute.tsx` blocks unauthenticated access to the board and redirects to `/auth`.

### Authentication

Authentication is handled entirely through Supabase Auth.

- `src/hooks/useAuth.tsx` owns session restoration, auth state subscription, and exposes `signIn`, `signUp`, `signOut`.
- Future auth-related changes should continue to flow through this context instead of calling Supabase auth ad hoc inside pages.

### Business data model

The core entity is `Application` in `src/types/application.ts`.

Important fields:
- `company_name`
- `job_title`
- `stage`
- `next_deadline`
- `user_id`

Stage values are fixed in `src/constants/stages.ts`. The UI and grouping logic assume this fixed ordered stage list.

### Data access layer

All Supabase data access is centralized in `src/lib/applications.ts`.

Current operations include:
- list applications
- create application
- update application
- update only application stage
- delete application

When changing board behavior, forms, or drag-and-drop, prefer extending this module rather than writing inline Supabase queries in UI components.

### Board flow

`src/pages/board/BoardPage.tsx` is the main integration container for the product flow:
- loads all applications after auth is ready
- stores the in-memory application list
- handles create/edit/delete actions
- groups applications by stage for rendering
- integrates drag-and-drop stage updates
- renders the deadline summary panel

Presentation is split across reusable components in `src/components/`:
- `BoardColumn` for each stage column
- `ApplicationCard` for each application card
- `DeadlinePanel` for urgent deadline summary

### Drag and drop

Drag-and-drop uses dnd-kit.

- Columns are droppable targets keyed by stage.
- Cards are sortable draggable items keyed by application id.
- `BoardPage` performs optimistic local stage updates, then persists through `updateApplicationStage`.
- On persistence failure, it restores the previous application list.

If adjusting drag behavior, preserve this optimistic-update-then-rollback pattern.

### Deadline logic

Deadline display and urgency rules are centralized in `src/lib/deadlines.ts`.

Current rules:
- overdue: deadline before today
- upcoming: within 3 days
- normal: later than that
- missing: no valid deadline

Both card styling and the homepage urgent panel depend on this shared logic.

### Styling

- `src/styles/tokens.css` defines design tokens.
- `src/styles/global.css` holds all app-level styles.

This codebase currently uses global CSS rather than CSS modules or component-scoped styling.

## README alignment

`README.md` contains the user-facing startup flow and a concise project overview. Keep `README.md` and this file aligned when changing startup commands or major architecture.