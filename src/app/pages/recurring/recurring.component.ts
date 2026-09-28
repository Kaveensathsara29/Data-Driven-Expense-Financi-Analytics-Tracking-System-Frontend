import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../state/store.service';
import { HeaderComponent } from '../../components/header/header.component';
import { RecurringModalComponent } from '../../components/modals/recurring-modal.component';
import { Recurring } from '../../core/models/types';

@Component({
  selector: 'app-recurring',
  standalone: true,
  imports: [CommonModule, HeaderComponent, RecurringModalComponent],
  template: `
    <div class="recurring-page">
      <app-header
        title="Subscriptions & Recurring Outlays"
        subtitle="Audit fixed obligations, recurring subscriptions, and projected cycle expenses"
        (openAddModal)="showModal = true"
      ></app-header>

      <main class="recurring-content">
        <!-- Monthly Summary Banner -->
        <div class="summary-cards" *ngIf="store.recurring$ | async as items">
          <div class="metric-card">
            <span class="m-title">Monthly Fixed Burn</span>
            <span class="m-val">\${{ getMonthlyTotal(items) | number:'1.2-2' }}</span>
            <span class="m-sub">Committed monthly recurring charges</span>
          </div>

          <div class="metric-card">
            <span class="m-title">Annual Run-Rate</span>
            <span class="m-val">\${{ (getMonthlyTotal(items) * 12) | number:'1.0-0' }}</span>
            <span class="m-sub">Projected 12-month commitment</span>
          </div>

          <div class="metric-card">
            <span class="m-title">Active Subscriptions</span>
            <span class="m-val">{{ getActiveCount(items) }} of {{ items.length }}</span>
            <span class="m-sub">Active automated billing services</span>
          </div>
        </div>

        <!-- Table -->
        <div class="ledger-card">
          <div class="table-container">
            <table class="recurring-table">
              <thead>
                <tr>
                  <th>Subscription Name</th>
                  <th>Category</th>
                  <th>Frequency</th>
                  <th>Next Due Date</th>
                  <th>Payment Method</th>
                  <th>Monthly Equivalent</th>
                  <th>Status</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="(store.recurring$ | async)?.length === 0">
                  <td colspan="8" class="empty-state">No recurring subscriptions registered yet.</td>
                </tr>

                <tr *ngFor="let item of (store.recurring$ | async)">
                  <td>
                    <span class="sub-title">{{ item.title }}</span>
                  </td>
                  <td>
                    <span class="cat-pill">{{ item.category }}</span>
                  </td>
                  <td>
                    <span class="freq-pill">{{ item.frequency }}</span>
                  </td>
                  <td>
                    <span class="date-val">{{ item.nextDueDate | date:'MMM d, y' }}</span>
                  </td>
                  <td>
                    <span class="method-val">{{ item.paymentMethod }}</span>
                  </td>
                  <td>
                    <span class="amount-val">\${{ item.amount | number:'1.2-2' }}</span>
                  </td>
                  <td>
                    <button
                      class="status-toggle"
                      [class.active]="item.status === 'ACTIVE'"
                      (click)="toggleStatus(item.id)"
                    >
                      {{ item.status }}
                    </button>
                  </td>
                  <td class="text-center">
                    <button class="btn-del" (click)="deleteItem(item.id)" title="Remove Subscription">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <app-recurring-modal *ngIf="showModal" (close)="showModal = false"></app-recurring-modal>
    </div>
  `,
  styles: [`
    .recurring-page {
      min-height: 100vh;
      background: var(--bg-app);
    }

    .recurring-content {
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 1440px;
      margin: 0 auto;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }

    .metric-card {
      background: #FFFFFF;
      border-radius: var(--radius-lg);
      padding: 24px;
      border: 1px solid var(--border-subtle);
      box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.03);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .m-title {
      font-size: 0.775rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .m-val {
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--text-primary);
    }

    .m-sub {
      font-size: 0.775rem;
      color: var(--text-muted);
    }

    .ledger-card {
      background: #FFFFFF;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-subtle);
      box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.03);
      overflow: hidden;
    }

    .table-container {
      overflow-x: auto;
    }

    .recurring-table {
      width: 100%;
      border-collapse: collapse;

      th {
        background: var(--bg-app);
        text-align: left;
        padding: 12px 18px;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        border-bottom: 1px solid var(--border-subtle);
      }

      td {
        padding: 14px 18px;
        border-bottom: 1px solid var(--border-subtle);
        font-size: 0.875rem;
      }
    }

    .text-center { text-align: center; }

    .sub-title {
      font-weight: 700;
      color: var(--text-primary);
    }

    .cat-pill, .freq-pill {
      display: inline-block;
      padding: 3px 8px;
      background: var(--bg-subtle);
      color: var(--text-secondary);
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 600;
    }

    .date-val, .method-val {
      color: var(--text-secondary);
      font-size: 0.825rem;
    }

    .amount-val {
      font-weight: 700;
      color: var(--text-primary);
    }

    .status-toggle {
      padding: 4px 10px;
      border-radius: var(--radius-sm);
      font-size: 0.725rem;
      font-weight: 700;
      background: var(--bg-subtle);
      color: var(--text-muted);

      &.active {
        background: var(--success-bg);
        color: var(--success);
      }
    }

    .btn-del {
      color: var(--text-muted);
      padding: 6px;
      border-radius: var(--radius-sm);

      &:hover {
        background: var(--primary-50);
        color: var(--primary-600);
      }
    }

    .empty-state {
      padding: 48px;
      text-align: center;
      color: var(--text-muted);
    }
  `],
})
export class RecurringComponent implements OnInit {
  store = inject(StoreService);

  showModal = false;

  ngOnInit(): void {
    this.store.loadRecurring();
  }

  getMonthlyTotal(items: Recurring[]): number {
    return items
      .filter((i) => i.status === 'ACTIVE')
      .reduce((sum, item) => {
        if (item.frequency === 'YEARLY') return sum + item.amount / 12;
        if (item.frequency === 'WEEKLY') return sum + (item.amount * 52) / 12;
        return sum + item.amount;
      }, 0);
  }

  getActiveCount(items: Recurring[]): number {
    return items.filter((i) => i.status === 'ACTIVE').length;
  }

  toggleStatus(id: string) {
    this.store.toggleRecurring(id);
  }

  deleteItem(id: string) {
    if (confirm('Delete this subscription?')) {
      this.store.deleteRecurring(id);
    }
  }
}
