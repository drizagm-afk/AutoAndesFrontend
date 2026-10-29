# Question 5 verification

Verified on 2026-10-29, America/Lima, using the secured Oracle API.

## Automated tests

12 frontend tests passed across three files:

- Existing CRUD error/recovery cases.
- Dynamic order total previews, duplicate prevention, detail limit, backend 400
  field messages, 409 preservation/retry, and request bodies without client totals.
- API-only Bearer injection, changed stored token handling, 401 cleanup/returnUrl,
  403 and login-failure session preservation, automatic JWT expiration, internal
  return URLs, authentication/guest/permission guards.

Production build passed within the configured size budgets. All new feature pages
and routes are lazy loaded. Browser console reported no errors in the verified flow.

## Browser verification

1. Logged in as asesor. The menu included Nueva orden and excluded Reportes.
2. Selected AAA-111 and two services: SRV-001 quantity 2 (160.00) and SRV-002
   quantity 1 (60.00). Preview total: 220.00. Selecting SRV-001 again in line 2 was
   disabled. The inactive SRV-008 was absent from selectable order services.
3. Submitted mileage 44999. Backend returned the last mileage 45000 in its 409
   message; both lines, selected vehicle and quantities remained in the form.
4. Corrected to 45000 and registered OS-000015. Saved total: 220.00. Detail showed
   both saved lines, vehicle/customer, and usuarioRegistro=asesor.
5. Logged out and logged in as jefe. Nueva orden was absent. Direct navigation to
   /ordenes/nueva showed Acceso denegado while preserving the manager session.
6. Revenue report showed 540.00 before cancellation. The manager canceled the new
   order with reason 'Anulación de orden de prueba de interfaz'. Detail changed
   to ANULADA, retaining the lines, total and reason.
7. Revenue report then showed 320.00, excluding exactly the canceled 220.00.
8. Combined plate AAA, state ANULADA and date range 2026-10-29..2026-10-29
   returned OS-000015 only. Searching NO-MATCH showed the empty-result message.
9. Logged out after verification.

The test order is retained in Oracle as ANULADA for audit, consistent with the API
contract. No seed rows were changed or removed. Backend source edits already in
the workspace were left intact; this phase changed frontend source only.

Screenshots in screenshots/ record the conflict, saved order, access denial,
canceled order, and report before/after cancellation. The registered-order image
is historical evidence from before that same order was canceled.

Storage tampering and expiry mechanics are tested with Angular's HTTP testing
controller and fake time; backend altered/expired-token rejection was independently
verified in Question 3. Final manual browser evidence of the exact sessionStorage
tampering demonstration is listed separately for the delivery phase.
