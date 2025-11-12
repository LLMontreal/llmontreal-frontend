import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'fileType',
  standalone: true,
})
export class FileTypePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return 'Desconhecido';

    const v = value.toLowerCase().trim();

    switch (v) {
      case 'application/pdf':
        return 'PDF';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'DOCX';
      case 'image/jpeg':
        return 'JPEG';
      case 'image/png':
        return 'PNG';
      case 'application/zip':
        return 'ZIP';
      case 'text/plain':
        return 'Texto';
      default:
        return 'Desconhecido';
    }
  }
}