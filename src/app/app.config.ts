import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: MatPaginatorIntl,
      useFactory: () => {
        const paginator = new MatPaginatorIntl();
        paginator.itemsPerPageLabel = 'Itens por página';
        return paginator;
      }
    }
  ]
};
