export type TransactionType = "Income" | "Expense" | "Transfer";

export const transactionTypes: TransactionType[] = ['Income', 'Expense', 'Transfer'];

export type AccountType = "Everyday" | "Savings";

export const accountTypes: AccountType[] = ['Everyday', 'Savings'];

export interface Accounts {
    id: number,
    name: string,
    type: AccountType,
    goalValue?: number,
    goalDate?: Date,
    dateCreated: Date
}

export interface Transactions {
    id: number,
    value: number,
    type: TransactionType,
    name: string,
    account_id: number,
    date: Date,
    category?: string
    to_account_id?: number,
}

export interface Settings {
    id: number,
    dark: boolean,
    main_account_id: number,
}