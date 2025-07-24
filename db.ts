import Dexie, { EntityTable } from 'dexie';

type TransactionType = "Income" | "Expense" | "Transfer";

export const transactionTypes: TransactionType[] = ['Income', 'Expense', 'Transfer'];

type AccountType = "Everyday" | "Savings";

export const accountTypes: AccountType[] = ['Everyday', 'Savings'];

interface Accounts {
    id: number,
    name: string,
    type: AccountType,
    goalValue?: number,
    goalDate?: Date,
    dateCreated: Date
}

interface Transactions {
    id: number,
    value: number,
    type: TransactionType,
    name: string,
    account_id: number,
    date: Date,
    category?: string
    to_account_id?: number,
}

interface Settings {
    id: number,
    dark: boolean,
    main_account_id: number,
}

class AppDatabase extends Dexie {
  accounts!: EntityTable<Accounts, 'id'>; // 'id' is the primary key property
  transactions!: EntityTable<Transactions, 'id'>;
  settings!: EntityTable<Settings, 'id'>;

  constructor() {
    super('easyWeekDatabase');
    this.version(1).stores({
        accounts: '++id, type, goalValue, goalDate, main, dateCreated',
        transactions: '++id, value, type, name, account_id, date, category',
        settings: '++id, dark, last_account_id',
    });
  }
}

export type { Accounts, Transactions, TransactionType, AccountType, Settings };
export const db = new AppDatabase();