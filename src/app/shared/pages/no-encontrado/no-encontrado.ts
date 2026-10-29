import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-no-encontrado',
  imports: [RouterLink],
  template: `<section class="card">
    <h2>Página no encontrada</h2>
    <p>La dirección solicitada no existe.</p>
    <a class="btn" routerLink="/inicio">Volver al inicio</a>
  </section>`,
})
export class NoEncontrado {}
