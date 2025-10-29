import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-config',
  imports: [CommonModule],
  template: `
    <main class="p-6">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-2xl font-semibold mb-4">Configurações</h1>
        <p class="text-sm text-gray-600">Página de configurações (placeholder).</p>
      </div>
    </main>
  `
})
export class ConfigComponent {}
