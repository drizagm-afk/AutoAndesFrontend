import { Component, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Orden } from '../../../core/models/orden.model';
import { OrdenService } from '../../../core/services/orden-service';
import { mensajeError, camposError } from '../../../core/utils/http-error';
import { FieldError } from '../field-error/field-error';
@Component({
  selector: 'app-anular-orden',
  imports: [ReactiveFormsModule, FieldError],
  template: ` <section class="card anulacion" aria-label="Anular orden">
    <h3>Anular {{ orden().numero }}</h3>
    <p>La orden conservará su detalle y se excluirá del reporte de ingresos.</p>
    @if (error()) {
      <div class="alerta" role="alert">{{ error() }}</div>
    }
    <form [formGroup]="form" (ngSubmit)="anular()" novalidate>
      <label for="motivo-anulacion">Motivo de anulación</label
      ><textarea
        id="motivo-anulacion"
        class="input"
        rows="3"
        formControlName="motivo"
        [readOnly]="guardando()"
      ></textarea>
      <app-field-error
        [control]="form.controls.motivo"
        [server]="campo()"
        mensaje="El motivo debe tener entre 10 y 200 caracteres."
      />
      <div class="acciones">
        <button type="button" class="btn" [disabled]="guardando()" (click)="cancelar.emit()">
          Volver</button
        ><button type="submit" class="btn btn-peligro" [disabled]="guardando()">
          {{ guardando() ? 'Anulando...' : 'Confirmar anulación' }}
        </button>
      </div>
    </form>
  </section>`,
})
export class AnularOrden {
  readonly orden = input.required<Orden>();
  readonly completada = output<Orden>();
  readonly cancelar = output<void>();
  private readonly api = inject(OrdenService);
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly campo = signal<string | undefined>(undefined);
  readonly form = inject(NonNullableFormBuilder).group({
    motivo: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
  });
  anular(): void {
    if (this.guardando()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set('');
    this.campo.set(undefined);
    this.api
      .anular(this.orden().id, this.form.getRawValue().motivo)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: (o) => this.completada.emit(o),
        error: (e) => {
          this.error.set(mensajeError(e));
          this.campo.set(camposError(e)['motivo']);
        },
      });
  }
}
