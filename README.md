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

## Current status: Questions 4 and 5

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
Orders, reporting and frontend security are now included. API authorization remains
enforced independently by the backend.

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

## Orders and reporting

- `/ordenes/nueva`: vehicle/customer selection, mileage and 1–10 dynamic detail
  lines with active services and integer quantities 1–5. Duplicate services are
  disabled in other lines. Subtotals and the preview total update immediately.
- Only vehicleId, kilometraje, servicioId and cantidad are submitted. The backend
  calculates the saved prices and totals. Conflicts retain the entered lines;
  successful registration shows the returned order number and actual total.
- `/ordenes`: combined plate/state/date filters sent as API query parameters,
  newest orders first, empty/loading/error states and permission-aware actions.
- `/ordenes/:id`: saved header/detail, registering username, cancellation status
  and reason. Cancellation asks for a 10–200 character reason and displays backend
  same-day/state-rule rejections without clearing it.
- `/reportes`: date-filtered revenue rows already aggregated by the backend. The
  screen displays service code/name, total quantity and amount. Canceled orders
  are excluded by the backend query.

Navigation is lazy. authGuard protects the layout; invitadoGuard redirects signed-in
users away from login; permisoGuard reads each resource route's required permission
from data. si-permiso controls mutation buttons. The menu reacts to the session signal.

The session key is `autoandes.sesion` in sessionStorage. Expiration honors both the
JWT exp and login response lifetime. Automatic logout and non-login API 401 clear
the session and preserve returnUrl. Login failures and 403 do not clear a valid
session. Bearer is attached only to this API. The API validates actual token
signature/expiration and permissions; the frontend never grants backend access.

See `docs/phase5-validation.md` for automated/browser results and
`docs/final-security-evidence.md` for the remaining final evidence capture steps.
