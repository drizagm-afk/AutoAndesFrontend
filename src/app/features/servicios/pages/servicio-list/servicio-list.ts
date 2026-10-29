import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { finalize, Observable } from 'rxjs';
import { ServicioService } from '../../../../core/services/servicio-service';
import { Servicio } from '../../../../core/models/resources';
import { mensajeError } from '../../../../core/utils/http-error';
import { SiPermiso } from '../../../../shared/directives/si-permiso';

@Component({
  selector: 'app-servicio-list',
  imports: [RouterLink, SiPermiso, DecimalPipe],
  templateUrl: './servicio-list.html',
})
export class ServicioList implements OnInit {
  private readonly api = inject(ServicioService);
  readonly items = signal<Servicio[]>([]);
  readonly filtro = signal('');
  readonly cargando = signal(false);
  readonly procesando = signal(false);
  readonly error = signal('');
  readonly aviso = signal('');
  readonly filtradas = computed(() => {
    const q = this.filtro().toLowerCase();
    return this.items().filter((s) => (s.codigo + ' ' + s.nombre).toLowerCase().includes(q));
  });
  ngOnInit(): void {
    this.cargar();
  }
  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.api
      .listar()
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({ next: (r) => this.items.set(r), error: (e) => this.error.set(mensajeError(e)) });
  }
  eliminar(s: Servicio): void {
    if (!confirm('¿Eliminar ' + s.nombre + '?')) return;
    this.operar(this.api.eliminar(s.id));
  }
  cambiarEstado(s: Servicio): void {
    if (!confirm((s.activo ? '¿Dar de baja' : '¿Reactivar') + ' el servicio ' + s.nombre + '?'))
      return;
    this.operar(this.api.cambiarEstado(s.id, !s.activo));
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
