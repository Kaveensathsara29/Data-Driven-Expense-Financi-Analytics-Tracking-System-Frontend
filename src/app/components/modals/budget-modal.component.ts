import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../state/store.service';
import { CategorySelectComponent } from '../category-select/category-select.component';

@Component({
  selector: 'app-budget-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, CategorySelectComponent],
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <div class="modal-box animate-fade-in" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="header-info">
            <h2 class="modal-title">Set Monthly Budget</h2>
            <p class="modal-sub">Define a monthly spending ceiling and automated limit alerts</p>
          </div>
          <button class="btn-close" (click)="close.emit()">&times;</button>
        </div>

        <form (ngSubmit)="submit()" class="modal-body">
          <app-category-select [(value)]="category" categoryType="EXPENSE"></app-category-select>

          <div class="form-group">
            <label>Monthly Spending Limit ($) *</label>
            <input
              type="number"
              min="1"
              step="10"
              name="monthlyLimit"
              [(ngModel)]="monthlyLimit"
              placeholder="e.g. 500"
              required
              class="form-control"
            />
            <span class="helper-text">You will receive alert indicators at 75% and 100% threshold.</span>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-cancel" (click)="close.emit()">Cancel</button>
            <button type="submit" class="btn-submit" [disabled]="!category || !monthlyLimit || monthlyLimit <= 0">
              Save Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }

    .modal-box {
      width: 100%;
      max-width: 460px;
      background: #FFFFFF;
      border-radius: var(--radius-xl);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      border: 1px solid var(--border-subtle);
      overflow: hidden;
    }

    .modal-header {
      padding: 24px 28px;
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }

    .modal-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .modal-sub {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .btn-close {
      font-size: 1.5rem;
      line-height: 1;
      color: var(--text-muted);
      padding: 4px;
      &:hover { color: var(--text-primary); }
    }

    .modal-body {
      padding: 24px 28px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;

      label {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text-secondary);
      }
    }

    .helper-text {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .form-control {
      padding: 10px 14px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
      font-size: 0.875rem;
      color: var(--text-primary);
      background: #FFFFFF;
      transition: all 0.2s ease;

      &:focus {
        border-color: var(--primary-600);
        box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.15);
      }
    }

    .modal-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 8px;
      padding-top: 16px;
      border-top: 1px solid var(--border-subtle);
    }

    .btn-cancel {
      padding: 10px 18px;
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--text-secondary);
      border: 1px solid var(--border-subtle);

      &:hover {
        background: var(--bg-subtle);
        color: var(--text-primary);
      }
    }

    .btn-submit {
      padding: 10px 22px;
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 0.875rem;
      color: #FFFFFF;
      background: var(--primary-600);
      box-shadow: var(--shadow-red);

      &:hover:not(:disabled) {
        background: var(--primary-700);
        transform: translateY(-1px);
      }
    }
  `],
})
export class BudgetModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  private store = inject(StoreService);

  category = '';
  monthlyLimit: number | null = null;
  ngOnInit() {
    this.store.loadBudgets();
  }

  submit() {
    if (!this.category || !this.monthlyLimit || this.monthlyLimit <= 0) return;

    this.store.setBudget(this.category, Number(this.monthlyLimit)).subscribe((ok) => {
      if (ok) this.close.emit();
    });
  }
}
