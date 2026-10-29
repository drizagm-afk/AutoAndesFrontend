# Question 4 verification

Verified on 2026-10-29, America/Lima, against the secured Oracle-backed API.

## Implemented

- Angular 22 standalone components, core/shared/layout/features, environment API URL.
- Reference layout and shared styling: navy header, collapsible sidebar, cards/tables.
- Lazy child routes, routerLinkActive, 404 and access-denied pages.
- Services search, reusable create/edit form, physical deletion for unused services,
  and confirmed activation/deactivation.
- Vehicles list with customer names, reusable create/edit form, backend customer
  dropdown and backend customer filtering.
- Matching client validation, request-in-progress disabling, loading/empty/error
  states, field-specific backend errors, and recoverable 404/409 messages.
- Login/session/interceptors/permission foundations to consume the protected API.
  Complete Question 5 workflows and their security evaluation remain for Phase 5.

## Results

- Production build passed within configured budgets; pages load in separate lazy chunks.
- Three component tests passed: backend field validation/retry, missing edit target
  blocked from submission, and backend duplicate-plate recovery without losing input.
- Browser: admin login, service creation/edit/search/deactivation, vehicle
  creation/edit, backend customer selection/filtering, duplicate-plate 409 message,
  missing-record message with disabled edit form, and 404 route all verified.
- Advisor service mutations are hidden; a direct /servicios/nuevo navigation shows
  Acceso denegado while preserving the session and access to permitted pages.
- Sidebar collapse verified by the main content expanding to the left edge.
- Browser console: no errors reported by the browser verification tool.
- Test session logged out at the end.

The temporary records SRV-701 and UIT-701 were removed through the API after testing.
Oracle was checked afterward: 8 services, 8 vehicles, neither temporary record present.
All seeded business data remains intact. No backend source changes were required.

Screenshots under screenshots/ document the layout, customer filtering and backend
duplicate-plate message. They are development QA evidence; final exam screenshots
will be collected after Question 5 is complete. The customer-filter image includes
the temporary UI record before cleanup.

## Repeat locally

Start the backend with its README command, then `npm start` in this repository.
Use admin/Auto2026* for full CRUD, asesor/Auto2026* for vehicle writes and read-only
services, jefe/Auto2026* for service writes and read-only vehicles.

Run `npm run build` and `npm test -- --watch=false` for automated checks.
Local logs are ignored by Git: tmp-phase4-build.log and tmp-phase4-tests.log.
