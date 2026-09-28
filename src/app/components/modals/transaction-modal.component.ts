import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../state/store.service';
import { Transaction } from '../../core/models/types';
import { CategorySelectComponent } from '../category-select/category-select.component';

@Component({
  selector: 'app-transaction-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, CategorySelectComponent],
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <div class="modal-box animate-fade-in" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="header-info">
            <h2 class="modal-title">{{ isEdit ? 'Edit Transaction' : 'New Transaction' }}</h2>
            <p class="modal-sub">Record your revenue or expenditure with full categorization</p>
          </div>
          <button class="btn-close" (click)="close.emit()">&times;</button>
        </div>

        <form (ngSubmit)="submit()" class="modal-body">
          <!-- Type Toggle -->
          <div class="type-toggle">
            <button
              type="button"
              class="toggle-btn expense"
              [class.active]="formData.type === 'EXPENSE'"
              (click)="setTransactionType('EXPENSE')"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <polyline points="19 12 12 19 5 12"/>
              </svg>
              <span>Expense</span>
            </button>
            <button
              type="button"
              class="toggle-btn income"
              [class.active]="formData.type === 'INCOME'"
              (click)="setTransactionType('INCOME')"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="19" x2="12" y2="5"/>
                <polyline points="5 12 12 5 19 12"/>
              </svg>
              <span>Income</span>
            </button>
          </div>

          <!-- Title -->
          <div class="form-group">
            <label>Transaction Title *</label>
            <input
              type="text"
              name="title"
              [(ngModel)]="formData.title"
              placeholder="e.g. Whole Foods Market, Stripe Payout, AWS..."
              required
              class="form-control"
            />
          </div>

          <!-- Amount & Date -->
          <div class="form-row">
            <div class="form-group flex-1">
              <label>Amount ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="amount"
                [(ngModel)]="formData.amount"
                placeholder="0.00"
                required
                class="form-control"
              />
            </div>

            <div class="form-group flex-1">
              <label>Date *</label>
              <input
                type="date"
                name="date"
                [(ngModel)]="formData.date"
                required
                class="form-control"
              />
            </div>
          </div>

          <!-- Category & Payment Method -->
          <div class="form-row">
            <div class="form-group flex-1">
              <app-category-select [(value)]="formData.category" [categoryType]="formData.type"></app-category-select>
            </div>

            <div class="form-group flex-1">
              <label>Payment Method</label>
              <select name="paymentMethod" [(ngModel)]="formData.paymentMethod" class="form-control">
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Apple Pay">Apple Pay</option>
                <option value="Cash">Cash</option>
                <option value="Wire Transfer">Wire Transfer</option>
              </select>
            </div>
          </div>

          <!-- Tags -->
          <div class="form-group">
            <label>Tags (comma separated)</label>
            <input
              type="text"
              name="tags"
              [(ngModel)]="tagsString"
              placeholder="e.g. groceries, organic, weekly"
              class="form-control"
            />
          </div>

          <!-- Notes -->
          <div class="form-group">
            <label>Notes / Receipt memo</label>
            <textarea
              name="notes"
              [(ngModel)]="formData.notes"
              rows="2"
              placeholder="Add optional notes, invoice numbers, or descriptions..."
              class="form-control"
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="modal-footer">
            <button type="button" class="btn-cancel" (click)="close.emit()">
              Cancel
            </button>
            <button type="submit" class="btn-submit" [disabled]="!isValid()">
              {{ isEdit ? 'Update Transaction' : 'Save Transaction' }}
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
      max-width: 520px;
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
      gap: 16px;
    }

    .type-toggle {
      display: flex;
      padding: 4px;
      background: var(--bg-subtle);
      border-radius: var(--radius-md);
      gap: 4px;
    }

    .toggle-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px;
      border-radius: var(--radius-sm);
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--text-secondary);

      &.expense.active {
        background: var(--primary-600);
        color: #FFFFFF;
        box-shadow: 0 2px 8px rgba(225, 29, 72, 0.3);
      }

      &.income.active {
        background: #10B981;
        color: #FFFFFF;
        box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
      }
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

    .form-row {
      display: flex;
      gap: 16px;
    }

    .flex-1 { flex: 1; }

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
export class TransactionModalComponent implements OnInit {
  @Input() editTransaction: Transaction | null = null;
  @Output() close = new EventEmitter<void>();

  private store = inject(StoreService);

  isEdit = false;
  tagsString = '';

  formData = {
    title: '',
    amount: null as number | null,
    type: 'EXPENSE' as 'EXPENSE' | 'INCOME',
    category: '',
    date: new Date().toISOString().substring(0, 10),
    paymentMethod: 'Credit Card',
    notes: '',
  };

  ngOnInit(): void {
    if (this.editTransaction) {
      this.isEdit = true;
      this.formData = {
        title: this.editTransaction.title,
        amount: this.editTransaction.amount,
        type: this.editTransaction.type,
        category: this.editTransaction.category,
        date: new Date(this.editTransaction.date).toISOString().substring(0, 10),
        paymentMethod: this.editTransaction.paymentMethod,
        notes: this.editTransaction.notes || '',
      };
      this.tagsString = (this.editTransaction.tags || []).join(', ');
    }
  }

  setTransactionType(type: 'EXPENSE' | 'INCOME'): void {
    this.formData.type = type;
    this.formData.category = '';
  }

  isValid(): boolean {
    return (
      this.formData.title.trim().length > 0 &&
      this.formData.amount !== null &&
      this.formData.amount > 0 &&
      this.formData.category.length > 0
    );
  }

  submit() {
    if (!this.isValid()) return;

    const tags = this.tagsString
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (this.isEdit && this.editTransaction) {
      this.store
        .updateTransaction({
          id: this.editTransaction.id,
          title: this.formData.title,
          amount: Number(this.formData.amount),
          type: this.formData.type,
          category: this.formData.category,
          date: new Date(this.formData.date).toISOString(),
          paymentMethod: this.formData.paymentMethod,
          notes: this.formData.notes,
          tags,
        })
        .subscribe((success) => {
          if (success) this.close.emit();
        });
    } else {
      this.store
        .createTransaction({
          title: this.formData.title,
          amount: Number(this.formData.amount),
          type: this.formData.type,
          category: this.formData.category,
          date: new Date(this.formData.date).toISOString(),
          paymentMethod: this.formData.paymentMethod,
          notes: this.formData.notes,
          tags,
        })
        .subscribe((success) => {
          if (success) this.close.emit();
        });
    }
  }
}
