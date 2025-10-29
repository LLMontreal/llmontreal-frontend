import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  showSearch = false;
  private sub?: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // initialize based on current url
    this.updateShowSearch(this.router.url);

    // update on navigation
    this.sub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.updateShowSearch(e.urlAfterRedirects));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private updateShowSearch(url: string): void {
    const path = (url || '').toLowerCase();
    this.showSearch = path === '/' || path.startsWith('/dashboard');
  }
}
