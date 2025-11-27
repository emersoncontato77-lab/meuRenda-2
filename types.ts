export enum TransactionType {
  SALE = 'SALE',
  EXPENSE = 'EXPENSE',
  INVESTMENT = 'INVESTMENT'
}

export interface Transaction {
  id?: string;
  userId: string;
  type: TransactionType;
  description: string; // Name of product, expense, or investment
  amount: number; // Sale value or Expense/Investment cost
  cost?: number; // Cost of product (only for SALE)
  date: number; // Timestamp
  createdAt: number;
}

export interface Goal {
  id?: string;
  userId: string;
  type: 'MONTHLY' | 'WEEKLY' | 'CUSTOM';
  targetAmount: number;
  deadline?: number; // Timestamp
  workDays?: number; // For custom calc
  useAutoMargin: boolean;
  manualMargin?: number;
  createdAt: number;
}

export type Tab = 'HOME' | 'GOALS' | 'REPORTS' | 'SETTINGS';

export interface UserStats {
  revenue: number;
  profit: number;
  expenses: number;
  investments: number;
  margin: number; // Percentage 0-100
}