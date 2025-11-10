import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileType',
  standalone: true
})
export class FileTypePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    const v = (value || '').toLowerCase();
    if (!v) return 'Desconhecido';

    if (v.includes('pdf')) return 'PDF';
    if (v.includes('word') || v.includes('msword') || v.includes('vnd.openxmlformats-officedocument.wordprocessingml.document')) return 'Word';
    if (v.includes('presentation') || v.includes('ppt') || v.includes('powerpoint') || v.includes('vnd.openxmlformats-officedocument.presentationml.presentation')) return 'PowerPoint';
    if (v.includes('excel') || v.includes('spreadsheet') || v.includes('sheet') || v.includes('vnd.ms-excel') || v.includes('vnd.openxmlformats-officedocument.spreadsheetml')) return 'Planilha';
    if (v.includes('plain') || v.includes('text')) return 'Texto';
    if (v.startsWith('image/')) return 'Imagem';
    if (v.includes('json')) return 'JSON';

    const parts = v.split('/');
    return parts[1] ? parts[1] : value as string;
  }
}
