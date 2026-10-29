import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth-service';
@Component({
  selector: 'app-inicio',
  imports: [RouterLink],
  template: ` <section class="card">
    <h2>Bienvenido a AutoAndes</h2>
    <p>{{ auth.sesion()?.nombreCompleto }}, seleccione un módulo para comenzar.</p>
    <div class="acciones">
      @if (auth.tienePermiso('SERVICIO_LEER')) {
        <a class="btn btn-primary" routerLink="/servicios">Consultar servicios</a>
      }
      @if (auth.tienePermiso('VEHICULO_LEER')) {
        <a class="btn" routerLink="/vehiculos">Consultar vehículos</a>
      }
    </div>
  </section>`,
})
export class Inicio {
  readonly auth = inject(AuthService);
}
