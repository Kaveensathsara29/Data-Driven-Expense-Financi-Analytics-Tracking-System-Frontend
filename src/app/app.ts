import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ToastComponent } from './components/toast/toast.component';
import { StoreService } from './state/store.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, ToastComponent],
  template: `
    <div
      class="app-layout flex min-h-screen flex-col bg-slate-50"
      [ngClass]="{ 'lg:pl-[260px]': (store.isAuthenticated$ | async) }"
    >
      <app-sidebar *ngIf="store.isAuthenticated$ | async"></app-sidebar>
      <div class="min-w-0 flex-1">
        <router-outlet></router-outlet>
      </div>

      <footer class="w-full border-t border-slate-200 bg-white px-6 py-5 text-center shadow-[0_-1px_0_rgba(15,23,42,0.02)]">
        <p class="m-0 text-sm font-bold tracking-[0.02em] text-slate-900">© {{ currentYear }} MASTER EXPENSE. All Rights Reserved.</p>
        <p class="mt-1 text-sm font-semibold text-brand-600">Developed by KAVEEN SATHSARA</p>
      </footer>

      <app-toast></app-toast>
    </div>
  `,
  styles: [],
})
export class App {
  store = inject(StoreService);
  currentYear = new Date().getFullYear();
}
