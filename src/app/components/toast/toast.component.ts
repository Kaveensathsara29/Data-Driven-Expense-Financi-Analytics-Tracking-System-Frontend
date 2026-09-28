import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../state/store.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="store.toast$ | async as toast" class="toast-wrapper animate-fade-in" [ngClass]="toast.type">
      <div class="toast-content">
        <span class="toast-icon">
          <svg *ngIf="toast.type === 'success'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <svg *ngIf="toast.type === 'error'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <svg *ngIf="toast.type === 'info'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </span>
        <span class="toast-text">{{ toast.text }}</span>
      </div>
      <button class="toast-close" (click)="store.clearToast()">
        &times;
      </button>
    </div>
  `,
  styles: [`
    .toast-wrapper {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 20px;
      border-radius: var(--radius-md);
      background: #FFFFFF;
      box-shadow: 0 12px 32px rgba(15, 23, 42, 0.15);
      border: 1px solid var(--border-subtle);
      min-width: 320px;
      max-width: 480px;

      &.success {
        border-left: 4px solid var(--success);
        .toast-icon { color: var(--success); }
      }

      &.error {
        border-left: 4px solid var(--primary-600);
        .toast-icon { color: var(--primary-600); }
      }

      &.info {
        border-left: 4px solid var(--text-primary);
        .toast-icon { color: var(--text-primary); }
      }
    }

    .toast-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .toast-icon {
      display: flex;
      align-items: center;
    }

    .toast-text {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .toast-close {
      color: var(--text-muted);
      font-size: 1.25rem;
      line-height: 1;
      padding: 4px;

      &:hover {
        color: var(--text-primary);
      }
    }
  `],
})
export class ToastComponent {
  store = inject(StoreService);
}
