import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="sticky top-0 z-30 flex h-auto flex-col gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:h-[72px] lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <div class="flex flex-col">
        <h1 class="text-xl font-bold tracking-[-0.02em] text-slate-900">{{ title }}</h1>
        <p class="text-xs text-slate-400">{{ subtitle }}</p>
      </div>

      <div class="flex flex-col items-start gap-3 sm:flex-row sm:items-center lg:gap-4">
        <div class="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-[13px] font-semibold text-slate-600">
          <svg class="h-4 w-4 text-brand-600" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
            <line x1="16" x2="16" y1="2" y2="6"/>
            <line x1="8" x2="8" y1="2" y2="6"/>
            <line x1="3" x2="21" y1="10" y2="10"/>
          </svg>
          <span>{{ today | date:'EEEE, MMM d, y' }}</span>
        </div>

        <button *ngIf="canAddTransaction" class="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(225,29,72,0.35)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(225,29,72,0.45)] active:translate-y-0" (click)="openAddModal.emit()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>New Transaction</span>
        </button>
        <a *ngIf="!canAddTransaction" class="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(225,29,72,0.35)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(225,29,72,0.45)] active:translate-y-0" routerLink="/auth">
          Sign in to add
        </a>
      </div>
    </header>
  `,
  styles: [],
})
export class HeaderComponent {
  @Input() title = 'Financial Dashboard';
  @Input() subtitle = 'Track your net balance, expenses, and investment cash flows';
  @Input() canAddTransaction = true;
  @Output() openAddModal = new EventEmitter<void>();

  today = new Date();
}
