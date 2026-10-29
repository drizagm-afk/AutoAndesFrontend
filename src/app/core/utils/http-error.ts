import { HttpErrorResponse } from '@angular/common/http';
export function mensajeError(error: HttpErrorResponse): string {
  if (error.status === 0) return 'No se pudo conectar con el servidor. Intente nuevamente.';
  return typeof error.error?.mensaje === 'string'
    ? error.error.mensaje
    : 'No se pudo completar la operación.';
}
export function camposError(error: HttpErrorResponse): Record<string, string> {
  return error.error?.campos ?? {};
}
