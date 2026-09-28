export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
  avatarUrl?: string;
  role: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  date: string;
  paymentMethod: string;
  notes?: string;
  tags: string[];
  isRecurring: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface Budget {
  id: string;
  category: string;
  monthlyLimit: number;
  currentSpent: number;
  remaining: number;
  percentage: number;
  status: 'HEALTHY' | 'WARNING' | 'EXCEEDED';
}

export interface Recurring {
  id: string;
  title: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  frequency: 'MONTHLY' | 'YEARLY' | 'WEEKLY';
  nextDueDate: string;
  paymentMethod: string;
  status: 'ACTIVE' | 'PAUSED';
}

export interface CategorySpendBreakdown {
  category: string;
  totalAmount: number;
  count: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
  netSavings: number;
}

export interface TransactionStats {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number;
  monthlyBurnRate: number;
  categoryBreakdown: CategorySpendBreakdown[];
  monthlyTrends: MonthlyTrend[];
}

export interface PaginatedTransactions {
  items: Transaction[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface TransactionFilter {
  search?: string;
  type?: 'INCOME' | 'EXPENSE' | '';
  category?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
}
