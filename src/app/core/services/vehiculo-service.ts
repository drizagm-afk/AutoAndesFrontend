import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Vehiculo, VehiculoRequest } from '../models/resources';
@Service()
export class VehiculoService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl + '/vehiculos';
  listar() {
    return this.http.get<Vehiculo[]>(this.url);
  }
  obtener(id: number) {
    return this.http.get<Vehiculo>(this.url + '/' + id);
  }
  crear(r: VehiculoRequest) {
    return this.http.post<Vehiculo>(this.url, r);
  }
  actualizar(id: number, r: VehiculoRequest) {
    return this.http.put<Vehiculo>(this.url + '/' + id, r);
  }
  eliminar(id: number) {
    return this.http.delete<void>(this.url + '/' + id);
  }
  listarPorCliente(clienteId: number | null) {
    return this.http.get<Vehiculo[]>(this.url, { params: clienteId === null ? {} : { clienteId } });
  }
}
