import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-log-download',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './log-download.html',
  styleUrl: './log-download.scss',
})
export class LogDownload {

  downloadLogs(): void {
    const apiUrl = `${environment.apiUrl}/logs/download`;
    window.open(apiUrl, '_blank');
  }
}
