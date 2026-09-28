import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthlyTrend } from '../../core/models/types';

interface ChartBarGroup {
  month: string;
  income: number;
  expense: number;
  netSavings: number;
  incomeHeight: number;
  expenseHeight: number;
}

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="barchart-container">
      <div class="chart-header">
        <div class="legend-indicators">
          <div class="indicator">
            <span class="dot income-dot"></span>
            <span>Income</span>
          </div>
          <div class="indicator">
            <span class="dot expense-dot"></span>
            <span>Expenses</span>
          </div>
        </div>
      </div>

      <div class="bars-wrapper">
        <div *ngFor="let group of barGroups" class="month-column" (mouseenter)="hoveredGroup = group" (mouseleave)="hoveredGroup = null">
          <div class="bars-track">
            <!-- Tooltip -->
            <div class="bar-tooltip" *ngIf="hoveredGroup?.month === group.month">
              <span class="tt-month">{{ group.month }}</span>
              <span class="tt-income">+{{ group.income | currency }}</span>
              <span class="tt-expense">-{{ group.expense | currency }}</span>
              <span class="tt-net" [class.positive]="group.netSavings >= 0">
                Net: {{ group.netSavings | currency }}
              </span>
            </div>

            <!-- Income Bar -->
            <div
              class="bar income-bar"
              [style.height.%]="group.incomeHeight"
              [title]="'Income: $' + group.income"
            ></div>

            <!-- Expense Bar -->
            <div
              class="bar expense-bar"
              [style.height.%]="group.expenseHeight"
              [title]="'Expense: $' + group.expense"
            ></div>
          </div>
          <span class="month-label">{{ group.month }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .barchart-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      height: 100%;
    }

    .chart-header {
      display: flex;
      justify-content: flex-end;
    }

    .legend-indicators {
      display: flex;
      gap: 16px;
    }

    .indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 3px;

      &.income-dot { background: var(--success); }
      &.expense-dot { background: var(--primary-600); }
    }

    .bars-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      height: 220px;
      padding-top: 30px;
      border-bottom: 1px solid var(--border-subtle);
      gap: 12px;
    }

    .month-column {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      height: 100%;
      position: relative;
    }

    .bars-track {
      flex: 1;
      width: 100%;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 6px;
      position: relative;
    }

    .bar {
      width: 16px;
      border-radius: 4px 4px 0 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      min-height: 4px;

      &.income-bar {
        background: #10B981;
        &:hover { background: #059669; }
      }

      &.expense-bar {
        background: var(--primary-600);
        &:hover { background: var(--primary-700); }
      }
    }

    .month-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      white-space: nowrap;
    }

    .bar-tooltip {
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      background: #0F172A;
      color: #FFFFFF;
      padding: 6px 10px;
      border-radius: var(--radius-sm);
      font-size: 0.725rem;
      display: flex;
      flex-direction: column;
      gap: 2px;
      white-space: nowrap;
      z-index: 50;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
      pointer-events: none;

      .tt-month { font-weight: 700; color: #94A3B8; margin-bottom: 2px; }
      .tt-income { color: #34D399; font-weight: 600; }
      .tt-expense { color: #FB7185; font-weight: 600; }
      .tt-net {
        border-top: 1px solid #334155;
        padding-top: 2px;
        margin-top: 2px;
        font-weight: 700;
        color: #F87171;
        &.positive { color: #34D399; }
      }
    }
  `],
})
export class BarChartComponent implements OnChanges {
  @Input() data: MonthlyTrend[] = [];

  barGroups: ChartBarGroup[] = [];
  hoveredGroup: ChartBarGroup | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.calculateBars();
    }
  }

  private calculateBars() {
    if (!this.data || this.data.length === 0) {
      this.barGroups = [];
      return;
    }

    let maxVal = 0;
    this.data.forEach((d) => {
      if (d.income > maxVal) maxVal = d.income;
      if (d.expense > maxVal) maxVal = d.expense;
    });

    if (maxVal === 0) maxVal = 1;

    this.barGroups = this.data.map((d) => ({
      month: d.month.split(' ')[0], // e.g. "Mar" from "Mar 2026"
      income: d.income,
      expense: d.expense,
      netSavings: d.netSavings,
      incomeHeight: Math.min(100, Math.round((d.income / maxVal) * 100)),
      expenseHeight: Math.min(100, Math.round((d.expense / maxVal) * 100)),
    }));
  }
}
