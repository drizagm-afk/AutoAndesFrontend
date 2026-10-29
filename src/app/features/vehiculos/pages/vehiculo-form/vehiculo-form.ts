import { Component, inject, input, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { VehiculoService } from '../../../../core/services/vehiculo-service';
import { VehiculoRequest } from '../../../../core/models/resources';
import { mensajeError, camposError } from '../../../../core/utils/http-error';
import { FieldError } from '../../../../shared/components/field-error/field-error';
import { ClienteService } from '../../../../core/services/cliente-service';
import { Cliente } from '../../../../core/models/resources';
@Component({
  selector: 'app-vehiculo-form',
  imports: [ReactiveFormsModule, RouterLink, FieldError],
  templateUrl: './vehiculo-form.html',
})
export class VehiculoForm implements OnInit {
  readonly id = input<string>();
  private readonly api = inject(VehiculoService);
  private readonly router = inject(Router);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly noDisponible = signal(false);
  readonly error = signal('');
  readonly erroresServidor = signal<Record<string, string>>({});
  readonly clientes = signal<Cliente[]>([]);
  private readonly clientesApi = inject(ClienteService);
  readonly form = inject(NonNullableFormBuilder).group({
    placa: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}-[0-9]{3}$/)]],
    marca: ['', [Validators.required, Validators.maxLength(40)]],
    modelo: ['', [Validators.required, Validators.maxLength(40)]],
    anio: [
      null as number | null,
      [
        Validators.required,
        Validators.min(1990),
        Validators.max(2027),
        Validators.pattern(/^[0-9]+$/),
      ],
    ],
    clienteId: [null as number | null, [Validators.required, Validators.min(1)]],
  });
  ngOnInit(): void {
    this.clientesApi.listar().subscribe({
      next: (r) => this.clientes.set(r),
      error: (e) => {
        this.error.set(mensajeError(e));
        this.noDisponible.set(true);
      },
    });
    if (this.id()) {
      this.cargando.set(true);
      this.api
        .obtener(Number(this.id()))
        .pipe(finalize(() => this.cargando.set(false)))
        .subscribe({
          next: (r) =>
            this.form.setValue({
              placa: r.placa,
              marca: r.marca,
              modelo: r.modelo,
              anio: r.anio,
              clienteId: r.clienteId,
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
    const dto: VehiculoRequest = {
      placa: r.placa,
      marca: r.marca,
      modelo: r.modelo,
      anio: r.anio!,
      clienteId: r.clienteId!,
    };
    this.error.set('');
    this.erroresServidor.set({});
    this.guardando.set(true);
    const request = this.id() ? this.api.actualizar(Number(this.id()), dto) : this.api.crear(dto);
    request.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: () => void this.router.navigate(['/vehiculos']),
      error: (e) => {
        this.error.set(mensajeError(e));
        this.erroresServidor.set(camposError(e));
      },
    });
  }
}
