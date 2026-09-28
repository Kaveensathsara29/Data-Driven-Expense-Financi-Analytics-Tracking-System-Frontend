import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../state/store.service';
import { Category } from '../../core/models/types';

@Component({
    selector: 'app-category-select',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="category-field">
      <div class="category-label-row">
        <label>{{ label }} *</label>
        <button
          type="button"
          class="btn-add-category"
          (click)="showCreateForm = !showCreateForm"
          [attr.aria-expanded]="showCreateForm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>{{ showCreateForm ? 'Close' : 'Add category' }}</span>
        </button>
      </div>

      <ng-container *ngIf="store.categories$ | async as categories">
        <select
          class="form-control"
          [ngModel]="value"
          (ngModelChange)="valueChange.emit($event)"
          [ngModelOptions]="{ standalone: true }"
          [required]="required"
        >
          <option value="" disabled>Select Category</option>
          <option *ngFor="let category of categoriesForType(categories)" [value]="category.name">
            {{ category.name }}
          </option>
        </select>
      </ng-container>

      <div class="category-create-row" *ngIf="showCreateForm">
        <input
          type="text"
          [(ngModel)]="newCategoryName"
          [ngModelOptions]="{ standalone: true }"
          maxlength="40"
          placeholder="New category name"
          class="form-control"
        />
        <button
          type="button"
          class="btn-save-category"
          (click)="addCategory()"
          [disabled]="!newCategoryName.trim() || isCreating"
        >
          {{ isCreating ? 'Adding...' : 'Add' }}
        </button>
      </div>
    </div>
  `,
    styles: [`
    :host { display: block; min-width: 0; }

    .category-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .category-label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .form-control {
      width: 100%;
      min-width: 0;
      padding: 10px 14px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
      font-size: 0.875rem;
      color: var(--text-primary);
      background: #FFFFFF;
    }

    .form-control:focus {
      border-color: var(--primary-600);
      box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.15);
    }

    .btn-add-category {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--primary-600);
      font-size: 0.75rem;
      font-weight: 700;
      white-space: nowrap;
    }

    .category-create-row {
      display: flex;
      gap: 8px;
    }

    .btn-save-category {
      padding: 0 12px;
      border-radius: var(--radius-md);
      background: var(--text-primary);
      color: #FFFFFF;
      font-size: 0.8rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .btn-save-category:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `],
})
export class CategorySelectComponent {
    @Input() value = '';
    @Input() categoryType: Category['type'] = 'EXPENSE';
    @Input() label = 'Category';
    @Input() required = true;
    @Output() valueChange = new EventEmitter<string>();

    readonly store = inject(StoreService);
    showCreateForm = false;
    newCategoryName = '';
    isCreating = false;

    categoriesForType(categories: Category[]): Category[] {
        return categories.filter((category) => category.type === this.categoryType);
    }

    addCategory(): void {
        const name = this.newCategoryName.trim();
        if (!name || this.isCreating) return;

        this.isCreating = true;
        this.store.createCategory({ name, type: this.categoryType }).subscribe((success) => {
            this.isCreating = false;
            if (!success) return;

            this.value = name;
            this.valueChange.emit(name);
            this.newCategoryName = '';
            this.showCreateForm = false;
        });
    }
}