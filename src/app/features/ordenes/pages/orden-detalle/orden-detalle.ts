import { Component, inject, input, OnInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Orden } from '../../../../core/models/orden.model';
import { OrdenService } from '../../../../core/services/orden-service';
import { mensajeError } from '../../../../core/utils/http-error';
import { SiPermiso } from '../../../../shared/directives/si-permiso';
import { AnularOrden } from '../../../../shared/components/anular-orden/anular-orden';
@Component({
  selector: 'app-orden-detalle',
  imports: [DatePipe, DecimalPipe, RouterLink, SiPermiso, AnularOrden],
  templateUrl: './orden-detalle.html',
})
export class OrdenDetalle implements OnInit {
  readonly id = input.required<string>();
  private readonly api = inject(OrdenService);
  readonly orden = signal<Orden | null>(null);
  readonly error = signal('');
  readonly cargando = signal(false);
  readonly anulando = signal(false);
  readonly aviso = signal('');
  ngOnInit(): void {
    this.cargar();
  }
  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.api
      .obtener(Number(this.id()))
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({ next: (o) => this.orden.set(o), error: (e) => this.error.set(mensajeError(e)) });
  }
  anulada(o: Orden): void {
    this.orden.set(o);
    this.anulando.set(false);
    this.aviso.set('Orden anulada correctamente.');
  }
}
