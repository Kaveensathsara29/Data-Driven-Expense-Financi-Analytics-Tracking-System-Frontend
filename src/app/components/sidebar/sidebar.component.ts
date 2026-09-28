import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StoreService } from '../../state/store.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="relative z-40 flex w-full flex-col border-b border-slate-200 bg-white lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-[260px] lg:border-b-0 lg:border-r">
      <div class="flex h-[72px] items-center gap-3 border-b border-slate-200 px-6">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-[0_4px_12px_rgba(225,29,72,0.3)]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div class="flex flex-col">
          <span class="text-[1.15rem] font-extrabold tracking-[-0.02em] text-slate-900">MASTER<span class="text-brand-600">EXPENSE</span></span>
          <span class="text-[0.65rem] font-bold tracking-[0.1em] text-slate-400">FINANCIAL APPICATION</span>
        </div>
      </div>

      <nav class="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-6">
        <a routerLink="/dashboard" routerLinkActive="bg-brand-600 text-white shadow-red" class="flex items-center gap-3.5 rounded-xl px-4 py-3 text-[0.925rem] font-medium text-slate-600 transition hover:bg-brand-50 hover:text-brand-700">
          <svg class="h-5 w-5 text-slate-400 transition group-hover:text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="7" height="9" x="3" y="3" rx="1"/>
            <rect width="7" height="5" x="14" y="3" rx="1"/>
            <rect width="7" height="9" x="14" y="12" rx="1"/>
            <rect width="7" height="5" x="3" y="16" rx="1"/>
          </svg>
          <span>Dashboard</span>
        </a>

        <a routerLink="/transactions" routerLinkActive="bg-brand-600 text-white shadow-red" class="flex items-center gap-3.5 rounded-xl px-4 py-3 text-[0.925rem] font-medium text-slate-600 transition hover:bg-brand-50 hover:text-brand-700">
          <svg class="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m16 3 4 4-4 4"/>
            <path d="M20 7H4"/>
            <path d="m8 21-4-4 4-4"/>
            <path d="M4 17h16"/>
          </svg>
          <span>Transactions</span>
        </a>

        <a routerLink="/budgets" routerLinkActive="bg-brand-600 text-white shadow-red" class="flex items-center gap-3.5 rounded-xl px-4 py-3 text-[0.925rem] font-medium text-slate-600 transition hover:bg-brand-50 hover:text-brand-700">
          <svg class="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="m4.93 4.93 4.24 4.24"/>
            <path d="m14.83 9.17 4.24-4.24"/>
            <path d="m14.83 14.83 4.24 4.24"/>
            <path d="m9.17 14.83-4.24 4.24"/>
            <circle cx="12" cy="12" r="4"/>
          </svg>
          <span>Budgets & Goals</span>
        </a>

        <a routerLink="/recurring" routerLinkActive="bg-brand-600 text-white shadow-red" class="flex items-center gap-3.5 rounded-xl px-4 py-3 text-[0.925rem] font-medium text-slate-600 transition hover:bg-brand-50 hover:text-brand-700">
          <svg class="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m17 2 4 4-4 4"/>
            <path d="M3 11v-1a4 4 0 0 1 4-4h14"/>
            <path d="m7 22-4-4 4-4"/>
            <path d="M21 13v1a4 4 0 0 1-4 4H3"/>
          </svg>
          <span>Subscriptions</span>
        </a>

        <a routerLink="/analytics" routerLinkActive="bg-brand-600 text-white shadow-red" class="flex items-center gap-3.5 rounded-xl px-4 py-3 text-[0.925rem] font-medium text-slate-600 transition hover:bg-brand-50 hover:text-brand-700">
          <svg class="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3v18h18"/>
            <path d="m19 9-5 5-4-4-3 3"/>
          </svg>
          <span>Analytics</span>
        </a>
      </nav>

      <div *ngIf="store.user$ | async as user" class="m-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">
          {{ user.name.charAt(0).toUpperCase() }}
        </div>
        <div class="min-w-0 flex-1">
          <span class="block truncate text-sm font-semibold text-slate-900">{{ user.name }}</span>
          <span class="block truncate text-[11px] text-slate-400">{{ user.email }}</span>
        </div>
        <button class="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-brand-600" (click)="store.logout()" title="Sign Out">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" x2="9" y1="12" y2="12"/>
          </svg>
        </button>
      </div>
    </aside>
  `,
  styles: [],
})
export class SidebarComponent {
  store = inject(StoreService);
}
