# Job Application Tracker — Web

Angular frontend for the [Job Application Tracker API](https://github.com/AhmedSamiir51/job-application-tracker-api). Track every job application from wishlist to offer: pipeline view, status history, notes and search-wide stats.

**Live demo:** https://job-application-tracker-web-ecru.vercel.app

## Stack

- **Angular 22** — standalone components, signals, lazy-loaded routes, the new `@if` / `@for` template syntax
- **Reactive Forms** with client-side validation that mirrors the API's FluentValidation rules
- **HttpClient** with a functional JWT interceptor and functional route guards
- Hand-rolled CSS (custom properties, responsive grid) — no UI framework

## Features

- **Auth** — register and sign in against the API's JWT endpoints. The session is kept in `localStorage` and expires with the token. A 401 signs you out and returns you to the login page.
- **Dashboard** — total / in-progress / offers / response-rate cards, a pipeline bar chart per status and the five most recently updated applications.
- **Applications** — debounced search (company, position, location), status and work-mode filters, six sort orders and server-side pagination.
- **Application detail** — full record, allowed status transitions driven by the API (invalid transitions are impossible to trigger), a notes stream and a status-history timeline.
- **Create / edit** — one form for both, with field-level server errors (RFC 7807 `ProblemDetails`) mapped back onto the inputs.

## Architecture

```
src/app/
├── core/                 # API client, auth store (signals), JWT interceptor, guards, error mapping
│   ├── api.service.ts    #   typed client for every endpoint
│   ├── auth.store.ts     #   session state + persistence
│   ├── auth.interceptor.ts
│   ├── auth.guard.ts
│   ├── errors.ts         #   ProblemDetails → readable messages / field errors
│   └── models.ts         #   DTOs mirroring the API contract
├── pages/
│   ├── auth/             #   sign in + register (one component, route-driven mode)
│   ├── dashboard/
│   ├── applications/     #   list, filters, pagination
│   ├── application-detail/
│   └── application-form/ #   create + edit
└── shared/               #   status badge, label pipes
```

## Configuration

The API base URL lives in `src/environments/`:

```ts
// environment.ts        → local API (docker compose / dotnet run)
// environment.prod.ts   → the deployed API
```

The production build swaps the files via `fileReplacements` in `angular.json`.

## Running locally

```bash
npm install
npm start          # http://localhost:4200, expects the API on http://localhost:8080
```

Build for production:

```bash
npm run build      # outputs to dist/job-application-tracker-web/browser
```

## Deployment

Deployed on [Vercel](https://vercel.com) at https://job-application-tracker-web-ecru.vercel.app. `vercel.json` adds the SPA rewrite so deep links (`/applications/…`) resolve to `index.html`. Every push to `main` redeploys automatically.
