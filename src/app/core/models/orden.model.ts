export type EstadoOrden = 'REGISTRADA' | 'ANULADA';
export interface DetalleRequest {
  servicioId: number;
  cantidad: number;
}
export interface OrdenRequest {
  vehiculoId: number;
  kilometraje: number;
  detalles: DetalleRequest[];
}
export interface DetalleOrden extends DetalleRequest {
  id: number;
  codigo: string;
  servicio: string;
  precioUnitario: number;
  subtotal: number;
}
export interface Orden {
  id: number;
  numero: string;
  fecha: string;
  vehiculoId: number;
  placa: string;
  clienteNombre: string;
  kilometraje: number;
  estado: EstadoOrden;
  total: number;
  usuarioRegistro: string;
  motivoAnulacion: string | null;
  detalles: DetalleOrden[];
}
export interface FiltroOrden {
  placa?: string;
  estado?: string;
  desde?: string;
  hasta?: string;
}
export interface IngresoPorServicio {
  codigo: string;
  servicio: string;
  cantidadTotal: number;
  importeTotal: number;
}
