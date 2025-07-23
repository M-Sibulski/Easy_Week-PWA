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
    main: boolean
}

interface Transactions {
    id: number,
    value: number,
    type: TransactionType,
    name: string,
    account_id: number,
    date: Date,
    category?: string
}

class AppDatabase extends Dexie {
  accounts!: EntityTable<Accounts, 'id'>; // 'id' is the primary key property
  transactions!: EntityTable<Transactions, 'id'>;

  constructor() {
    super('easyWeekDatabase');
    this.version(1).stores({
        accounts: '++id, type, goalValue, goalDate, main',
        transactions: '++id, value, type, name, account_id, date, category'
    });
  }
}

// const db = new Dexie('easyWeekDatabase') as Dexie & {
//     account: EntityTable<Accounts, 'id'>, transaction: EntityTable<Transactions, 'id'>
// };

// db.version(1).stores({
//     account: '++id, type, goal',
//     transaction: '++id, value, type, name, account_id, date, category'
// });

export type { Accounts, Transactions, TransactionType };
// export { db };
export const db = new AppDatabase();