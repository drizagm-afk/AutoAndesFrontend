import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { finalize, Observable } from 'rxjs';
import { VehiculoService } from '../../../../core/services/vehiculo-service';
import { Vehiculo } from '../../../../core/models/resources';
import { mensajeError } from '../../../../core/utils/http-error';
import { SiPermiso } from '../../../../shared/directives/si-permiso';
import { ClienteService } from '../../../../core/services/cliente-service';
import { Cliente } from '../../../../core/models/resources';
@Component({
  selector: 'app-vehiculo-list',
  imports: [RouterLink, SiPermiso],
  templateUrl: './vehiculo-list.html',
})
export class VehiculoList implements OnInit {
  private readonly api = inject(VehiculoService);
  readonly items = signal<Vehiculo[]>([]);
  readonly filtro = signal('');
  readonly cargando = signal(false);
  readonly procesando = signal(false);
  readonly error = signal('');
  readonly aviso = signal('');
  readonly clientes = signal<Cliente[]>([]);
  readonly clienteId = signal<number | null>(null);
  private readonly clientesApi = inject(ClienteService);
  ngOnInit(): void {
    this.clientesApi.listar().subscribe({
      next: (r) => this.clientes.set(r),
      error: (e) => this.error.set(mensajeError(e)),
    });
    this.cargar();
  }
  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.api
      .listarPorCliente(this.clienteId())
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({ next: (r) => this.items.set(r), error: (e) => this.error.set(mensajeError(e)) });
  }
  eliminar(s: Vehiculo): void {
    if (!confirm('¿Eliminar ' + s.placa + '?')) return;
    this.operar(this.api.eliminar(s.id));
  }
  filtrarCliente(value: string): void {
    this.clienteId.set(value ? Number(value) : null);
    this.cargar();
  }
  private operar(request: Observable<unknown>): void {
    if (this.procesando()) return;
    this.procesando.set(true);
    this.error.set('');
    this.aviso.set('');
    request.pipe(finalize(() => this.procesando.set(false))).subscribe({
      next: () => {
        this.aviso.set('Operación completada.');
        this.cargar();
      },
      error: (e) => this.error.set(mensajeError(e)),
    });
  }
}
