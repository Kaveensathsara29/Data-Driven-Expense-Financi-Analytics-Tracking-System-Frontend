import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategorySpendBreakdown } from '../../core/models/types';

interface DonutSlice {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  path: string;
}

@Component({
  selector: 'app-donut-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="donut-container">
      <div class="chart-wrapper">
        <svg viewBox="0 0 240 240" class="donut-svg">
          <g transform="translate(120, 120)">
            <circle cx="0" cy="0" r="85" fill="none" stroke="#F1F5F9" stroke-width="26"/>
            
            <path
              *ngFor="let slice of slices"
              [attr.d]="slice.path"
              [attr.stroke]="slice.color"
              stroke-width="26"
              fill="none"
              stroke-linecap="round"
              class="donut-slice"
              (mouseenter)="hoveredSlice = slice"
              (mouseleave)="hoveredSlice = null"
            />
          </g>
        </svg>

        <div class="donut-center">
          <span class="center-label">{{ hoveredSlice ? hoveredSlice.category : 'Total Spent' }}</span>
          <span class="center-value">
            \${{ (hoveredSlice ? hoveredSlice.amount : totalAmount) | number:'1.2-2' }}
          </span>
          <span class="center-pct" *ngIf="hoveredSlice">
            {{ hoveredSlice.percentage }}% of total
          </span>
        </div>
      </div>

      <div class="legend-list">
        <div
          *ngFor="let item of slices"
          class="legend-item"
          [class.active]="hoveredSlice?.category === item.category"
          (mouseenter)="hoveredSlice = item"
          (mouseleave)="hoveredSlice = null"
        >
          <div class="legend-left">
            <span class="color-dot" [style.backgroundColor]="item.color"></span>
            <span class="category-name">{{ item.category }}</span>
          </div>
          <div class="legend-right">
            <span class="item-amount">\${{ item.amount | number:'1.0-0' }}</span>
            <span class="item-pct">{{ item.percentage }}%</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .donut-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .chart-wrapper {
      position: relative;
      width: 220px;
      height: 220px;
      margin: 0 auto;
    }

    .donut-svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .donut-slice {
      transition: stroke-width 0.2s ease, opacity 0.2s ease;
      cursor: pointer;

      &:hover {
        stroke-width: 32;
        opacity: 0.9;
      }
    }

    .donut-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      pointer-events: none;
    }

    .center-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      max-width: 110px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .center-value {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }

    .center-pct {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--primary-600);
    }

    .legend-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 220px;
      overflow-y: auto;
      padding-right: 4px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 10px;
      border-radius: var(--radius-sm);
      transition: background 0.15s ease;
      cursor: pointer;

      &:hover, &.active {
        background: var(--primary-50);
      }
    }

    .legend-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .color-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .category-name {
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .legend-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .item-amount {
      font-size: 0.825rem;
      font-weight: 700;
      color: var(--text-secondary);
    }

    .item-pct {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      min-width: 34px;
      text-align: right;
    }
  `],
})
export class DonutChartComponent implements OnChanges {
  @Input() data: CategorySpendBreakdown[] = [];

  slices: DonutSlice[] = [];
  totalAmount = 0;
  hoveredSlice: DonutSlice | null = null;

  private colors = [
    '#BE123C', // Dark Rose
    '#E11D48', // Vivid Crimson
    '#F43F5E', // Rose 500
    '#FB7185', // Rose 400
    '#FDA4AF', // Rose 300
    '#9F1239', // Rose 800
    '#881337', // Rose 900
    '#F87171', // Red 400
    '#EF4444', // Red 500
    '#DC2626', // Red 600
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.calculateSlices();
    }
  }

  private calculateSlices() {
    if (!this.data || this.data.length === 0) {
      this.slices = [];
      this.totalAmount = 0;
      return;
    }

    this.totalAmount = this.data.reduce((sum, item) => sum + item.totalAmount, 0);
    const radius = 85;
    let accumulatedAngle = 0;

    this.slices = this.data.map((item, index) => {
      const percentage = item.percentage;
      const angle = (percentage / 100) * 360;

      // Arc calculation in radians
      const startAngle = accumulatedAngle;
      const endAngle = accumulatedAngle + angle;
      accumulatedAngle = endAngle;

      const path = this.describeArc(0, 0, radius, startAngle, endAngle);

      return {
        category: item.category,
        amount: item.totalAmount,
        percentage: item.percentage,
        color: this.colors[index % this.colors.length],
        path,
      };
    });
  }

  private describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number): string {
    const start = this.polarToCartesian(x, y, radius, endAngle);
    const end = this.polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  }

  private polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  }
}
