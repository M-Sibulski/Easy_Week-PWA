import Transaction from "./Transaction";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {describe, it, expect, vi} from "vitest";
import "@testing-library/jest-dom/vitest";
import { db, Transactions } from "../db";

vi.mock('../db', () => ({
  db: {
    transactions: {
      put: vi.fn(),
      delete: vi.fn()
    }
  }
}));

const fakeTransaction: Transactions = {
  id: 1,
  value: -50,
  name: 'Groceries',
  date: new Date('2024-01-01'),
  category: 'Food',
  type: 'Expense',
  account_id: 1
};

describe("Transaction", () => {
    it("renders", () => {
        render(<Transaction transaction={fakeTransaction}/>);
        expect(screen.getByTestId("transaction")).toBeVisible();
        expect(screen.getByText('Groceries')).toBeInTheDocument();
        expect(screen.getByText('Food')).toBeInTheDocument();
        expect(screen.getByText('- $50')).toBeInTheDocument();
    });

    it("opens/closes edit mode", async () => {
        render(<Transaction transaction={fakeTransaction}/>);
        const transaction = screen.getByTestId("transaction");
        const background = screen.getByTestId("background");
        const closeButton = screen.getByTestId("close");
        await userEvent.click(transaction);
        expect(screen.getByTestId("edit-transaction")).toBeVisible();
        await userEvent.click(background);
        expect(screen.getByTestId("edit-transaction")).not.toBeVisible();
        await userEvent.click(transaction);
        expect(screen.getByTestId("edit-transaction")).toBeVisible();
        await userEvent.click(closeButton);
        expect(screen.getByTestId("edit-transaction")).not.toBeVisible();
    });

    it("submit inputs on edit mode", async () => {
        const addMock = db.transactions.put as ReturnType<typeof vi.fn>;
        render(<Transaction transaction={fakeTransaction}/>);
        const transaction = screen.getByTestId("transaction");
        const submit = screen.getByTestId("submit");
        await userEvent.click(transaction);
        expect(screen.getByTestId("edit-transaction")).toBeVisible();
        await userEvent.clear(screen.getByTestId("name"));
        await userEvent.type(screen.getByTestId("name"), 'test');
        await userEvent.selectOptions(screen.getByTestId("type"), 'Income');
        await userEvent.clear(screen.getByTestId("value"));
        await userEvent.type(screen.getByTestId("value"), '15.5');
        await userEvent.clear(screen.getByTestId("category"));
        await userEvent.type(screen.getByTestId("category"), 'Salary');
        await userEvent.click(submit);
        expect(screen.getByTestId("edit-transaction")).not.toBeVisible();
        expect(db.transactions.put).toHaveBeenCalledTimes(1);
        const saved = addMock.mock.calls[0][0];
        expect(saved.name).toBe('test');
        expect(saved.value).toBeCloseTo(15.5);
        expect(saved.type).toBe('Income');
        expect(saved.category).toBe('Salary');
    });

    it("deletes transaction", async () => {
        render(<Transaction transaction={fakeTransaction}/>);
        const transaction = screen.getByTestId("transaction");
        const deleteBtn = screen.getByTestId("delete");
        await userEvent.click(transaction);
        expect(screen.getByTestId("edit-transaction")).toBeVisible();
        await userEvent.click(deleteBtn);
        expect(db.transactions.delete).toHaveBeenCalledWith(fakeTransaction.id);
        waitFor(() => expect(screen.getByTestId("edit-transaction")).not.toBeInTheDocument())
    });

})