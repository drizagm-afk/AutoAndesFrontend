export interface Cliente {
  id: number;
  documento: string;
  nombres: string;
  telefono: string | null;
}
export interface ServicioRequest {
  codigo: string;
  nombre: string;
  precio: number;
  duracionMin: number;
}
export interface Servicio extends ServicioRequest {
  id: number;
  activo: boolean;
}
export interface VehiculoRequest {
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  clienteId: number;
}
export interface Vehiculo extends VehiculoRequest {
  id: number;
  clienteNombre: string;
}
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  mensaje: string;
  ruta: string;
  campos?: Record<string, string>;
}
