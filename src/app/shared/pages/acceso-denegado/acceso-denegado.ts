import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-acceso-denegado',
  imports: [RouterLink],
  template: `<section class="card">
    <h2>Acceso denegado</h2>
    <p>No tiene permisos para acceder a esta página.</p>
    <a class="btn" routerLink="/inicio">Volver al inicio</a>
  </section>`,
})
export class AccesoDenegado {}
