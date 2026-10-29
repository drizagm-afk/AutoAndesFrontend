import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
@Component({
  selector: 'app-field-error',
  template: ` @if (server()) {
      <small class="error" role="alert">{{ server() }}</small>
    } @else if (control().touched && control().invalid) {
      <small class="error">{{ mensaje() }}</small>
    }`,
})
export class FieldError {
  readonly control = input.required<AbstractControl>();
  readonly server = input<string>();
  readonly mensaje = input.required<string>();
}
