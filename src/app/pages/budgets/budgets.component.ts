import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../state/store.service';
import { HeaderComponent } from '../../components/header/header.component';
import { BudgetModalComponent } from '../../components/modals/budget-modal.component';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule, HeaderComponent, BudgetModalComponent],
  template: `
    <div class="budgets-page">
      <app-header
        title="Budgets & Spending Limits"
        subtitle="Enforce category caps, prevent overspending, and track real-time burn velocity"
        (openAddModal)="showModal = true"
      ></app-header>

      <main class="budgets-content">
        <!-- Summary Alert Bar -->
        <div class="summary-card" *ngIf="store.budgets$ | async as budgets">
          <div class="summary-stat">
            <span class="stat-title">Active Budgets</span>
            <span class="stat-num">{{ budgets.length }} Categories</span>
          </div>

          <div class="summary-stat">
            <span class="stat-title">Total Monthly Limit</span>
            <span class="stat-num">\${{ getTotalLimit(budgets) | number:'1.0-0' }}</span>
          </div>

          <div class="summary-stat">
            <span class="stat-title">Spent This Month</span>
            <span class="stat-num">\${{ getTotalSpent(budgets) | number:'1.0-0' }}</span>
          </div>

          <div class="summary-stat">
            <span class="stat-title">Overall Budget Status</span>
            <span class="badge-status" [ngClass]="getOverallStatus(budgets).toLowerCase()">
              {{ getOverallStatus(budgets) }}
            </span>
          </div>
        </div>

        <!-- Budget Cards Grid -->
        <div class="budgets-grid" *ngIf="store.budgets$ | async as budgets">
          <div *ngIf="budgets.length === 0" class="empty-card">
            <h3>No Budgets Established</h3>
            <p>Define spending limits to monitor category outlays with automated alerts.</p>
            <button class="btn-create" (click)="showModal = true">Set First Budget</button>
          </div>

          <div *ngFor="let b of budgets" class="budget-card" [ngClass]="b.status.toLowerCase()">
            <div class="card-top">
              <div class="cat-group">
                <span class="cat-name">{{ b.category }}</span>
                <span class="status-pill" [ngClass]="b.status.toLowerCase()">
                  {{ b.status === 'EXCEEDED' ? 'OVER BUDGET' : (b.status === 'WARNING' ? 'NEAR LIMIT' : 'ON TRACK') }}
                </span>
              </div>
              <button class="btn-delete" (click)="deleteBudget(b.id)" title="Remove Budget">
                &times;
              </button>
            </div>

            <!-- Numbers -->
            <div class="card-numbers">
              <div class="main-spend">
                <span class="spent-val">\${{ b.currentSpent | number:'1.0-0' }}</span>
                <span class="limit-val">of \${{ b.monthlyLimit | number:'1.0-0' }}</span>
              </div>
              <div class="remaining-box">
                <span class="rem-label">Remaining:</span>
                <span class="rem-val" [class.negative]="b.remaining <= 0">
                  \${{ b.remaining | number:'1.0-0' }}
                </span>
              </div>
            </div>

            <!-- Meter -->
            <div class="meter-bar">
              <div
                class="meter-fill"
                [ngClass]="b.status.toLowerCase()"
                [style.width.%]="b.percentage > 100 ? 100 : b.percentage"
              ></div>
            </div>

            <div class="card-footer">
              <span class="pct-text">{{ b.percentage }}% utilized</span>
              <span class="advice" *ngIf="b.status === 'EXCEEDED'">Overspent by \${{ (b.currentSpent - b.monthlyLimit) | number:'1.0-0' }}!</span>
              <span class="advice warning" *ngIf="b.status === 'WARNING'">Approaching monthly ceiling</span>
              <span class="advice healthy" *ngIf="b.status === 'HEALTHY'">Healthy spending velocity</span>
            </div>
          </div>
        </div>
      </main>

      <app-budget-modal *ngIf="showModal" (close)="showModal = false"></app-budget-modal>
    </div>
  `,
  styles: [`
    .budgets-page {
      min-height: 100vh;
      background: var(--bg-app);
    }

    .budgets-content {
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 1440px;
      margin: 0 auto;
    }

    .summary-card {
      background: #FFFFFF;
      border-radius: var(--radius-lg);
      padding: 24px;
      border: 1px solid var(--border-subtle);
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.03);
    }

    .summary-stat {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stat-title {
      font-size: 0.775rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat-num {
      font-size: 1.45rem;
      font-weight: 800;
      color: var(--text-primary);
    }

    .badge-status {
      display: inline-block;
      align-self: flex-start;
      margin-top: 4px;
      padding: 4px 10px;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;

      &.healthy { background: var(--success-bg); color: var(--success); }
      &.warning { background: var(--warning-bg); color: var(--warning); }
      &.exceeded { background: var(--danger-bg); color: var(--primary-600); }
    }

    .budgets-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }

    .budget-card {
      background: #FFFFFF;
      border-radius: var(--radius-lg);
      padding: 24px;
      border: 1px solid var(--border-subtle);
      box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.03);
      display: flex;
      flex-direction: column;
      gap: 16px;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 24px -4px rgba(0, 0, 0, 0.06);
      }

      &.exceeded {
        border-top: 4px solid var(--primary-600);
      }

      &.warning {
        border-top: 4px solid var(--warning);
      }

      &.healthy {
        border-top: 4px solid var(--success);
      }
    }

    .card-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }

    .cat-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .cat-name {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .status-pill {
      font-size: 0.675rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
      align-self: flex-start;

      &.healthy { background: var(--success-bg); color: var(--success); }
      &.warning { background: var(--warning-bg); color: var(--warning); }
      &.exceeded { background: var(--danger-bg); color: var(--primary-600); }
    }

    .btn-delete {
      font-size: 1.25rem;
      color: var(--text-muted);
      padding: 2px 6px;
      line-height: 1;

      &:hover { color: var(--primary-600); }
    }

    .card-numbers {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
    }

    .main-spend {
      display: flex;
      align-items: baseline;
      gap: 6px;

      .spent-val {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--text-primary);
      }

      .limit-val {
        font-size: 0.85rem;
        color: var(--text-muted);
        font-weight: 600;
      }
    }

    .remaining-box {
      display: flex;
      flex-direction: column;
      align-items: flex-end;

      .rem-label { font-size: 0.7rem; color: var(--text-muted); }
      .rem-val {
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--text-primary);

        &.negative { color: var(--primary-600); }
      }
    }

    .meter-bar {
      height: 8px;
      background: var(--bg-subtle);
      border-radius: 999px;
      overflow: hidden;
    }

    .meter-fill {
      height: 100%;
      border-radius: 999px;
      transition: width 0.4s ease;

      &.healthy { background: var(--success); }
      &.warning { background: var(--warning); }
      &.exceeded { background: var(--primary-600); }
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.75rem;

      .pct-text { font-weight: 700; color: var(--text-secondary); }
      .advice {
        font-weight: 600;
        color: var(--primary-600);
        &.healthy { color: var(--success); }
        &.warning { color: var(--warning); }
      }
    }

    .empty-card {
      grid-column: 1 / -1;
      background: #FFFFFF;
      border-radius: var(--radius-lg);
      padding: 48px;
      text-align: center;
      border: 1px dashed var(--border-subtle);

      h3 { font-size: 1.1rem; color: var(--text-primary); margin-bottom: 6px; }
      p { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 16px; }
    }

    .btn-create {
      padding: 10px 20px;
      background: var(--primary-600);
      color: #FFFFFF;
      font-weight: 600;
      border-radius: var(--radius-md);
      font-size: 0.875rem;

      &:hover { background: var(--primary-700); }
    }

    @media (max-width: 1024px) {
      .budgets-grid { grid-template-columns: repeat(2, 1fr); }
      .summary-card { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 640px) {
      .budgets-content {
        padding: 16px;
      }

      .summary-card,
      .budgets-grid {
        grid-template-columns: 1fr;
      }

      .card-numbers,
      .card-footer {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
  `],
})
export class BudgetsComponent implements OnInit {
  store = inject(StoreService);

  showModal = false;

  ngOnInit(): void {
    this.store.loadBudgets();
  }

  getTotalLimit(budgets: any[]): number {
    return budgets.reduce((acc, b) => acc + b.monthlyLimit, 0);
  }

  getTotalSpent(budgets: any[]): number {
    return budgets.reduce((acc, b) => acc + b.currentSpent, 0);
  }

  getOverallStatus(budgets: any[]): string {
    const totalLimit = this.getTotalLimit(budgets);
    const totalSpent = this.getTotalSpent(budgets);
    if (totalLimit === 0) return 'HEALTHY';
    const pct = (totalSpent / totalLimit) * 100;
    if (pct >= 100) return 'EXCEEDED';
    if (pct >= 75) return 'WARNING';
    return 'HEALTHY';
  }

  deleteBudget(id: string) {
    if (confirm('Delete this budget limit?')) {
      this.store.deleteBudget(id);
    }
  }
}
