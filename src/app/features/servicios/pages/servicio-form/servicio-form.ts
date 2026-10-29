import { Component, inject, input, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ServicioService } from '../../../../core/services/servicio-service';
import { ServicioRequest } from '../../../../core/models/resources';
import { mensajeError, camposError } from '../../../../core/utils/http-error';
import { FieldError } from '../../../../shared/components/field-error/field-error';

@Component({
  selector: 'app-servicio-form',
  imports: [ReactiveFormsModule, RouterLink, FieldError],
  templateUrl: './servicio-form.html',
})
export class ServicioForm implements OnInit {
  readonly id = input<string>();
  private readonly api = inject(ServicioService);
  private readonly router = inject(Router);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly noDisponible = signal(false);
  readonly error = signal('');
  readonly erroresServidor = signal<Record<string, string>>({});
  readonly form = inject(NonNullableFormBuilder).group({
    codigo: ['', [Validators.required, Validators.pattern(/^SRV-[0-9]{3}$/)]],
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    precio: [
      null as number | null,
      [
        Validators.required,
        Validators.min(0.01),
        Validators.max(99999999.99),
        Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/),
      ],
    ],
    duracionMin: [
      null as number | null,
      [
        Validators.required,
        Validators.min(15),
        Validators.max(480),
        Validators.pattern(/^[0-9]+$/),
      ],
    ],
  });
  ngOnInit(): void {
    if (this.id()) {
      this.cargando.set(true);
      this.api
        .obtener(Number(this.id()))
        .pipe(finalize(() => this.cargando.set(false)))
        .subscribe({
          next: (r) =>
            this.form.setValue({
              codigo: r.codigo,
              nombre: r.nombre,
              precio: r.precio,
              duracionMin: r.duracionMin,
            }),
          error: (e) => {
            this.error.set(mensajeError(e));
            this.noDisponible.set(true);
          },
        });
    }
    this.form.valueChanges.subscribe(() => this.erroresServidor.set({}));
  }
  guardar(): void {
    if (this.guardando() || this.cargando() || this.noDisponible()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const r = this.form.getRawValue();
    const dto: ServicioRequest = {
      codigo: r.codigo,
      nombre: r.nombre,
      precio: r.precio!,
      duracionMin: r.duracionMin!,
    };
    this.error.set('');
    this.erroresServidor.set({});
    this.guardando.set(true);
    const request = this.id() ? this.api.actualizar(Number(this.id()), dto) : this.api.crear(dto);
    request.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: () => void this.router.navigate(['/servicios']),
      error: (e) => {
        this.error.set(mensajeError(e));
        this.erroresServidor.set(camposError(e));
      },
    });
  }
}
