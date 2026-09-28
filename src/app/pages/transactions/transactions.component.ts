import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../state/store.service';
import { HeaderComponent } from '../../components/header/header.component';
import { TransactionModalComponent } from '../../components/modals/transaction-modal.component';
import { Category, Transaction } from '../../core/models/types';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, TransactionModalComponent],
  template: `
    <div class="transactions-page">
      <app-header
        title="Transaction Ledger"
        subtitle="Manage, filter, search, and export complete financial records"
        (openAddModal)="openCreateModal()"
      ></app-header>

      <main class="transactions-content">
        <!-- Filter Controls Toolbar -->
        <div class="filters-card">
          <div class="search-input-wrap">
            <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onFilterChange()"
              placeholder="Search by payee, tag, or note..."
              class="search-input"
            />
          </div>

          <!-- Type Filter Tabs -->
          <div class="type-filter-group">
            <button
              type="button"
              class="type-btn"
              [class.active]="selectedType === ''"
              (click)="setTypeFilter('')"
            >
              All Types
            </button>
            <button
              type="button"
              class="type-btn expense-btn"
              [class.active]="selectedType === 'EXPENSE'"
              (click)="setTypeFilter('EXPENSE')"
            >
              Expenses
            </button>
            <button
              type="button"
              class="type-btn income-btn"
              [class.active]="selectedType === 'INCOME'"
              (click)="setTypeFilter('INCOME')"
            >
              Income
            </button>
          </div>

          <!-- Category Select Filter -->
          <div class="select-wrap" *ngIf="store.categories$ | async as categories">
            <select
              [(ngModel)]="selectedCategory"
              (ngModelChange)="onFilterChange()"
              class="filter-select"
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              <option *ngFor="let cat of categoriesForFilter(categories)" [value]="cat.name">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- CSV Export Button -->
          <button type="button" class="btn-export" (click)="exportCSV()" title="Export Ledger as CSV">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>Export CSV</span>
          </button>
        </div>

        <!-- Ledger Table -->
        <div class="ledger-card">
          <div class="table-container">
            <table class="ledger-table">
              <thead>
                <tr>
                  <th>Transaction / Memo</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Payment Method</th>
                  <th>Tags</th>
                  <th class="text-right">Amount</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="(store.isLoading$ | async)">
                  <td colspan="7" class="loading-state">Loading ledger entries...</td>
                </tr>

                <tr *ngIf="!(store.isLoading$ | async) && (store.transactions$ | async)?.length === 0">
                  <td colspan="7" class="empty-state">No transactions match your search filter.</td>
                </tr>

                <tr *ngFor="let tx of (store.transactions$ | async)">
                  <td>
                    <div class="tx-main">
                      <span class="tx-title">{{ tx.title }}</span>
                      <span class="tx-notes" *ngIf="tx.notes">{{ tx.notes }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="category-badge">{{ tx.category }}</span>
                  </td>
                  <td>
                    <span class="date-text">{{ tx.date | date:'MMM d, y' }}</span>
                  </td>
                  <td>
                    <span class="method-text">{{ tx.paymentMethod }}</span>
                  </td>
                  <td>
                    <div class="tags-row">
                      <span *ngFor="let tag of tx.tags" class="tag-pill">#{{ tag }}</span>
                    </div>
                  </td>
                  <td class="text-right">
                    <span
                      class="amount-display"
                      [ngClass]="tx.type === 'INCOME' ? 'income' : 'expense'"
                    >
                      {{ tx.type === 'INCOME' ? '+' : '-' }}\${{ tx.amount | number:'1.2-2' }}
                    </span>
                  </td>
                  <td class="text-center">
                    <div class="actions-group">
                      <button type="button" class="action-btn edit-btn" (click)="openEditModal(tx)" title="Edit">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M12 20h9"/>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                        </svg>
                      </button>
                      <button type="button" class="action-btn delete-btn" (click)="deleteTx(tx.id)" title="Delete">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination Bar -->
          <div class="pagination-bar" *ngIf="store.pagination$ | async as pag">
            <span class="pag-info">
              Showing page {{ pag.currentPage }} of {{ pag.totalPages }} ({{ pag.totalCount }} total entries)
            </span>
            <div class="pag-btns">
              <button
                type="button"
                class="pag-btn"
                [disabled]="pag.currentPage <= 1"
                (click)="changePage(pag.currentPage - 1)"
              >
                &larr; Prev
              </button>
              <button
                type="button"
                class="pag-btn"
                [disabled]="pag.currentPage >= pag.totalPages"
                (click)="changePage(pag.currentPage + 1)"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </div>
      </main>

      <app-transaction-modal
        *ngIf="showModal"
        [editTransaction]="selectedTx"
        (close)="showModal = false"
      ></app-transaction-modal>
    </div>
  `,
  styles: [`
    .transactions-page {
      min-height: 100vh;
      background: var(--bg-app);
    }

    .transactions-content {
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 1440px;
      margin: 0 auto;
    }

    .filters-card {
      background: #FFFFFF;
      border-radius: var(--radius-lg);
      padding: 16px 20px;
      border: 1px solid var(--border-subtle);
      box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.03);
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .search-input-wrap {
      flex: 1;
      min-width: 240px;
      position: relative;
      display: flex;
      align-items: center;

      .search-icon {
        position: absolute;
        left: 12px;
        color: var(--text-muted);
      }

      .search-input {
        width: 100%;
        padding: 9px 14px 9px 38px;
        border-radius: var(--radius-md);
        border: 1px solid var(--border-subtle);
        font-size: 0.875rem;
        background: var(--bg-app);

        &:focus {
          background: #FFFFFF;
          border-color: var(--primary-600);
          box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.12);
        }
      }
    }

    .type-filter-group {
      display: flex;
      background: var(--bg-app);
      border-radius: var(--radius-md);
      padding: 3px;
      gap: 3px;
      border: 1px solid var(--border-subtle);
    }

    .type-btn {
      padding: 6px 14px;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-secondary);
      border-radius: var(--radius-sm);

      &.active {
        background: #FFFFFF;
        color: var(--text-primary);
        box-shadow: var(--shadow-sm);
      }

      &.expense-btn.active {
        color: var(--primary-600);
      }

      &.income-btn.active {
        color: #10B981;
      }
    }

    .filter-select {
      padding: 8px 12px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
      font-size: 0.85rem;
      color: var(--text-secondary);
      background: #FFFFFF;
      min-width: 160px;

      &:focus {
        border-color: var(--primary-600);
      }
    }

    .btn-export {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: var(--radius-md);
      background: #FFFFFF;
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-weight: 600;

      &:hover {
        background: var(--primary-50);
        color: var(--primary-700);
        border-color: var(--primary-200);
      }
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

    .ledger-table {
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
        letter-spacing: 0.05em;
        border-bottom: 1px solid var(--border-subtle);
      }

      td {
        padding: 14px 18px;
        border-bottom: 1px solid var(--border-subtle);
        font-size: 0.875rem;
      }

      tr:hover td {
        background: #FFFDFD;
      }
    }

    .text-right { text-align: right; }
    .text-center { text-align: center; }

    .tx-main {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .tx-title {
      font-weight: 600;
      color: var(--text-primary);
    }

    .tx-notes {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .category-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: var(--radius-sm);
      background: var(--bg-subtle);
      color: var(--text-primary);
      font-size: 0.775rem;
      font-weight: 600;
    }

    .date-text, .method-text {
      color: var(--text-secondary);
      font-size: 0.825rem;
    }

    .tags-row {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .tag-pill {
      font-size: 0.7rem;
      color: var(--primary-700);
      background: var(--primary-50);
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }

    .amount-display {
      font-size: 0.95rem;
      font-weight: 700;

      &.income { color: #10B981; }
      &.expense { color: var(--primary-600); }
    }

    .actions-group {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .action-btn {
      padding: 6px;
      border-radius: var(--radius-sm);
      color: var(--text-muted);

      &:hover {
        background: var(--bg-subtle);
      }

      &.edit-btn:hover { color: var(--text-primary); }
      &.delete-btn:hover { color: var(--primary-600); background: var(--primary-50); }
    }

    .loading-state, .empty-state {
      padding: 48px;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    .pagination-bar {
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border-subtle);
      background: var(--bg-app);
    }

    @media (max-width: 640px) {
      .transactions-content {
        padding: 16px;
      }

      .filters-card {
        flex-direction: column;
        align-items: stretch;
      }

      .type-filter-group {
        width: 100%;
        justify-content: space-between;
      }

      .type-btn {
        flex: 1;
      }

      .pagination-bar {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }
    }

    .pag-info {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .pag-btns {
      display: flex;
      gap: 8px;
    }

    .pag-btn {
      padding: 6px 12px;
      background: #FFFFFF;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-secondary);

      &:hover:not(:disabled) {
        background: var(--primary-50);
        color: var(--primary-700);
      }
    }
  `],
})
export class TransactionsComponent implements OnInit {
  store = inject(StoreService);

  searchQuery = '';
  selectedType = this.store.preferences$.getValue().lastSelectedType || '';
  selectedCategory = '';
  currentPage = 1;
  pageSize = this.store.preferences$.getValue().pageSize || 15;

  showModal = false;
  selectedTx: Transaction | null = null;

  ngOnInit(): void {
    this.store.loadTransactions(
      {
        search: this.searchQuery,
        type: this.selectedType as any,
        category: this.selectedCategory,
      },
      this.currentPage,
      this.pageSize,
    );
    this.store.loadCategories();
  }

  setTypeFilter(type: string) {
    this.selectedType = type;
    this.selectedCategory = '';
    this.store.updatePreferences({ lastSelectedType: type });
    this.onFilterChange();
  }

  categoriesForFilter(categories: Category[]): Category[] {
    return this.selectedType
      ? categories.filter((category) => category.type === this.selectedType)
      : categories;
  }

  onFilterChange() {
    this.currentPage = 1;
    this.store.loadTransactions(
      {
        search: this.searchQuery,
        type: this.selectedType as any,
        category: this.selectedCategory,
      },
      this.currentPage,
      this.pageSize,
    );
  }

  changePage(page: number) {
    this.currentPage = page;
    this.store.loadTransactions(
      {
        search: this.searchQuery,
        type: this.selectedType as any,
        category: this.selectedCategory,
      },
      this.currentPage,
      this.pageSize,
    );
  }

  openCreateModal() {
    this.selectedTx = null;
    this.showModal = true;
  }

  openEditModal(tx: Transaction) {
    this.selectedTx = tx;
    this.showModal = true;
  }

  deleteTx(id: string) {
    if (confirm('Are you sure you want to permanently delete this transaction?')) {
      this.store.deleteTransaction(id);
    }
  }

  exportCSV() {
    this.store.transactions$.subscribe((txs) => {
      if (!txs || txs.length === 0) {
        this.store.showToast('No transactions to export', 'info');
        return;
      }

      const headers = ['Date', 'Title', 'Type', 'Category', 'Amount', 'PaymentMethod', 'Tags', 'Notes'];
      const rows = txs.map((t) => [
        t.date ? new Date(t.date).toISOString().substring(0, 10) : '',
        `"${t.title.replace(/"/g, '""')}"`,
        t.type,
        `"${t.category}"`,
        t.amount,
        `"${t.paymentMethod}"`,
        `"${t.tags.join(';')}"`,
        `"${(t.notes || '').replace(/"/g, '""')}"`,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `MASTEREXPENSE_Transactions_${new Date().toISOString().substring(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.store.showToast('CSV export downloaded successfully!', 'success');
    }).unsubscribe();
  }
}
