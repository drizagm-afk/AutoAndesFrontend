import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Orden, OrdenRequest, FiltroOrden } from '../models/orden.model';
export function parametros(filtro: FiltroOrden): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(filtro))
    if (value?.trim()) params = params.set(key, value.trim());
  return params;
}
@Service()
export class OrdenService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl + '/ordenes';
  registrar(r: OrdenRequest) {
    return this.http.post<Orden>(this.url, r);
  }
  listar(filtro: FiltroOrden = {}) {
    return this.http.get<Orden[]>(this.url, { params: parametros(filtro) });
  }
  obtener(id: number) {
    return this.http.get<Orden>(this.url + '/' + id);
  }
  anular(id: number, motivo: string) {
    return this.http.patch<Orden>(this.url + '/' + id + '/anular', { motivo });
  }
}
