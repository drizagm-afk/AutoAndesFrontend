import { AbstractControl, ValidationErrors } from '@angular/forms';
export function serviciosUnicos(control: AbstractControl): ValidationErrors | null {
  const ids = (control.value as { servicioId: number | null }[])
    .map((d) => d.servicioId)
    .filter((id) => id !== null);
  return new Set(ids).size === ids.length ? null : { servicioRepetido: true };
}
export function rangoFechas(control: AbstractControl): ValidationErrors | null {
  const { desde, hasta } = control.value as { desde: string; hasta: string };
  return desde && hasta && desde > hasta ? { rangoFechas: true } : null;
}
