import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private term$ = new BehaviorSubject<string>('');

  setTerm(term: string) {
    this.term$.next(term ?? '');
  }

  getTerm(): Observable<string> {
    return this.term$.asObservable();
  }
}
