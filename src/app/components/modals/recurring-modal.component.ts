import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../state/store.service';
import { CategorySelectComponent } from '../category-select/category-select.component';

@Component({
  selector: 'app-recurring-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, CategorySelectComponent],
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <div class="modal-box animate-fade-in" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="header-info">
            <h2 class="modal-title">New Subscription / Bill</h2>
            <p class="modal-sub">Add automated recurring commitments to project upcoming costs</p>
          </div>
          <button class="btn-close" (click)="close.emit()">&times;</button>
        </div>

        <form (ngSubmit)="submit()" class="modal-body">
          <div class="form-group">
            <label>Service / Subscription Name *</label>
            <input
              type="text"
              name="title"
              [(ngModel)]="formData.title"
              placeholder="e.g. Netflix, AWS, Gym, Spotify..."
              required
              class="form-control"
            />
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label>Amount ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="amount"
                [(ngModel)]="formData.amount"
                placeholder="19.99"
                required
                class="form-control"
              />
            </div>

            <div class="form-group flex-1">
              <label>Billing Cycle *</label>
              <select name="frequency" [(ngModel)]="formData.frequency" class="form-control">
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
                <option value="WEEKLY">Weekly</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <app-category-select [(value)]="formData.category" categoryType="EXPENSE"></app-category-select>
            </div>

            <div class="form-group flex-1">
              <label>Next Due Date *</label>
              <input
                type="date"
                name="nextDueDate"
                [(ngModel)]="formData.nextDueDate"
                required
                class="form-control"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Payment Method</label>
            <select name="paymentMethod" [(ngModel)]="formData.paymentMethod" class="form-control">
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Direct Debit">Direct Debit</option>
              <option value="Apple Pay">Apple Pay</option>
            </select>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-cancel" (click)="close.emit()">Cancel</button>
            <button type="submit" class="btn-submit" [disabled]="!isValid()">
              Create Subscription
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
      max-width: 500px;
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
export class RecurringModalComponent {
  @Output() close = new EventEmitter<void>();

  private store = inject(StoreService);

  formData = {
    title: '',
    amount: null as number | null,
    category: '',
    frequency: 'MONTHLY',
    nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
    paymentMethod: 'Credit Card',
  };

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

    this.store
      .createRecurring({
        title: this.formData.title,
        amount: Number(this.formData.amount),
        type: 'EXPENSE',
        category: this.formData.category,
        frequency: this.formData.frequency,
        nextDueDate: new Date(this.formData.nextDueDate).toISOString(),
        paymentMethod: this.formData.paymentMethod,
      })
      .subscribe((ok) => {
        if (ok) this.close.emit();
      });
  }
}
