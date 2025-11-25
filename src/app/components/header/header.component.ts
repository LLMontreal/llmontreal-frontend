import { Component, OnInit, computed, Signal, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ThemeService } from '../../services/theme.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DocumentService } from '../../services/document.service';
import { LogService } from '@services/logs.service';




@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule], 
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  isMenuOpen = false;
  private router = inject(Router); 

  private themeService = inject(ThemeService);
  private documentService = inject(DocumentService);
  private logService = inject(LogService);

  isDark: Signal<boolean> = computed(() => this.themeService.theme() === 'dark');


  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.isMenuOpen = false;
      });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
  
  toggleTheme() {
    this.themeService.toggleTheme();
  }

  downloadApiLogs() {
    this.logService.getApiLogs();
  }
}