import Dexie, { EntityTable } from 'dexie';
import { Accounts, Transactions, Settings } from './types';

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

export const db = new AppDatabase();