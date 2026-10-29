import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, it, expect } from 'vitest';
import { OrdenForm } from './pages/orden-form/orden-form';
import { environment } from '../../../environments/environment';

describe('Order form', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  function setup() {
    const fixture = TestBed.createComponent(OrdenForm);
    fixture.detectChanges();
    http
      .expectOne(environment.apiUrl + '/vehiculos')
      .flush([{ id: 10, placa: 'TST-100', clienteNombre: 'Cliente de prueba' }]);
    http.expectOne(environment.apiUrl + '/servicios').flush([
      { id: 1, codigo: 'SRV-001', nombre: 'Aceite', precio: 10.25, duracionMin: 30, activo: true },
      { id: 2, codigo: 'SRV-002', nombre: 'Frenos', precio: 20.1, duracionMin: 30, activo: true },
      { id: 3, codigo: 'SRV-003', nombre: 'Inactivo', precio: 99, duracionMin: 30, activo: false },
    ]);
    fixture.detectChanges();
    return fixture;
  }
  it('recalculates previews, rejects duplicate services, and submits only IDs and quantities', () => {
    const f = setup(),
      c = f.componentInstance;
    c.form.patchValue({ vehiculoId: 10, kilometraje: 45000 });
    c.detalles.at(0).setValue({ servicioId: 1, cantidad: 2 });
    c.agregar();
    c.detalles.at(1).setValue({ servicioId: 2, cantidad: 3 });
    f.detectChanges();
    expect(c.total()).toBe(80.8);
    expect(c.servicios().length).toBe(2);
    expect(c.usado(1, 1)).toBe(true);
    c.detalles.at(1).controls.servicioId.setValue(1);
    expect(c.detalles.hasError('servicioRepetido')).toBe(true);
    c.guardar();
    http.expectNone(environment.apiUrl + '/ordenes');
    c.detalles.at(1).controls.servicioId.setValue(2);
    c.guardar();
    const r = http.expectOne(environment.apiUrl + '/ordenes');
    expect(r.request.body).toEqual({
      vehiculoId: 10,
      kilometraje: 45000,
      detalles: [
        { servicioId: 1, cantidad: 2 },
        { servicioId: 2, cantidad: 3 },
      ],
    });
    r.flush({ id: 88, numero: 'OS-000088', total: 80.8, detalles: [] });
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('OS-000088');
  });
  it('preserves all lines and backend messages on 409, with retry enabled', () => {
    const f = setup(),
      c = f.componentInstance;
    c.form.patchValue({ vehiculoId: 10, kilometraje: 10 });
    c.detalles.at(0).setValue({ servicioId: 1, cantidad: 2 });
    c.agregar();
    c.detalles.at(1).setValue({ servicioId: 2, cantidad: 1 });
    const before = c.form.getRawValue();
    c.guardar();
    http
      .expectOne(environment.apiUrl + '/ordenes')
      .flush({ mensaje: 'Último kilometraje: 45000' }, { status: 409, statusText: 'Conflict' });
    f.detectChanges();
    expect(c.form.getRawValue()).toEqual(before);
    expect(c.guardando()).toBe(false);
    expect(f.nativeElement.textContent).toContain('Último kilometraje: 45000');
    c.form.controls.kilometraje.setValue(45000);
    c.guardar();
    http
      .expectOne(environment.apiUrl + '/ordenes')
      .flush({ id: 89, numero: 'OS-000089', total: 40.6, detalles: [] });
    expect(c.registrada()?.numero).toBe('OS-000089');
  });
  it('limits details to ten and displays indexed backend field errors', () => {
    const f = setup(),
      c = f.componentInstance;
    for (let i = 0; i < 12; i++) c.agregar();
    expect(c.detalles.length).toBe(10);
    while (c.detalles.length > 1) c.quitar(1);
    c.quitar(0);
    expect(c.detalles.length).toBe(1);
    c.form.patchValue({ vehiculoId: 10, kilometraje: 100 });
    c.detalles.at(0).setValue({ servicioId: 1, cantidad: 1 });
    c.guardar();
    http.expectOne(environment.apiUrl + '/ordenes').flush(
      {
        mensaje: 'Datos inválidos',
        campos: { 'detalles[0].cantidad': 'Cantidad rechazada por el servidor' },
      },
      { status: 400, statusText: 'Bad Request' },
    );
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Cantidad rechazada por el servidor');
    expect(c.detalles.length).toBe(1);
  });
});
