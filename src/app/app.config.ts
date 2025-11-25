import {
  ApplicationConfig,
  provideZoneChangeDetection,
  importProvidersFrom,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(MatSnackBarModule),
    {
      provide: MatPaginatorIntl,
      useFactory: () => {
        const paginator = new MatPaginatorIntl();
        paginator.itemsPerPageLabel = 'Itens por página';
        paginator.nextPageLabel = 'Próxima página';
        paginator.previousPageLabel = 'Página anterior';
        paginator.firstPageLabel = 'Primeira página';
        paginator.lastPageLabel = 'Última página';
        paginator.getRangeLabel = (page: number, pageSize: number, length: number) => {
          if (length === 0 || pageSize === 0) {
            return `0 de ${length}`;
          }
          const startIndex = page * pageSize;
          const endIndex = startIndex < length ?
            Math.min(startIndex + pageSize, length) :
            startIndex + pageSize;
          return `${startIndex + 1} - ${endIndex} de ${length}`;
        };
        return paginator;
      },
    },
  ],
};
