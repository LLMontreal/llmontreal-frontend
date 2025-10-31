import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { DocumentService } from '../../services/document.service';

type Status =
  | 'IDLE'
  | 'READY'
  | 'UPLOADING'
  | 'SUCCESS'
  | 'ERROR'
  | 'CANCELLED';

@Component({
  selector: 'app-upload-document',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload-document.component.html',
  styleUrls: ['./upload-document.component.scss'],
})
export class UploadDocumentComponent {
  selectedFile?: File;
  progress = 0;
  status: Status = 'IDLE';
  statusMessage = 'Nenhum arquivo selecionado.';
  uploadSub?: Subscription;

  isDragging = false;

  private allowed = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
    'text/plain',
  ];
  private maxSizeBytes = 25 * 1024 * 1024; // 25MB

  constructor(private documentService: DocumentService) {}

  @HostListener('window:dragover', ['$event'])
  onWindowDragOver(evt: DragEvent) {
    evt.preventDefault();
  }

  @HostListener('window:drop', ['$event'])
  onWindowDrop(evt: DragEvent) {
    evt.preventDefault();
  }

  onDragOver(evt: DragEvent) {
    evt.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(evt: DragEvent) {
    evt.preventDefault();
    this.isDragging = false;
  }

  onFileDrop(evt: DragEvent) {
    evt.preventDefault();
    this.isDragging = false;
    if (evt.dataTransfer?.files?.length) {
      this.handleSelectedFile(evt.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleSelectedFile(input.files[0]);
      input.value = '';
    }
  }

  private handleSelectedFile(file: File) {
    if (!this.allowed.includes(file.type)) {
      this.setError(
        `Tipo de arquivo inválido. (Permitidos: PDF, DOCX, PNG, JPG, TXT)`
      );
      return;
    }
    if (file.size > this.maxSizeBytes) {
      this.setError(`O arquivo ultrapassa o limite de 25MB.`);
      return;
    }
    this.selectedFile = file;
    this.status = 'READY';
    this.statusMessage = 'Arquivo pronto para envio.';
    this.progress = 0;
    this.uploadFile();
  }
  uploadFile() {
    if (!this.selectedFile) return;

    this.status = 'UPLOADING';
    this.statusMessage = 'Enviando arquivo...';
    this.progress = 0;

    this.uploadSub = this.documentService
      .uploadDocument(this.selectedFile)
      .subscribe({
        next: (event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress) {
            const total = event.total ?? this.selectedFile!.size;
            this.progress = Math.round((event.loaded / total) * 100);
          } else if (event.type === HttpEventType.Response) {
            this.status = 'SUCCESS';
            this.statusMessage = 'Upload concluído com sucesso!';
            this.progress = 100;
            this.selectedFile = undefined;
            console.log('Resposta do backend:', event.body);
          }
        },
        error: (err) => {
          console.error(err);
          this.setError('Ocorreu um erro ao enviar o arquivo.');
        },
      });
  }

  cancelUpload() {
    this.uploadSub?.unsubscribe();
    this.uploadSub = undefined;
    this.setCancelled('Upload cancelado.');
  }

  private setError(msg: string) {
    this.status = 'ERROR';
    this.statusMessage = msg;
    this.progress = 0;
    this.selectedFile = undefined;
  }

  private setCancelled(msg: string) {
    this.status = 'CANCELLED';
    this.statusMessage = msg;
    this.progress = 0;
    this.selectedFile = undefined;
  }
}
