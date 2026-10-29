import { Service, computed, signal, inject, DestroyRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginResponse, Sesion, Permiso, UsuarioActual } from './auth.model';
const CLAVE = 'autoandes.sesion';

@Service()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly actual = signal<Sesion | null>(this.restaurar());
  private temporizador?: ReturnType<typeof setTimeout>;
  readonly sesion = this.actual.asReadonly();
  readonly autenticado = computed(() => this.actual() !== null);
  constructor() {
    if (this.actual()) this.programar(this.actual()!);
    inject(DestroyRef).onDestroy(() => clearTimeout(this.temporizador));
  }
  login(username: string, password: string) {
    return this.http
      .post<LoginResponse>(environment.apiUrl + '/auth/login', { username, password })
      .pipe(
        map((r) => ({
          ...r,
          expiraEn: Math.min(
            Date.now() + r.expiraEnSegundos * 1000,
            this.vencimientoToken(r.token),
          ),
        })),
        tap((s) => {
          sessionStorage.setItem(CLAVE, JSON.stringify(s));
          this.actual.set(s);
          this.programar(s);
        }),
      );
  }
  perfil() {
    return this.http.get<UsuarioActual>(environment.apiUrl + '/auth/me');
  }
  token(): string | null {
    const s = this.actual();
    if (!s || Date.now() >= s.expiraEn) return null;
    // Read the stored token too: a changed token must be checked by the API, not silently ignored.
    try {
      const stored = JSON.parse(sessionStorage.getItem(CLAVE) ?? 'null');
      return typeof stored?.token === 'string' ? stored.token : null;
    } catch {
      return null;
    }
  }
  tienePermiso(p: Permiso): boolean {
    return this.token() !== null && (this.actual()?.permisos.includes(p) ?? false);
  }
  salir(expirada = false, returnUrl?: string): void {
    clearTimeout(this.temporizador);
    sessionStorage.removeItem(CLAVE);
    this.actual.set(null);
    void this.router.navigate(['/login'], {
      queryParams: {
        ...(expirada ? { expirada: '1' } : {}),
        ...(returnUrl && !returnUrl.startsWith('/login') ? { returnUrl } : {}),
      },
    });
  }
  private programar(s: Sesion): void {
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(
      () => this.salir(true, this.router.url),
      Math.max(0, s.expiraEn - Date.now()),
    );
  }
  private vencimientoToken(token: string): number {
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return Number(payload.exp) * 1000;
    } catch {
      return 0;
    }
  }
  private restaurar(): Sesion | null {
    try {
      const s = JSON.parse(sessionStorage.getItem(CLAVE) ?? 'null') as Sesion | null;
      if (
        s &&
        typeof s.token === 'string' &&
        s.token.length > 0 &&
        typeof s.nombreCompleto === 'string' &&
        Number.isFinite(s.expiraEn) &&
        s.expiraEn > Date.now() &&
        this.vencimientoToken(s.token) > Date.now() &&
        Array.isArray(s.roles) &&
        s.roles.every((r) => typeof r === 'string') &&
        Array.isArray(s.permisos) &&
        s.permisos.every((p) => typeof p === 'string')
      )
        return s;
    } catch {
      /* Discard damaged local session data. */
    }
    sessionStorage.removeItem(CLAVE);
    return null;
  }
}
