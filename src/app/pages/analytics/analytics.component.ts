import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../state/store.service';
import { HeaderComponent } from '../../components/header/header.component';
import { DonutChartComponent } from '../../components/charts/donut-chart.component';
import { BarChartComponent } from '../../components/charts/bar-chart.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, HeaderComponent, DonutChartComponent, BarChartComponent],
  template: `
    <div class="analytics-page">
      <app-header
        title="Financial Intelligence & Analytics"
        subtitle="Historical trend analysis, capital efficiency ratios, and category allocation audits"
      ></app-header>

      <main class="analytics-content" *ngIf="store.stats$ | async as stats">
        <!-- Capital Efficiency Metrics -->
        <div class="metrics-row">
          <div class="card stat-card">
            <span class="stat-title">Capital Retention Rate</span>
            <span class="stat-val">{{ stats.savingsRate }}%</span>
            <span class="stat-desc">Portion of total revenue retained as net equity</span>
          </div>

          <div class="card stat-card">
            <span class="stat-title">Average Monthly Burn</span>
            <span class="stat-val">\${{ stats.monthlyBurnRate | number:'1.0-0' }}</span>
            <span class="stat-desc">Rolling monthly average operational outlay</span>
          </div>

          <div class="card stat-card">
            <span class="stat-title">Net Cumulative Margin</span>
            <span class="stat-val" [class.negative]="stats.netBalance < 0">
              \${{ stats.netBalance | number:'1.2-2' }}
            </span>
            <span class="stat-desc">Historical net surplus after all disbursements</span>
          </div>
        </div>

        <!-- Visual Analytics Visualizations -->
        <div class="charts-row">
          <div class="card">
            <div class="card-head">
              <h3 class="card-title">Rolling 6-Month Cash Trends</h3>
              <p class="card-sub">Inflow stability vs outlay acceleration</p>
            </div>
            <app-bar-chart [data]="stats.monthlyTrends"></app-bar-chart>
          </div>

          <div class="card">
            <div class="card-head">
              <h3 class="card-title">Expense Concentration</h3>
              <p class="card-sub">Capital distribution across active cost centers</p>
            </div>
            <app-donut-chart [data]="stats.categoryBreakdown"></app-donut-chart>
          </div>
        </div>

        <!-- Monthly Financial Performance Table -->
        <div class="card">
          <div class="card-head">
            <h3 class="card-title">Monthly Ledger Performance</h3>
            <p class="card-sub">Audited monthly revenue, burn rate, and net retention</p>
          </div>

          <div class="table-wrap">
            <table class="report-table">
              <thead>
                <tr>
                  <th>Cycle Period</th>
                  <th>Total Inflow</th>
                  <th>Total Outflow</th>
                  <th>Net Surplus / Deficit</th>
                  <th>Savings Margin</th>
                  <th>Health Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let m of stats.monthlyTrends">
                  <td><strong>{{ m.month }}</strong></td>
                  <td class="income-cell">+\${{ m.income | number:'1.2-2' }}</td>
                  <td class="expense-cell">-\${{ m.expense | number:'1.2-2' }}</td>
                  <td [ngClass]="m.netSavings >= 0 ? 'income-cell' : 'expense-cell'">
                    \${{ m.netSavings | number:'1.2-2' }}
                  </td>
                  <td>
                    {{ m.income > 0 ? ((m.netSavings / m.income) * 100 | number:'1.1-1') : 0 }}%
                  </td>
                  <td>
                    <span
                      class="health-badge"
                      [ngClass]="m.netSavings >= 1000 ? 'healthy' : (m.netSavings >= 0 ? 'neutral' : 'deficit')"
                    >
                      {{ m.netSavings >= 1000 ? 'EXCELLENT' : (m.netSavings >= 0 ? 'BALANCED' : 'DEFICIT') }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .analytics-page {
      min-height: 100vh;
      background: var(--bg-app);
    }

    .analytics-content {
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 1440px;
      margin: 0 auto;
    }

    .metrics-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }

    .card {
      background: #FFFFFF;
      border-radius: var(--radius-lg);
      padding: 24px 28px;
      border: 1px solid var(--border-subtle);
      box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.03);
    }

    .stat-card {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .stat-title {
      font-size: 0.775rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat-val {
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.02em;

      &.negative { color: var(--primary-600); }
    }

    .stat-desc {
      font-size: 0.775rem;
      color: var(--text-muted);
    }

    .charts-row {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 24px;
    }

    .card-head {
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

    .table-wrap {
      overflow-x: auto;
    }

    .report-table {
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

    .income-cell { color: #10B981; font-weight: 700; }
    .expense-cell { color: var(--primary-600); font-weight: 700; }

    .health-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;

      &.healthy { background: var(--success-bg); color: var(--success); }
      &.neutral { background: var(--warning-bg); color: var(--warning); }
      &.deficit { background: var(--danger-bg); color: var(--primary-600); }
    }
  `],
})
export class AnalyticsComponent implements OnInit {
  store = inject(StoreService);

  ngOnInit(): void {
    this.store.loadDashboard();
  }
}
