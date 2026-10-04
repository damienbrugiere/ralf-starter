import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  template: `
    <header class="app-header">
      <span class="app-title">JDR Platform</span>
    </header>
    <main class="app-main"><router-outlet /></main>
  `,
  styleUrl: './app.scss',
})
export class App {}
