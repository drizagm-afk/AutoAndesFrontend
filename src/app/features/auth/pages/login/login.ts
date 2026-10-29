import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth-service';
import { retornoSeguro } from '../../../../core/auth/api-url';
import { mensajeError } from '../../../../core/utils/http-error';
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly enviando = signal(false);
  readonly error = signal('');
  readonly verClave = signal(false);
  readonly expirada = this.route.snapshot.queryParamMap.has('expirada');
  readonly form = inject(NonNullableFormBuilder).group({
    username: ['', [Validators.required, Validators.maxLength(30)]],
    password: ['', [Validators.required, Validators.maxLength(72)]],
  });
  ingresar(): void {
    if (this.form.invalid || this.enviando()) {
      this.form.markAllAsTouched();
      return;
    }
    this.error.set('');
    this.enviando.set(true);
    const r = this.form.getRawValue();
    this.auth
      .login(r.username, r.password)
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () =>
          void this.router.navigateByUrl(
            retornoSeguro(this.route.snapshot.queryParamMap.get('returnUrl')),
          ),
        error: (e) => this.error.set(mensajeError(e)),
      });
  }
}
