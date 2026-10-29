import { Component, inject, signal, OnInit } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Orden } from '../../../../core/models/orden.model';
import { OrdenService } from '../../../../core/services/orden-service';
import { mensajeError } from '../../../../core/utils/http-error';
import { SiPermiso } from '../../../../shared/directives/si-permiso';
import { AnularOrden } from '../../../../shared/components/anular-orden/anular-orden';
import { rangoFechas } from '../../validators';
@Component({
  selector: 'app-orden-list',
  imports: [ReactiveFormsModule, DatePipe, DecimalPipe, RouterLink, SiPermiso, AnularOrden],
  templateUrl: './orden-list.html',
})
export class OrdenList implements OnInit {
  private readonly api = inject(OrdenService);
  readonly items = signal<Orden[]>([]);
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly aviso = signal('');
  readonly seleccionada = signal<Orden | null>(null);
  readonly form = inject(NonNullableFormBuilder).group(
    { placa: [''], estado: [''], desde: [''], hasta: [''] },
    { validators: rangoFechas },
  );
  ngOnInit(): void {
    this.buscar();
  }
  buscar(): void {
    if (this.cargando()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error.set('');
    this.cargando.set(true);
    this.api
      .listar(this.form.getRawValue())
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({ next: (r) => this.items.set(r), error: (e) => this.error.set(mensajeError(e)) });
  }
  limpiar(): void {
    this.form.reset();
    this.buscar();
  }
  anulada(o: Orden): void {
    this.seleccionada.set(null);
    this.aviso.set('Orden ' + o.numero + ' anulada correctamente.');
    this.buscar();
  }
}
