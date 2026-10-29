import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ReporteService } from '../../../../core/services/reporte-service';
import { IngresoPorServicio } from '../../../../core/models/orden.model';
import { mensajeError } from '../../../../core/utils/http-error';
import { rangoFechas } from '../../../ordenes/validators';
@Component({
  selector: 'app-ingresos',
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './ingresos.html',
})
export class Ingresos implements OnInit {
  private readonly api = inject(ReporteService);
  readonly items = signal<IngresoPorServicio[]>([]);
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly total = computed(
    () => this.items().reduce((s, r) => s + Math.round(r.importeTotal * 100), 0) / 100,
  );
  readonly form = inject(NonNullableFormBuilder).group(
    { desde: [''], hasta: [''] },
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
    this.cargando.set(true);
    this.error.set('');
    const r = this.form.getRawValue();
    this.api
      .ingresos(r.desde, r.hasta)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (rows) => this.items.set(rows),
        error: (e) => this.error.set(mensajeError(e)),
      });
  }
}
