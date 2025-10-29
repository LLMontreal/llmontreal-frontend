import { Injectable, signal } from '@angular/core';

type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private localStorageKey = 'app-theme';

  theme = signal<Theme>('light');

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme() {
    const storedTheme = localStorage.getItem(
      this.localStorageKey
    ) as Theme | null;

    const systemPrefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;

    const initialTheme = storedTheme
      ? storedTheme
      : systemPrefersDark
      ? 'dark'
      : 'light';

    this.setTheme(initialTheme);
  }

  setTheme(theme: Theme) {
    this.theme.set(theme);
    localStorage.setItem(this.localStorageKey, theme);

    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }

  toggleTheme() {
    this.setTheme(this.theme() === 'light' ? 'dark' : 'light');
  }
}
