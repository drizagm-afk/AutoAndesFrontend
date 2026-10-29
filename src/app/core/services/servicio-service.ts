import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Servicio, ServicioRequest } from '../models/resources';
@Service()
export class ServicioService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl + '/servicios';
  listar() {
    return this.http.get<Servicio[]>(this.url);
  }
  obtener(id: number) {
    return this.http.get<Servicio>(this.url + '/' + id);
  }
  crear(r: ServicioRequest) {
    return this.http.post<Servicio>(this.url, r);
  }
  actualizar(id: number, r: ServicioRequest) {
    return this.http.put<Servicio>(this.url + '/' + id, r);
  }
  eliminar(id: number) {
    return this.http.delete<void>(this.url + '/' + id);
  }
  cambiarEstado(id: number, activo: boolean) {
    return this.http.patch<Servicio>(this.url + '/' + id + '/estado', { activo });
  }
}
