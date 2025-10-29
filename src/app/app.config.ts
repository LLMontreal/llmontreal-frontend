import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // Mantém o coalescimento de eventos (melhor desempenho)
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Registra as rotas
    provideRouter(routes),

    // Substitui o HttpClientModule (evita o warning "deprecated")
    provideHttpClient(withFetch())
  ]
};
