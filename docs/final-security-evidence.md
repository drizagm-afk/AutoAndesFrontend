# Final manual frontend security evidence

These are final delivery capture steps, not a request to stop development or run
them during the earlier implementation checkpoints.

1. Start the backend and SPA, then log in as asesor using Auto2026*.
2. Register an order and capture its number, header, detail and saved total.
3. Log in as jefe. Capture the menu without Nueva orden and direct navigation to
   /ordenes/nueva showing Acceso denegado. Confirm permitted navigation still works.
4. To capture the required altered-session-token behavior, use browser DevTools:
   Application > Session Storage > http://localhost:4200, key autoandes.sesion.
   Change the token string in the stored JSON (for example append x), preserving
   the other fields. Navigate to Órdenes or another page that calls the API.
   The request receives 401; the SPA clears the session and returns to login with
   returnUrl. Capture that result. Do not alter or share the signing secret.
5. Confirm a 403 leaves the session intact; the final Postman collection provides
   advisor/manager forbidden-operation requests for the backend evidence.

All application passwords here are the exam's documented seed credentials.
Export the Postman environment without saved tokens. Screenshots should avoid
showing passwords, tokens or local database credentials.
