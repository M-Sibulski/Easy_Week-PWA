export type TransactionType = "Income" | "Expense" | "Transfer" | "Bills";

export const transactionTypes: TransactionType[] = ['Income', 'Expense', 'Transfer', 'Bills'];

export type AccountType = "Everyday" | "Savings";

export const accountTypes: AccountType[] = ['Everyday', 'Savings'];

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