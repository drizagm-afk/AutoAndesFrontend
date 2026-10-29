import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Header, Sidebar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  readonly colapsado = signal(false);
  alternarMenu(): void {
    this.colapsado.update((value) => !value);
  }
}
