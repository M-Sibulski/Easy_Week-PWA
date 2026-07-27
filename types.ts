export type TransactionType = 'Income' | 'Expense' | 'Transfer' | 'Bills';

export const transactionTypes: TransactionType[] = ['Income', 'Expense', 'Transfer', 'Bills'];

export type AccountType = 'Everyday' | 'Savings';

export const accountTypes: AccountType[] = ['Everyday', 'Savings'];

export type BucketType = 'income' | 'fixed_expense' | 'variable_expense' | 'savings';
export type SnapshotStatus = 'draft' | 'locked';

export const bucketTypes: BucketType[] = ['income', 'fixed_expense', 'variable_expense', 'savings'];
export const snapshotStatuses: SnapshotStatus[] = ['draft', 'locked'];

export interface Accounts {
  id: number,
  syncId: string,
  name: string,
  type: AccountType,
  goalValue?: number,
  goalDate?: Date,
  createdAt: Date,
  updatedAt: Date,
  deletedAt?: Date,
}

export interface Transactions {
  id: number,
  syncId: string,
  value: number,
  type: TransactionType,
  name: string,
  account_id: number,
  account_sync_id: string,
  date: Date,
  category?: string,
  to_account_id?: number,
  to_account_sync_id?: string,
  createdAt: Date,
  updatedAt: Date,
  deletedAt?: Date,
}

export interface CategorySuggestion {
  id: number,
  syncId: string,
  token: string,
  category: string,
  score: number,
  createdAt: Date,
  updatedAt: Date,
  deletedAt?: Date,
}

export interface Settings {
  id: number,
  syncId: string,
  dark: boolean,
  main_account_id: number,
  main_account_sync_id?: string,
  week_starting_day: number,
  createdAt: Date,
  updatedAt: Date,
  deletedAt?: Date,
}

export interface StandardWeekTemplate {
  id: number;
  syncId: string;
  account_id: number;
  account_sync_id: string;
  week_starting_day_snapshot: number;
  name: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface StandardWeekTemplateItem {
  id: number;
  syncId: string;
  template_id: number;
  category: string;
  bucket_type: BucketType;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface WeeklyPlanSnapshot {
  id: number;
  syncId: string;
  account_id: number;
  account_sync_id: string;
  template_id: number | null;
  week_start: Date;
  week_end: Date;
  status: SnapshotStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface WeeklyPlanSnapshotItem {
  id: number;
  syncId: string;
  weekly_plan_id: number;
  category: string;
  bucket_type: BucketType;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
