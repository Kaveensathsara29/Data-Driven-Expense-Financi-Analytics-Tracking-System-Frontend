import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, distinctUntilChanged, tap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { GraphQLService } from '../core/services/graphql.service';
import { AuthSessionService } from '../core/services/auth-session.service';
import { PreferencesService, AppPreferences } from '../core/services/preferences.service';
import {
  User,
  Transaction,
  Category,
  Budget,
  Recurring,
  TransactionStats,
  TransactionFilter,
} from '../core/models/types';

export interface Toast {
  text: string;
  type: 'success' | 'error' | 'info';
}

export interface AppState {
  user: User | null;
  token: string | null;
  transactions: Transaction[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  categories: Category[];
  budgets: Budget[];
  recurring: Recurring[];
  stats: TransactionStats | null;
  filter: TransactionFilter;
  isLoading: boolean;
  error: string | null;
  toast: Toast | null;
}

const initialState: AppState = {
  user: null,
  token: null, // Strictly in-memory: auth token is never loaded from localStorage
  transactions: [],
  totalCount: 0,
  totalPages: 1,
  currentPage: 1,
  categories: [],
  budgets: [],
  recurring: [],
  stats: null,
  filter: { type: '', search: '', category: '' },
  isLoading: false,
  error: null,
  toast: null,
};

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  private gql = inject(GraphQLService);
  private router = inject(Router);
  private authSession = inject(AuthSessionService);
  private prefService = inject(PreferencesService);
  private transactionRequestId = 0;

  readonly preferences$ = new BehaviorSubject<AppPreferences>(this.prefService.getPreferences());

  private readonly state$ = new BehaviorSubject<AppState>(initialState);

  // Selectors
  readonly user$: Observable<User | null> = this.state$.pipe(
    map((s) => s.user),
    distinctUntilChanged(),
  );

  readonly isAuthenticated$: Observable<boolean> = this.state$.pipe(
    map((s) => !!s.token),
    distinctUntilChanged(),
  );

  readonly transactions$: Observable<Transaction[]> = this.state$.pipe(
    map((s) => s.transactions),
    distinctUntilChanged(),
  );

  readonly pagination$: Observable<{ totalCount: number; totalPages: number; currentPage: number }> = this.state$.pipe(
    map((s) => ({ totalCount: s.totalCount, totalPages: s.totalPages, currentPage: s.currentPage })),
    distinctUntilChanged((prev, curr) => prev.totalCount === curr.totalCount && prev.currentPage === curr.currentPage),
  );

  readonly categories$: Observable<Category[]> = this.state$.pipe(
    map((s) => s.categories),
    distinctUntilChanged(),
  );

  readonly budgets$: Observable<Budget[]> = this.state$.pipe(
    map((s) => s.budgets),
    distinctUntilChanged(),
  );

  readonly recurring$: Observable<Recurring[]> = this.state$.pipe(
    map((s) => s.recurring),
    distinctUntilChanged(),
  );

  readonly stats$: Observable<TransactionStats | null> = this.state$.pipe(
    map((s) => s.stats),
    distinctUntilChanged(),
  );

  readonly filter$: Observable<TransactionFilter> = this.state$.pipe(
    map((s) => s.filter),
    distinctUntilChanged(),
  );

  readonly isLoading$: Observable<boolean> = this.state$.pipe(
    map((s) => s.isLoading),
    distinctUntilChanged(),
  );

  readonly toast$: Observable<Toast | null> = this.state$.pipe(
    map((s) => s.toast),
    distinctUntilChanged(),
  );

  constructor() {
    // Restore session on refresh (from sessionStorage, strictly NOT from localStorage)
    if (this.authSession.hasToken()) {
      const token = this.authSession.getToken();
      this.patchState({ token });
      this.fetchCurrentUser();
    }

    // Hydrate non-sensitive app preferences from localStorage
    const savedPrefs = this.prefService.getPreferences();
    if (savedPrefs.lastSelectedType) {
      this.patchState({
        filter: { ...initialState.filter, type: savedPrefs.lastSelectedType as any },
      });
    }
  }

  fetchCurrentUser() {
    const query = `
      query GetCurrentUser {
        me {
          id
          name
          email
          currency
          role
          createdAt
        }
      }
    `;

    this.gql.query<{ me: User }>(query).subscribe({
      next: (res) => {
        this.patchState({ user: res.me });
      },
      error: () => {
        this.logout();
      },
    });
  }

  // State Mutator
  private patchState(patch: Partial<AppState>) {
    this.state$.next({
      ...this.state$.getValue(),
      ...patch,
    });
  }

  // User Preferences (saved in localStorage)
  updatePreferences(patch: Partial<AppPreferences>) {
    this.prefService.savePreferences(patch);
    this.preferences$.next(this.prefService.getPreferences());
  }

  // Toast Dispatcher
  showToast(text: string, type: 'success' | 'error' | 'info' = 'success') {
    this.patchState({ toast: { text, type } });
    setTimeout(() => {
      if (this.state$.getValue().toast?.text === text) {
        this.patchState({ toast: null });
      }
    }, 4000);
  }

  clearToast() {
    this.patchState({ toast: null });
  }

  // Actions
  login(email: string, password: string): Observable<boolean> {
    this.patchState({ isLoading: true, error: null });

    const mutation = `
      mutation Login($input: LoginInput!) {
        login(input: $input) {
          accessToken
          user {
            id
            name
            email
            currency
            role
            createdAt
          }
        }
      }
    `;

    return this.gql.mutate<{ login: { accessToken: string; user: User } }>(mutation, {
      input: { email, password },
    }).pipe(
      map((res) => {
        const { accessToken, user } = res.login;
        // In-memory token storage: ZERO localStorage exposure of auth token & login credentials
        this.authSession.setToken(accessToken);

        // Store non-sensitive preferences in localStorage
        this.prefService.savePreferences({
          currency: user.currency || 'USD',
          rememberedEmailHint: user.email,
        });
        this.preferences$.next(this.prefService.getPreferences());

        this.patchState({
          token: accessToken,
          user,
          isLoading: false,
          error: null,
        });
        this.showToast(`Welcome back, ${user.name}!`, 'success');
        this.router.navigate(['/dashboard']);
        return true;
      }),
      catchError((err) => {
        this.patchState({ isLoading: false, error: err.message });
        this.showToast(err.message, 'error');
        return of(false);
      }),
    );
  }

  register(name: string, email: string, password: string, currency = 'USD'): Observable<boolean> {
    this.patchState({ isLoading: true, error: null });

    const mutation = `
      mutation Register($input: RegisterInput!) {
        register(input: $input) {
          accessToken
          user {
            id
            name
            email
            currency
            role
            createdAt
          }
        }
      }
    `;

    return this.gql.mutate<{ register: { accessToken: string; user: User } }>(mutation, {
      input: { name, email, password, currency },
    }).pipe(
      map((res) => {
        const { accessToken, user } = res.register;
        // In-memory token storage: ZERO localStorage exposure of auth token & login credentials
        this.authSession.setToken(accessToken);

        // Store non-sensitive preferences in localStorage
        this.prefService.savePreferences({
          currency: user.currency || 'USD',
          rememberedEmailHint: user.email,
        });
        this.preferences$.next(this.prefService.getPreferences());

        this.patchState({
          token: accessToken,
          user,
          isLoading: false,
          error: null,
        });
        this.showToast('Account created successfully!', 'success');
        this.router.navigate(['/dashboard']);
        return true;
      }),
      catchError((err) => {
        this.patchState({ isLoading: false, error: err.message });
        this.showToast(err.message, 'error');
        return of(false);
      }),
    );
  }

  logout() {
    const isDashboardRoute = this.router.url.split(/[?#]/, 1)[0] === '/dashboard';
    this.authSession.clear();
    this.patchState(initialState);
    if (isDashboardRoute) {
      this.loadDashboard();
    } else {
      this.router.navigate(['/dashboard']);
    }
    this.showToast('Signed out successfully.', 'info');
  }

  loadDashboard() {
    this.patchState({ isLoading: true });

    const query = `
      query GetDashboardData {
        transactionStats {
          totalIncome
          totalExpense
          netBalance
          savingsRate
          monthlyBurnRate
          categoryBreakdown {
            category
            totalAmount
            count
            percentage
          }
          monthlyTrends {
            month
            income
            expense
            netSavings
          }
        }
        categories {
          id
          name
          type
          icon
          color
          isDefault
        }
        budgets {
          id
          category
          monthlyLimit
          currentSpent
          remaining
          percentage
          status
        }
        transactions(pagination: { page: 1, limit: 7 }) {
          items {
            id
            title
            amount
            type
            category
            date
            paymentMethod
            notes
            tags
            isRecurring
            createdAt
          }
          totalCount
        }
      }
    `;

    this.gql.query<{
      transactionStats: TransactionStats;
      categories: Category[];
      budgets: Budget[];
      transactions: { items: Transaction[]; totalCount: number };
    }>(query).subscribe({
      next: (res) => {
        this.patchState({
          stats: res.transactionStats,
          categories: res.categories,
          budgets: res.budgets,
          transactions: res.transactions.items,
          totalCount: res.transactions.totalCount,
          isLoading: false,
        });
      },
      error: (err) => {
        this.patchState({ isLoading: false, error: err.message });
      },
    });
  }

  loadTransactions(filter: TransactionFilter = {}, page = 1, limit = 15) {
    const requestId = ++this.transactionRequestId;
    this.patchState({ isLoading: true, filter: { ...this.state$.getValue().filter, ...filter } });

    const cleanFilter: any = {};
    if (filter.type) cleanFilter.type = filter.type;
    if (filter.category) cleanFilter.category = filter.category;
    if (filter.search) cleanFilter.search = filter.search;
    if (filter.startDate) cleanFilter.startDate = filter.startDate;
    if (filter.endDate) cleanFilter.endDate = filter.endDate;

    const query = `
      query GetTransactions($filter: TransactionFilterInput, $pagination: PaginationInput) {
        transactions(filter: $filter, pagination: $pagination) {
          items {
            id
            title
            amount
            type
            category
            date
            paymentMethod
            notes
            tags
            isRecurring
            createdAt
          }
          totalCount
          totalPages
          currentPage
        }
      }
    `;

    this.gql.query<{
      transactions: { items: Transaction[]; totalCount: number; totalPages: number; currentPage: number };
    }>(query, { filter: cleanFilter, pagination: { page, limit } }).subscribe({
      next: (res) => {
        if (requestId !== this.transactionRequestId) return;
        this.patchState({
          transactions: res.transactions.items,
          totalCount: res.transactions.totalCount,
          totalPages: res.transactions.totalPages,
          currentPage: res.transactions.currentPage,
          isLoading: false,
        });
      },
      error: (err) => {
        if (requestId !== this.transactionRequestId) return;
        this.patchState({ isLoading: false, error: err.message });
        this.showToast(err.message, 'error');
      },
    });
  }

  loadCategories() {
    const query = `
      query GetCategories {
        categories {
          id
          name
          type
          icon
          color
          isDefault
        }
      }
    `;

    this.gql.query<{ categories: Category[] }>(query).subscribe({
      next: (res) => {
        this.patchState({ categories: res.categories });
      },
    });
  }

  loadBudgets() {
    const query = `
      query GetBudgets {
        budgets {
          id
          category
          monthlyLimit
          currentSpent
          remaining
          percentage
          status
        }
        categories {
          id
          name
          type
          icon
          color
          isDefault
        }
      }
    `;

    this.gql.query<{ budgets: Budget[]; categories: Category[] }>(query).subscribe({
      next: (res) => {
        this.patchState({
          budgets: res.budgets,
          categories: res.categories,
        });
      },
    });
  }

  loadRecurring() {
    const query = `
      query GetRecurring {
        recurringTransactions {
          id
          title
          amount
          type
          category
          frequency
          nextDueDate
          paymentMethod
          status
        }
        categories {
          id
          name
          type
        }
      }
    `;

    this.gql.query<{ recurringTransactions: Recurring[]; categories: Category[] }>(query).subscribe({
      next: (res) => {
        this.patchState({
          recurring: res.recurringTransactions,
          categories: res.categories,
        });
      },
    });
  }

  createTransaction(input: {
    title: string;
    amount: number;
    type: string;
    category: string;
    date: string;
    paymentMethod?: string;
    notes?: string;
    tags?: string[];
  }): Observable<boolean> {
    const mutation = `
      mutation CreateTransaction($input: CreateTransactionInput!) {
        createTransaction(input: $input) {
          id
          title
          amount
          type
          category
          date
          paymentMethod
          notes
          tags
          isRecurring
          createdAt
        }
      }
    `;

    return this.gql.mutate<{ createTransaction: Transaction }>(mutation, { input }).pipe(
      map((res) => {
        const newTx = res.createTransaction;
        const currentTxs = this.state$.getValue().transactions;
        this.patchState({
          transactions: [newTx, ...currentTxs],
          totalCount: this.state$.getValue().totalCount + 1,
        });

        // Store frequently used category & tags in localStorage
        this.prefService.updateRecentCategory(newTx.category);
        if (newTx.tags && newTx.tags.length > 0) {
          newTx.tags.forEach((t) => this.prefService.updateRecentTag(t));
        }
        this.preferences$.next(this.prefService.getPreferences());

        this.showToast('Transaction added successfully!', 'success');
        this.loadDashboard();
        return true;
      }),
      catchError((err) => {
        this.showToast(err.message, 'error');
        return of(false);
      }),
    );
  }

  updateTransaction(input: {
    id: string;
    title?: string;
    amount?: number;
    type?: string;
    category?: string;
    date?: string;
    paymentMethod?: string;
    notes?: string;
    tags?: string[];
  }): Observable<boolean> {
    const mutation = `
      mutation UpdateTransaction($input: UpdateTransactionInput!) {
        updateTransaction(input: $input) {
          id
          title
          amount
          type
          category
          date
          paymentMethod
          notes
          tags
          isRecurring
        }
      }
    `;

    return this.gql.mutate<{ updateTransaction: Transaction }>(mutation, { input }).pipe(
      map((res) => {
        const updated = res.updateTransaction;
        const updatedList = this.state$.getValue().transactions.map((t) => (t.id === updated.id ? updated : t));
        this.patchState({ transactions: updatedList });
        this.showToast('Transaction updated!', 'success');
        this.loadDashboard();
        return true;
      }),
      catchError((err) => {
        this.showToast(err.message, 'error');
        return of(false);
      }),
    );
  }

  deleteTransaction(id: string): Observable<boolean> {
    const mutation = `
      mutation DeleteTransaction($id: String!) {
        deleteTransaction(id: $id)
      }
    `;

    return this.gql.mutate<{ deleteTransaction: boolean }>(mutation, { id }).pipe(
      map((res) => {
        if (res.deleteTransaction) {
          const filtered = this.state$.getValue().transactions.filter((t) => t.id !== id);
          this.patchState({
            transactions: filtered,
            totalCount: Math.max(0, this.state$.getValue().totalCount - 1),
          });
          this.showToast('Transaction deleted.', 'info');
          this.loadDashboard();
          return true;
        }
        return false;
      }),
      catchError((err) => {
        this.showToast(err.message, 'error');
        return of(false);
      }),
    );
  }

  setBudget(category: string, monthlyLimit: number): Observable<boolean> {
    const mutation = `
      mutation SetBudget($input: SetBudgetInput!) {
        setBudget(input: $input) {
          id
          category
          monthlyLimit
          currentSpent
          remaining
          percentage
          status
        }
      }
    `;

    return this.gql.mutate<{ setBudget: Budget }>(mutation, { input: { category, monthlyLimit } }).pipe(
      map((res) => {
        this.loadBudgets();
        this.showToast(`Budget for ${category} updated to $${monthlyLimit}`, 'success');
        return true;
      }),
      catchError((err) => {
        this.showToast(err.message, 'error');
        return of(false);
      }),
    );
  }

  deleteBudget(id: string): Observable<boolean> {
    const mutation = `
      mutation DeleteBudget($id: String!) {
        deleteBudget(id: $id)
      }
    `;

    return this.gql.mutate<{ deleteBudget: boolean }>(mutation, { id }).pipe(
      map(() => {
        this.loadBudgets();
        this.showToast('Budget limit removed.', 'info');
        return true;
      }),
      catchError((err) => {
        this.showToast(err.message, 'error');
        return of(false);
      }),
    );
  }

  createRecurring(input: {
    title: string;
    amount: number;
    type: string;
    category: string;
    frequency: string;
    nextDueDate: string;
    paymentMethod: string;
  }): Observable<boolean> {
    const mutation = `
      mutation CreateRecurring($input: CreateRecurringInput!) {
        createRecurringTransaction(input: $input) {
          id
          title
          amount
          type
          category
          frequency
          nextDueDate
          paymentMethod
          status
        }
      }
    `;

    return this.gql.mutate<{ createRecurringTransaction: Recurring }>(mutation, { input }).pipe(
      map(() => {
        this.loadRecurring();
        this.showToast('Recurring subscription created!', 'success');
        return true;
      }),
      catchError((err) => {
        this.showToast(err.message, 'error');
        return of(false);
      }),
    );
  }

  toggleRecurring(id: string): Observable<boolean> {
    const mutation = `
      mutation ToggleRecurring($id: String!) {
        toggleRecurringStatus(id: $id) {
          id
          status
        }
      }
    `;

    return this.gql.mutate<{ toggleRecurringStatus: Recurring }>(mutation, { id }).pipe(
      map(() => {
        this.loadRecurring();
        return true;
      }),
      catchError((err) => {
        this.showToast(err.message, 'error');
        return of(false);
      }),
    );
  }

  deleteRecurring(id: string): Observable<boolean> {
    const mutation = `
      mutation DeleteRecurring($id: String!) {
        deleteRecurringTransaction(id: $id)
      }
    `;

    return this.gql.mutate<{ deleteRecurringTransaction: boolean }>(mutation, { id }).pipe(
      map(() => {
        this.loadRecurring();
        this.showToast('Subscription deleted.', 'info');
        return true;
      }),
      catchError((err) => {
        this.showToast(err.message, 'error');
        return of(false);
      }),
    );
  }

  createCategory(input: { name: string; type: string; icon?: string; color?: string }): Observable<boolean> {
    const mutation = `
      mutation CreateCategory($input: CreateCategoryInput!) {
        createCategory(input: $input) {
          id
          name
          type
          icon
          color
          isDefault
        }
      }
    `;

    return this.gql.mutate<{ createCategory: Category }>(mutation, { input }).pipe(
      map((res) => {
        const cat = res.createCategory;
        this.patchState({
          categories: [...this.state$.getValue().categories, cat],
        });
        this.showToast(`Category "${cat.name}" added!`, 'success');
        return true;
      }),
      catchError((err) => {
        this.showToast(err.message, 'error');
        return of(false);
      }),
    );
  }
}
