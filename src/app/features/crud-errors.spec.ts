import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ServicioForm } from './servicios/pages/servicio-form/servicio-form';
import { VehiculoForm } from './vehiculos/pages/vehiculo-form/vehiculo-form';
import { environment } from '../../environments/environment';

describe('CRUD error recovery', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('shows backend field validation below the control and allows retry', async () => {
    const f = TestBed.createComponent(ServicioForm);
    f.detectChanges();
    f.componentInstance.form.setValue({
      codigo: 'SRV-799',
      nombre: 'Servicio prueba',
      precio: 10,
      duracionMin: 30,
    });
    f.componentInstance.guardar();
    http
      .expectOne(environment.apiUrl + '/servicios')
      .flush(
        { mensaje: 'Datos inválidos', campos: { codigo: 'Código rechazado por el servidor' } },
        { status: 400, statusText: 'Bad Request' },
      );
    f.detectChanges();
    expect(f.nativeElement.querySelector('app-field-error').textContent).toContain(
      'Código rechazado por el servidor',
    );
    expect(f.componentInstance.guardando()).toBe(false);
    expect(f.componentInstance.form.controls.nombre.value).toBe('Servicio prueba');
    f.componentInstance.form.controls.codigo.setValue('SRV-798');
    f.detectChanges();
    expect(f.nativeElement.textContent).not.toContain('Código rechazado por el servidor');
  });

  it('blocks submission after a missing edit target while keeping Cancel available', () => {
    const f = TestBed.createComponent(ServicioForm);
    f.componentRef.setInput('id', '999999');
    f.detectChanges();
    http
      .expectOne(environment.apiUrl + '/servicios/999999')
      .flush({ mensaje: 'Servicio no encontrado' }, { status: 404, statusText: 'Not Found' });
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Servicio no encontrado');
    expect(f.nativeElement.querySelector('fieldset').disabled).toBe(true);
    expect(f.nativeElement.querySelector('a').textContent).toContain('Cancelar');
    f.componentInstance.guardar();
    http.expectNone(environment.apiUrl + '/servicios');
  });

  it('loads customer names and preserves vehicle values on a duplicate-plate conflict', () => {
    const f = TestBed.createComponent(VehiculoForm);
    f.detectChanges();
    http
      .expectOne(environment.apiUrl + '/clientes')
      .flush([{ id: 42, documento: '12345678', nombres: 'Cliente de prueba', telefono: null }]);
    f.detectChanges();
    expect(f.nativeElement.querySelector('select').textContent).toContain('Cliente de prueba');
    f.componentInstance.form.setValue({
      placa: 'TST-799',
      marca: 'Toyota',
      modelo: 'Yaris',
      anio: 2024,
      clienteId: 42,
    });
    f.componentInstance.guardar();
    const request = http.expectOne(environment.apiUrl + '/vehiculos');
    expect(request.request.body.clienteId).toBe(42);
    request.flush(
      { mensaje: 'La placa ya está registrada' },
      { status: 409, statusText: 'Conflict' },
    );
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('La placa ya está registrada');
    expect(f.componentInstance.form.controls.placa.value).toBe('TST-799');
    expect(f.componentInstance.guardando()).toBe(false);
    expect(f.nativeElement.querySelector('button[type=submit]').disabled).toBe(false);
  });
});
