import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { IngresoPorServicio } from '../models/orden.model';
import { parametros } from './orden-service';
@Service()
export class ReporteService {
  private readonly http = inject(HttpClient);
  ingresos(desde = '', hasta = '') {
    return this.http.get<IngresoPorServicio[]>(
      environment.apiUrl + '/reportes/ingresos-por-servicio',
      { params: parametros({ desde, hasta }) },
    );
  }
}
