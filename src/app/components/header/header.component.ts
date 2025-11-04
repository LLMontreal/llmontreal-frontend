import { Component, OnDestroy, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subject, Subscription as RxSub } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { ThemeService } from '../../services/theme.service';
import { MatIconModule } from '@angular/material/icon'; 
import { MatButtonModule } from '@angular/material/button'; 
import { DocumentService } from '../../services/document.service';




@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule], 
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  showSearch = false;
  private sub?: RxSub;
  private searchSub?: RxSub;
  private search$ = new Subject<string>();
  isMenuOpen = false;
  private router = inject(Router); 

  private themeService = inject(ThemeService);
  private documentService = inject(DocumentService);
  isDark = false;
  constructor() {
    effect(() => {
      this.isDark = this.themeService.theme() === 'dark';
    });
  }


  ngOnInit(): void {
    this.updateShowSearch(this.router.url);

    this.sub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => {
        this.updateShowSearch(e.urlAfterRedirects);
        // close mobile menu on navigation
        this.isMenuOpen = false;
      });

    // debounced search stream: calls DocumentService.getDocuments with q
    this.searchSub = this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => this.documentService.getDocuments(0, 10, null, q).pipe(
        catchError(err => {
          console.error('Search error', err);
          return [] as any;
        })
      ))
    ).subscribe(page => {
      // for now we just log results; components can be updated to consume these results
      console.debug('Search results (header):', page);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.searchSub?.unsubscribe();
  }

  onSearch(value: string): void {
    // push to debounced subject; keep logic in header so it uses DocumentService
    this.search$.next((value || '').trim());
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  private updateShowSearch(url: string): void {
    const path = (url || '').toLowerCase();
    this.showSearch = path === '/' || path.startsWith('/dashboard');
  }

  
  toggleTheme() {
    this.themeService.toggleTheme();
  }
}