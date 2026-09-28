import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StoreService } from '../../state/store.service';
import { HeaderComponent } from '../../components/header/header.component';
import { DonutChartComponent } from '../../components/charts/donut-chart.component';
import { BarChartComponent } from '../../components/charts/bar-chart.component';
import { TransactionModalComponent } from '../../components/modals/transaction-modal.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    DonutChartComponent,
    BarChartComponent,
    TransactionModalComponent,
  ],
  template: `
    <div class="dashboard-page">
      <app-header
        title="Financial Overview"
        subtitle="Real-time cash flow, category distributions, and budget thresholds"
        [canAddTransaction]="(store.isAuthenticated$ | async) ?? false"
        (openAddModal)="showAddModal = true"
      ></app-header>

      <main class="dashboard-content">
        <!-- KPI Metrics Grid -->
        <section class="kpi-grid" *ngIf="store.stats$ | async as stats">
          <div class="kpi-card highlight-card">
            <div class="kpi-top">
              <span class="kpi-title">Net Balance</span>
              <span class="kpi-badge primary">Portfolio</span>
            </div>
            <div class="kpi-val" [class.negative]="stats.netBalance < 0">
              \${{ stats.netBalance | number:'1.2-2' }}
            </div>
            <div class="kpi-footer">
              <span class="subtext">Burn Rate: <strong>\${{ stats.monthlyBurnRate | number:'1.0-0' }}</strong>/mo</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-top">
              <span class="kpi-title">Total Inflow</span>
              <span class="kpi-badge success">Income</span>
            </div>
            <div class="kpi-val income-val">
              +\${{ stats.totalIncome | number:'1.2-2' }}
            </div>
            <div class="kpi-footer">
              <span class="subtext">From payroll, consulting & dividends</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-top">
              <span class="kpi-title">Total Outflow</span>
              <span class="kpi-badge danger">Expenses</span>
            </div>
            <div class="kpi-val expense-val">
              -\${{ stats.totalExpense | number:'1.2-2' }}
            </div>
            <div class="kpi-footer">
              <span class="subtext">Fixed & lifestyle disbursements</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-top">
              <span class="kpi-title">Savings Rate</span>
              <span class="kpi-badge" [ngClass]="stats.savingsRate >= 20 ? 'success' : 'warning'">
                {{ stats.savingsRate >= 20 ? 'Strong' : 'Moderate' }}
              </span>
            </div>
            <div class="kpi-val">{{ stats.savingsRate }}%</div>
            <div class="progress-bar-wrapper">
              <div class="progress-fill" [style.width.%]="stats.savingsRate"></div>
            </div>
          </div>
        </section>

        <section class="charts-row" *ngIf="store.stats$ | async as stats">
          <div class="chart-card">
            <div class="card-head">
              <div>
                <h3 class="card-title">Cash Flow Dynamics</h3>
                <p class="card-sub">6-Month Income vs Outflow Comparison</p>
              </div>
            </div>
            <div class="card-body">
              <app-bar-chart [data]="stats.monthlyTrends"></app-bar-chart>
            </div>
          </div>

          <div class="chart-card">
            <div class="card-head">
              <div>
                <h3 class="card-title">Expense Distribution</h3>
                <p class="card-sub">Outflows segregated by category allocation</p>
              </div>
            </div>
            <div class="card-body">
              <app-donut-chart [data]="stats.categoryBreakdown"></app-donut-chart>
            </div>
          </div>
        </section>

        <section class="split-row">
          <div class="content-card budgets-preview-card">
            <div class="card-head">
              <div>
                <h3 class="card-title">Monthly Budget Watch</h3>
                <p class="card-sub">Active limits & threshold alerts</p>
              </div>
              <a routerLink="/budgets" class="link-action">View All Budgets &rarr;</a>
            </div>

            <div class="budgets-list" *ngIf="store.budgets$ | async as budgets">
              <div *ngIf="budgets.length === 0" class="empty-state">
                No active category budgets defined yet.
              </div>

              <div *ngFor="let b of budgets.slice(0, 4)" class="budget-item">
                <div class="budget-info">
                  <span class="budget-category">{{ b.category }}</span>
                  <div class="budget-numbers">
                    <span class="spent">\${{ b.currentSpent | number:'1.0-0' }}</span>
                    <span class="limit">/ \${{ b.monthlyLimit | number:'1.0-0' }}</span>
                  </div>
                </div>

                <div class="budget-meter">
                  <div
                    class="meter-fill"
                    [ngClass]="b.status.toLowerCase()"
                    [style.width.%]="b.percentage > 100 ? 100 : b.percentage"
                  ></div>
                </div>

                <div class="budget-item-footer">
                  <span class="pct">{{ b.percentage }}% spent</span>
                  <span class="status-pill" [ngClass]="b.status.toLowerCase()">
                    {{ b.status === 'EXCEEDED' ? 'OVER BUDGET' : (b.status === 'WARNING' ? 'NEAR LIMIT' : 'HEALTHY') }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="content-card transactions-preview-card">
            <div class="card-head">
              <div>
                <h3 class="card-title">Recent Transactions</h3>
                <p class="card-sub">Latest ledger entries</p>
              </div>
              <a routerLink="/transactions" class="link-action">View Full Ledger &rarr;</a>
            </div>

            <div class="transactions-table-wrap">
              <table class="simple-table" *ngIf="store.transactions$ | async as txs">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th class="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let tx of txs.slice(0, 6)">
                    <td>
                      <div class="tx-cell-title">
                        <span class="tx-name">{{ tx.title }}</span>
                        <span class="tx-method">{{ tx.paymentMethod }}</span>
                      </div>
                    </td>
                    <td><span class="category-pill">{{ tx.category }}</span></td>
                    <td><span class="date-text">{{ tx.date | date:'MMM d, y' }}</span></td>
                    <td class="text-right">
                      <span class="amount-pill" [ngClass]="tx.type === 'INCOME' ? 'income' : 'expense'">
                        {{ tx.type === 'INCOME' ? '+' : '-' }}\${{ tx.amount | number:'1.2-2' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      <app-transaction-modal
        *ngIf="showAddModal"
        (close)="showAddModal = false"
      ></app-transaction-modal>
    </div>
  `,
  styles: [`
    .dashboard-page {
      min-height: 100vh;
      background: var(--bg-app);
    }

    .dashboard-content {
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 32px;
      max-width: 1440px;
      margin: 0 auto;
    }

    /* KPI Grid */
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }

    .kpi-card {
      background: #FFFFFF;
      border-radius: var(--radius-lg);
      padding: 24px;
      border: 1px solid var(--border-subtle);
      box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.03);
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 24px -4px rgba(225, 29, 72, 0.08);
      }

      &.highlight-card {
        border-top: 4px solid var(--primary-600);
      }
    }

    .kpi-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .kpi-title {
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .kpi-badge {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      text-transform: uppercase;
      letter-spacing: 0.05em;

      &.primary { background: var(--primary-50); color: var(--primary-700); }
      &.success { background: var(--success-bg); color: var(--success); }
      &.danger { background: var(--danger-bg); color: var(--primary-600); }
      &.warning { background: var(--warning-bg); color: var(--warning); }
    }

    .kpi-val {
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.03em;

      &.income-val { color: #10B981; }
      &.expense-val { color: var(--primary-600); }
      &.negative { color: var(--primary-600); }
    }

    .kpi-footer {
      font-size: 0.775rem;
      color: var(--text-muted);
    }

    .progress-bar-wrapper {
      width: 100%;
      height: 6px;
      background: var(--bg-subtle);
      border-radius: 999px;
      overflow: hidden;
      margin-top: 4px;
    }

    .progress-fill {
      height: 100%;
      background: #10B981;
      border-radius: 999px;
    }

    /* Charts Row */
    .charts-row { display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px; }

    .chart-card {
      background: #FFFFFF;
      border-radius: var(--radius-lg);
      padding: 24px 28px;
      border: 1px solid var(--border-subtle);
      box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.03);
      display: flex;
      flex-direction: column;
    }

    .card-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .card-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .card-sub {
      font-size: 0.775rem;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .link-action {
      font-size: 0.825rem;
      font-weight: 700;
      color: var(--primary-600);
      text-decoration: none;

      &:hover { text-decoration: underline; }
    }

    /* Split Row */
    .split-row { display: grid; grid-template-columns: 1fr 1.3fr; gap: 24px; }

    .content-card {
      background: #FFFFFF;
      border-radius: var(--radius-lg);
      padding: 24px 28px;
      border: 1px solid var(--border-subtle);
      box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.03);
    }

    .budgets-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .budget-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 12px;
      background: var(--bg-app);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
    }

    .budget-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .budget-category {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .budget-numbers {
      font-size: 0.8rem;
      .spent { font-weight: 700; color: var(--text-primary); }
      .limit { color: var(--text-muted); }
    }

    .budget-meter {
      height: 6px;
      background: #E2E8F0;
      border-radius: 999px;
      overflow: hidden;
    }

    .meter-fill {
      height: 100%;
      border-radius: 999px;

      &.healthy { background: #10B981; }
      &.warning { background: #F59E0B; }
      &.exceeded { background: var(--primary-600); }
    }

    .budget-item-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.725rem;
    }

    .pct {
      color: var(--text-muted);
      font-weight: 600;
    }

    .status-pill {
      font-weight: 700;
      padding: 2px 6px;
      border-radius: var(--radius-sm);
      text-transform: uppercase;
      font-size: 0.65rem;

      &.healthy { background: var(--success-bg); color: var(--success); }
      &.warning { background: var(--warning-bg); color: var(--warning); }
      &.exceeded { background: var(--danger-bg); color: var(--primary-600); }
    }

    .transactions-table-wrap { overflow-x: auto; }
    .simple-table { width: 100%; border-collapse: collapse; }
    .simple-table th { text-align: left; padding: 10px 12px; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; border-bottom: 1px solid var(--border-subtle); }
    .simple-table td { padding: 12px; border-bottom: 1px solid var(--border-subtle); font-size: 0.85rem; }
    .simple-table tr:last-child td { border-bottom: none; }
    .text-right { text-align: right; }
    .tx-cell-title { display: flex; flex-direction: column; }
    .tx-name { font-weight: 600; color: var(--text-primary); }
    .tx-method { font-size: 0.725rem; color: var(--text-muted); }
    .category-pill { display: inline-block; padding: 3px 8px; background: var(--bg-subtle); color: var(--text-secondary); border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 600; }
    .date-text { color: var(--text-muted); font-size: 0.8rem; }
    .amount-pill { font-weight: 700; font-size: 0.875rem; }
    .amount-pill.income { color: #10B981; }
    .amount-pill.expense { color: var(--primary-600); }

    .empty-state {
      padding: 24px;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.85rem;
    }

    @media (max-width: 1200px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .charts-row, .split-row { grid-template-columns: 1fr; }
    }

    @media (max-width: 640px) {
      .dashboard-content {
        padding: 16px;
        gap: 20px;
      }

      .kpi-grid {
        grid-template-columns: 1fr;
      }

      .kpi-card,
      .chart-card,
      .content-card {
        padding: 18px 16px;
      }

      .card-head,
      .budget-info,
      .budget-item-footer {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
  `],
})
export class DashboardComponent implements OnInit {
  store = inject(StoreService);

  showAddModal = false;

  ngOnInit(): void {
    this.store.loadDashboard();
  }
}
