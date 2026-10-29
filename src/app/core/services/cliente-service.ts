import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Cliente } from '../models/resources';
@Service()
export class ClienteService {
  private readonly http = inject(HttpClient);
  listar() {
    return this.http.get<Cliente[]>(environment.apiUrl + '/clientes');
  }
}
