import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {
  provideRouter,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { AuthService } from './auth-service';
import { authInterceptor } from '../interceptors/auth-interceptor';
import { errorInterceptor } from '../interceptors/error-interceptor';
import { permisoGuard } from '../guards/permiso-guard';
import { authGuard, invitadoGuard } from '../guards/auth-guard';
import { environment } from '../../../environments/environment';
import { retornoSeguro } from './api-url';

describe('Frontend session and authorization', () => {
  let auth: AuthService, http: HttpTestingController, client: HttpClient, router: Router;
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    client = TestBed.inject(HttpClient);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    auth = TestBed.inject(AuthService);
  });
  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
    sessionStorage.clear();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });
  function login(seconds = 3600, permisos = ['ORDEN_LEER', 'ORDEN_REGISTRAR']) {
    const token =
      'header.' +
      btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + seconds })) +
      '.signature';
    auth.login('asesor', 'Auto2026*').subscribe();
    const r = http.expectOne(environment.apiUrl + '/auth/login');
    expect(r.request.headers.has('Authorization')).toBe(false);
    r.flush({
      token,
      tipo: 'Bearer',
      expiraEnSegundos: 3600,
      nombreCompleto: 'Asesor de prueba',
      roles: ['ASESOR'],
      permisos,
    });
    return token;
  }
  it('adds the token only to the API and reads a changed stored token', () => {
    const token = login();
    client.get(environment.apiUrl + '/ordenes').subscribe();
    const api = http.expectOne(environment.apiUrl + '/ordenes');
    expect(api.request.headers.get('Authorization')).toBe('Bearer ' + token);
    api.flush([]);
    client.get('https://example.invalid/datos').subscribe();
    const other = http.expectOne('https://example.invalid/datos');
    expect(other.request.headers.has('Authorization')).toBe(false);
    other.flush([]);
    const stored = JSON.parse(sessionStorage.getItem('autoandes.sesion')!);
    stored.token = 'altered';
    sessionStorage.setItem('autoandes.sesion', JSON.stringify(stored));
    expect(auth.token()).toBe('altered');
  });
  it('clears the session on API 401 and keeps returnUrl', () => {
    login();
    vi.spyOn(router, 'url', 'get').mockReturnValue('/ordenes?placa=AAA');
    client.get(environment.apiUrl + '/ordenes').subscribe({ error: () => {} });
    http
      .expectOne(environment.apiUrl + '/ordenes')
      .flush({ mensaje: 'Token inválido' }, { status: 401, statusText: 'Unauthorized' });
    expect(auth.sesion()).toBeNull();
    expect(sessionStorage.getItem('autoandes.sesion')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { expirada: '1', returnUrl: '/ordenes?placa=AAA' },
    });
  });
  it('preserves the session on 403 and on a failed login', () => {
    login();
    client
      .get(environment.apiUrl + '/reportes/ingresos-por-servicio')
      .subscribe({ error: () => {} });
    http
      .expectOne(environment.apiUrl + '/reportes/ingresos-por-servicio')
      .flush({ mensaje: 'Sin permiso' }, { status: 403, statusText: 'Forbidden' });
    expect(auth.sesion()).not.toBeNull();
    expect(router.navigate).not.toHaveBeenCalled();
    auth.login('asesor', 'incorrecta').subscribe({ error: () => {} });
    http
      .expectOne(environment.apiUrl + '/auth/login')
      .flush({ mensaje: 'Credenciales incorrectas' }, { status: 401, statusText: 'Unauthorized' });
    expect(auth.sesion()).not.toBeNull();
  });
  it('logs out automatically at JWT expiry even if the response says one hour', () => {
    vi.useFakeTimers();
    login(2);
    vi.advanceTimersByTime(3000);
    expect(auth.sesion()).toBeNull();
    expect(router.navigate).toHaveBeenCalled();
  });
  it('guards session, guest and permission routes independently of menu visibility', () => {
    const route = new ActivatedRouteSnapshot();
    route.data = { permiso: 'REPORTE_VER' };
    const state = { url: '/reportes' } as RouterStateSnapshot;
    const check = (fn: typeof authGuard) => TestBed.runInInjectionContext(() => fn(route, state));
    expect(router.serializeUrl(check(authGuard) as ReturnType<Router['createUrlTree']>)).toContain(
      '/login?returnUrl=',
    );
    login();
    expect(check(authGuard)).toBe(true);
    expect(router.serializeUrl(check(invitadoGuard) as ReturnType<Router['createUrlTree']>)).toBe(
      '/inicio',
    );
    expect(router.serializeUrl(check(permisoGuard) as ReturnType<Router['createUrlTree']>)).toBe(
      '/acceso-denegado',
    );
    route.data = { permiso: 'ORDEN_REGISTRAR' };
    expect(check(permisoGuard)).toBe(true);
    expect(auth.sesion()).not.toBeNull();
  });
  it('accepts only internal return URLs', () => {
    expect(retornoSeguro('//example.com')).toBe('/inicio');
    expect(retornoSeguro('https://example.com')).toBe('/inicio');
    expect(retornoSeguro('/login')).toBe('/inicio');
    expect(retornoSeguro('/ordenes?placa=AAA')).toBe('/ordenes?placa=AAA');
  });
});
