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

## Phase 0 status

Buildable foundation and shared reference styles only. The initial page is a setup
notice, with no mock business data. The final header/sidebar, CRUD, session, and
permission routing are implemented in Questions 4 and 5.

Required API test users (created in the backend seed phase): admin, asesor, jefe,
inactivo; password `Auto2026*`. API contract and final usage instructions will be
completed alongside implementation.
