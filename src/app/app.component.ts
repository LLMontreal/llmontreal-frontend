import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map, startWith } from 'rxjs/operators';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private router = inject(Router);
  showHeaderFooter$ = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map(() => {
      const currentRoute = this.router.url;
      return !currentRoute.includes('/login') && !currentRoute.includes('/register');
    }),
    startWith(!this.router.url.includes('/login') && !this.router.url.includes('/register'))
  );
}
