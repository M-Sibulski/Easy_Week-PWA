import { db } from "../db";
import { Transactions } from "../types";

type TransactionInsert = Omit<Transactions, "id">;
type RawTransaction = Record<string, unknown>;
type ImportStage = "reading" | "parsing" | "preparing" | "replacing" | "importing" | "complete" | "cancelled" | "error";

export interface ImportProgress {
    stage: ImportStage;
    message: string;
    completed?: number;
    total?: number;
}

type ImportProgressCallback = (progress: ImportProgress) => void;
interface ImportContext {
    accountId: number;
    accountsByName: Map<string, number>;
}

const normalizeAccountName = (value: string) => value.trim().toLowerCase();
const normalizeText = (value?: string) => (value ?? "").trim().toLowerCase();
const formatDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
};
const reportProgress = (callback: ImportProgressCallback | undefined, progress: ImportProgress) => {
    callback?.(progress);
};

const parseCsvLine = (line: string): string[] => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
                continue;
            }
            inQuotes = !inQuotes;
            continue;
        }

        if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = "";
            continue;
        }

        current += char;
    }

    values.push(current.trim());
    return values;
};

const csvToObjects = (csv: string): RawTransaction[] => {
    const lines = csv
        .trim()
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    if (lines.length < 2) {
        throw new Error("CSV file must include headers and at least one row.");
    }

    const headers = parseCsvLine(lines[0]);
    if (headers.length < 2) {
        throw new Error("Invalid CSV headers.");
    }

    return lines.slice(1).map((line) => {
        const values = parseCsvLine(line);
        const row: RawTransaction = {};

        headers.forEach((header, index) => {
            row[header] = (values[index] ?? "").replace(/\r/g, "").trim();
        });

        return row;
    });
};

const parseDateValue = (raw: unknown): Date | null => {
    if (raw instanceof Date) {
        return Number.isNaN(raw.getTime()) ? null : raw;
    }

    if (typeof raw !== "string") {
        return null;
    }

    const value = raw.trim();
    if (!value) {
        return null;
    }

    const slashDate = value.match(/^(\d{2})\/(\d{2})\/(\d{2}|\d{4})$/);
    if (slashDate) {
        const day = Number(slashDate[1]);
        const month = Number(slashDate[2]) - 1;
        let year = Number(slashDate[3]);
        if (year < 100) {
            year += 2000;
        }
        const parsedDate = new Date(year, month, day);
        return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
    }

    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const parseNumberValue = (raw: unknown): number | null => {
    if (typeof raw === "number" && Number.isFinite(raw)) {
        return raw;
    }

    if (typeof raw !== "string") {
        return null;
    }

    const normalized = raw.replace(/[$,\s]/g, "").trim();
    if (!normalized) {
        return null;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
};

const parseTypeValue = (raw: unknown, value: number): Transactions["type"] => {
    if (raw === "FT") {
        return "Transfer";
    }

    if (raw === "Income" || raw === "Expense" || raw === "Transfer" || raw === "Bills") {
        return raw;
    }

    return value < 0 ? "Expense" : "Income";
};

const createImportContext = async (accountId: number): Promise<ImportContext> => {
    const accounts = await db.accounts.toArray();
    const accountsByName = new Map<string, number>();

    accounts.forEach((account) => {
        accountsByName.set(normalizeAccountName(account.name), account.id);
    });

    return { accountId, accountsByName };
};

const resolveTransferAccountId = async (
    accountName: string,
    context: ImportContext,
    onProgress?: ImportProgressCallback,
): Promise<number> => {
    const normalizedName = normalizeAccountName(accountName);
    const existingAccountId = context.accountsByName.get(normalizedName);

    if (existingAccountId !== undefined) {
        return existingAccountId;
    }

    reportProgress(onProgress, {
        stage: "preparing",
        message: `Creating account ${accountName}...`,
    });

    const accountId = await db.accounts.add({
        name: accountName,
        type: "Everyday",
        dateCreated: new Date(),
    });

    context.accountsByName.set(normalizedName, accountId);
    return accountId;
};

const parseTransactionRow = async (
    transaction: RawTransaction,
    context: ImportContext,
    onProgress?: ImportProgressCallback,
): Promise<TransactionInsert | null> => {
    const value = parseNumberValue(transaction.value ?? transaction.Amount);
    const date = parseDateValue(transaction.date ?? transaction.Date ?? transaction["Processed Date"]);

    if (value === null || date === null) {
        return null;
    }

    const payee = typeof transaction.Payee === "string" ? transaction.Payee.trim() : "";
    const particulars = typeof transaction.Particulars === "string" ? transaction.Particulars.trim() : "";
    const rawName = typeof transaction.name === "string" ? transaction.name.trim() : "";
    const parsedType = parseTypeValue(transaction.type ?? transaction["Tran Type"], value);
    const name = parsedType === "Transfer" ? "Transfer" : rawName || payee || particulars || "Imported Transaction";

    const category =
        typeof transaction.category === "string"
            ? transaction.category
            : typeof transaction["Tran Type"] === "string"
            ? transaction["Tran Type"]
            : typeof transaction.Code === "string"
            ? transaction.Code
            : undefined;

    const toAccountId = parseNumberValue(transaction.to_account_id);

    if (parsedType === "Transfer") {
        const otherAccountName = payee || particulars;
        if (!otherAccountName) {
            return null;
        }

        const otherAccountId = await resolveTransferAccountId(otherAccountName, context, onProgress);
        const transferValue = -Math.abs(value);

        if (value < 0) {
            return {
                value: transferValue,
                type: "Transfer",
                name,
                account_id: context.accountId,
                date,
                category,
                to_account_id: otherAccountId,
            };
        }

        return {
            value: transferValue,
            type: "Transfer",
            name,
            account_id: otherAccountId,
            date,
            category,
            to_account_id: context.accountId,
        };
    }

    return {
        value,
        type: parsedType,
        name,
        account_id: context.accountId,
        date,
        category,
        to_account_id: toAccountId === null ? undefined : toAccountId,
    };
};

const textToRows = (text: string): RawTransaction[] => {
    const trimmedText = text.replace(/^\uFEFF/, "").trim();
    if (!trimmedText) {
        throw new Error("File is empty.");
    }

    if (trimmedText.startsWith("[") || trimmedText.startsWith("{")) {
        const parsed = JSON.parse(trimmedText);
        if (!Array.isArray(parsed)) {
            throw new Error("JSON file must contain an array.");
        }
        return parsed as RawTransaction[];
    }

    return csvToObjects(trimmedText);
};

const buildTransactionSignature = (transaction: TransactionInsert | Transactions) => {
    const dateKey = formatDateKey(transaction.date);

    if (transaction.type === "Transfer") {
        return [
            transaction.type,
            dateKey,
            Math.abs(transaction.value).toFixed(2),
            transaction.account_id,
            transaction.to_account_id ?? "",
        ].join("|");
    }

    return [
        transaction.type,
        dateKey,
        transaction.value.toFixed(2),
        transaction.account_id,
        normalizeText(transaction.name),
        normalizeText(transaction.category),
    ].join("|");
};

const transactionsBulkAdd = async (
    transactions: TransactionInsert[],
    onProgress?: ImportProgressCallback,
) => {
    const answer = confirm("This will import new transactions and skip duplicates. Confirm?");
    if (!answer) {
        reportProgress(onProgress, {
            stage: "cancelled",
            message: "Import cancelled.",
        });
        return;
    }

    const existingTransactions = await db.transactions.toArray();
    const skipBudget = new Map<string, number>();
    for (const t of existingTransactions) {
        const sig = buildTransactionSignature(t);
        skipBudget.set(sig, (skipBudget.get(sig) ?? 0) + 1);
    }
    let addedCount = 0;
    let skippedCount = 0;

    try {
        for (let index = 0; index < transactions.length; index++) {
            const transaction = transactions[index];
            const signature = buildTransactionSignature(transaction);

            reportProgress(onProgress, {
                stage: "importing",
                message: `Importing transactions (${index + 1}/${transactions.length})...`,
                completed: index + 1,
                total: transactions.length,
            });

            const remaining = skipBudget.get(signature) ?? 0;
            if (remaining > 0) {
                skipBudget.set(signature, remaining - 1);
                skippedCount++;
                continue;
            }

            await db.transactions.add(transaction);
            addedCount++;
        }

        reportProgress(onProgress, {
            stage: "complete",
            message: `Import complete. ${addedCount} added, ${skippedCount} skipped as duplicates.`,
            completed: transactions.length,
            total: transactions.length,
        });
    } catch (error) {
        reportProgress(onProgress, {
            stage: "error",
            message: "Import failed while saving transactions.",
        });
        console.error(error);
    }
};

const jsonToDB = async (file: File | undefined, accountId: number, onProgress?: ImportProgressCallback) => {
    if (!file) return;

    try {
        reportProgress(onProgress, {
            stage: "reading",
            message: "Reading import file...",
        });
        const text = await file.text();
        reportProgress(onProgress, {
            stage: "parsing",
            message: "Parsing import data...",
        });
        const rows = textToRows(text);
        const context = await createImportContext(accountId);
        const transactions: TransactionInsert[] = [];

        for (let index = 0; index < rows.length; index++) {
            reportProgress(onProgress, {
                stage: "preparing",
                message: `Preparing transactions (${index + 1}/${rows.length})...`,
                completed: index + 1,
                total: rows.length,
            });
            const parsedTransaction = await parseTransactionRow(rows[index], context, onProgress);
            if (parsedTransaction !== null) {
                transactions.push(parsedTransaction);
            }
        }

        if (transactions.length === 0) {
            throw new Error("No valid transactions found in file.");
        }

        await transactionsBulkAdd(transactions, onProgress);
    } catch (error) {
        reportProgress(onProgress, {
            stage: "error",
            message: "Invalid JSON or CSV file.",
        });
        alert("Invalid JSON or CSV file.");
        console.error(error);
    }
};

export default jsonToDB;