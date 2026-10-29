# AutoAndes Web

Angular 22 standalone SPA. The existing class-project layout and shared CSS are the design reference.

## Run

```powershell
npm ci
ng serve
```

If Angular CLI is not global, use `npm start` (runs the local `ng serve`).
Node 24 is available locally. Default address: `http://localhost:4200`.
API URL: `src/environments/environment*.ts`, default `http://localhost:8080/api/v1`.

## Current status: Question 4

Standalone SPA with lazy routes and the reference class-project layout: navy 64px
header, collapsible 240px sidebar, light gray content, white cards and navy tables.
Implemented modules: Services and Vehicles, one reusable reactive create/edit form
per resource. Customer options and all business lists come from the secured backend.
Services support search, edit, delete and confirmed activation/deactivation. Vehicles
show customer names and support a server-side customer filter, edit and delete.
Loading/empty/error states, per-control backend 400 messages, recoverable 404/409
messages and a 404 page are included.

The login/session foundation is included now because the API requires JWT. The login
is outside the layout. Session data lives in signals and sessionStorage, expires
automatically and is removed on logout. One interceptor attaches Bearer only to
the API; another redirects on non-login 401 with returnUrl. A 403 preserves session.
Routes and mutation buttons check permissions. The API enforces them independently.
Orders, reporting and the complete frontend security evaluation follow in Question 5.

API test users: admin (all permissions), asesor (vehicle/order operations), jefe
(service maintenance/report/cancellation), inactivo (login rejected). All use
`Auto2026*`. Start the backend first, then run the SPA. If the backend starts with
a temporary JWT key, log in again after restarting it.

## Verification

```powershell
npm run build
npm test -- --watch=false
```

The component tests use Angular's HTTP testing controller only in test files;
the application never uses simulated services. Tests cover backend field errors,
missing edit records and preserving vehicle input after a duplicate-plate 409.
Browser verification and screenshots are recorded in `docs/phase4-validation.md`.
