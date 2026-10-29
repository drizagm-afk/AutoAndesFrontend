import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { forkJoin, finalize } from 'rxjs';
import { VehiculoService } from '../../../../core/services/vehiculo-service';
import { ServicioService } from '../../../../core/services/servicio-service';
import { OrdenService } from '../../../../core/services/orden-service';
import { Servicio, Vehiculo } from '../../../../core/models/resources';
import { Orden, OrdenRequest } from '../../../../core/models/orden.model';
import { mensajeError, camposError } from '../../../../core/utils/http-error';
import { FieldError } from '../../../../shared/components/field-error/field-error';
import { serviciosUnicos } from '../../validators';
@Component({
  selector: 'app-orden-form',
  imports: [ReactiveFormsModule, RouterLink, DecimalPipe, FieldError],
  templateUrl: './orden-form.html',
})
export class OrdenForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(OrdenService);
  private readonly vehiculosApi = inject(VehiculoService);
  private readonly serviciosApi = inject(ServicioService);
  readonly vehiculos = signal<Vehiculo[]>([]);
  readonly servicios = signal<Servicio[]>([]);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly noDisponible = signal(false);
  readonly error = signal('');
  readonly erroresServidor = signal<Record<string, string>>({});
  readonly registrada = signal<Orden | null>(null);
  readonly detalles = this.fb.array(
    [this.linea()],
    [Validators.required, Validators.maxLength(10), serviciosUnicos],
  );
  readonly form = this.fb.group({
    vehiculoId: [null as number | null, [Validators.required, Validators.min(1)]],
    kilometraje: [
      null as number | null,
      [
        Validators.required,
        Validators.min(0),
        Validators.max(9999999),
        Validators.pattern(/^[0-9]+$/),
      ],
    ],
    detalles: this.detalles,
  });
  readonly valores = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  readonly lineas = computed(() =>
    (this.valores().detalles ?? []).map((detalle) => {
      const precio =
        this.servicios().find((servicio) => servicio.id === detalle.servicioId)?.precio ?? 0;
      const cantidad = Number(detalle.cantidad) || 0;
      return { precio, subtotal: Math.round(precio * cantidad * 100) / 100 };
    }),
  );
  readonly total = computed(
    () => Math.round(this.lineas().reduce((suma, linea) => suma + linea.subtotal, 0) * 100) / 100,
  );
  ngOnInit(): void {
    this.cargar();
  }
  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.noDisponible.set(false);
    forkJoin({ vehiculos: this.vehiculosApi.listar(), servicios: this.serviciosApi.listar() })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (r) => {
          this.vehiculos.set(r.vehiculos);
          this.servicios.set(r.servicios.filter((s) => s.activo));
        },
        error: (e) => {
          this.error.set(mensajeError(e));
          this.noDisponible.set(true);
        },
      });
  }
  private linea() {
    return this.fb.group({
      servicioId: [null as number | null, [Validators.required, Validators.min(1)]],
      cantidad: [
        1,
        [Validators.required, Validators.min(1), Validators.max(5), Validators.pattern(/^[0-9]+$/)],
      ],
    });
  }
  agregar(): void {
    if (this.detalles.length < 10 && !this.guardando()) {
      this.detalles.push(this.linea());
      this.erroresServidor.set({});
    }
  }
  quitar(index: number): void {
    if (this.detalles.length > 1 && !this.guardando()) {
      this.detalles.removeAt(index);
      this.erroresServidor.set({});
    }
  }
  usado(id: number, index: number): boolean {
    return (this.valores().detalles ?? []).some(
      (detalle, i) => i !== index && detalle.servicioId === id,
    );
  }
  guardar(): void {
    if (this.guardando() || this.cargando() || this.noDisponible()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const r = this.form.getRawValue();
    const dto: OrdenRequest = {
      vehiculoId: r.vehiculoId!,
      kilometraje: r.kilometraje!,
      detalles: r.detalles.map((d) => ({ servicioId: d.servicioId!, cantidad: d.cantidad })),
    };
    this.error.set('');
    this.erroresServidor.set({});
    this.guardando.set(true);
    this.api
      .registrar(dto)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: (o) => this.registrada.set(o),
        error: (e) => {
          this.error.set(mensajeError(e));
          this.erroresServidor.set(camposError(e));
        },
      });
  }
  nueva(): void {
    this.registrada.set(null);
    this.form.reset();
    this.detalles.clear();
    this.detalles.push(this.linea());
    this.error.set('');
    this.erroresServidor.set({});
  }
}
