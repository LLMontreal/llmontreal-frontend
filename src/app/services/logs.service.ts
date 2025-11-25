import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogService {

  private apiUrl = `${environment.apiUrl}/logs/download`;

  constructor(private http: HttpClient) { }

  getApiLogs() {
    return this.http.get(`${this.apiUrl}`, {
        responseType: 'blob'
    })
    .subscribe((res: Blob) => {
    const url = window.URL.createObjectURL(res);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'api_logs.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    })
  }

 
}