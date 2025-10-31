import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../services/theme.service';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  private themeService = inject(ThemeService);
  isDark = false;

  constructor() {
    effect(() => {
      this.isDark = this.themeService.theme() === 'dark';
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
