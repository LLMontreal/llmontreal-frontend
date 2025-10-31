import { Component, OnDestroy, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ThemeService } from '../../services/theme.service';
import { MatIconModule } from '@angular/material/icon'; 
import { MatButtonModule } from '@angular/material/button'; 




@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule], 
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  showSearch = false;
  private sub?: Subscription;
  private router = inject(Router); 

  private themeService = inject(ThemeService);
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
      .subscribe(e => this.updateShowSearch(e.urlAfterRedirects));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

 onSearch(value: string): void {
    console.log('search:', value);
  }

  private updateShowSearch(url: string): void {
    const path = (url || '').toLowerCase();
    this.showSearch = path === '/' || path.startsWith('/dashboard');
  }

  
  toggleTheme() {
    this.themeService.toggleTheme();
  }
}