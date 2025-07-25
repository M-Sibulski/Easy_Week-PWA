import CreateTransaction from "./CreateTransaction";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {describe, it, expect, vi} from "vitest";
import "@testing-library/jest-dom/vitest";
import { Accounts, db } from "../db";
import { transactionTypes } from "../types";

vi.mock('../db', async () => {
  const actual = await vi.importActual<typeof import('../db')>('../db');

  return {
    ...actual,
    db: {
      transactions: {
        add: vi.fn()
      }
    }
  };
});

const fakeAccounts: Accounts[] = [
  {
    id: 1,
    name: 'Main',
    dateCreated: new Date('2024-01-01'),
    type: 'Everyday',
  },
  {
    id: 15,
    name: 'Savings',
    dateCreated: new Date('2024-10-07'),
    type: 'Savings',
    goalDate: new Date('2026-10-07'),
    goalValue: 500,
  },
]


describe("CreateTransaction", () => {
    
    
    it("renders", () => {
        render(<CreateTransaction accountId={1} accounts={fakeAccounts}/>);
        expect(screen.getByRole("open")).toBeInTheDocument();
    });

    it("renders Name input", async () => {
        render(<CreateTransaction accountId={1} accounts={fakeAccounts}/>);
        const addButton = screen.getByRole('open');
        await userEvent.click(addButton);
        const nameInput = screen.getByPlaceholderText("Name (Generic Transaction)");
        expect(nameInput).toBeInTheDocument();
    });

    it('shows form when clicking the add button', async () => {
        render(<CreateTransaction accountId={1} accounts={fakeAccounts}/>);
        const addButton = screen.getByRole('open');
        await userEvent.click(addButton);
        expect(screen.getByText(/New Transaction/i)).toBeInTheDocument();
    });

    it('clears form when clicking the clear button', async () => {
        render(<CreateTransaction accountId={1} accounts={fakeAccounts}/>);
        await userEvent.click(screen.getByRole('open'));

        await userEvent.type(screen.getByPlaceholderText(/Name/i), 'Test Name');
        await userEvent.click(screen.getByRole('clear'));

        expect(screen.getByPlaceholderText(/Name/i)).toHaveValue('');
    });

    it('submits a transaction with correct data', async () => {
        const addMock = db.transactions.add as ReturnType<typeof vi.fn>;
        render(<CreateTransaction accountId={1} accounts={fakeAccounts}/>);
        await userEvent.click(screen.getByRole('open'));

        await userEvent.type(screen.getByPlaceholderText(/Name/i), 'Lunch');
        await userEvent.selectOptions(screen.getByRole('combobox'), 'Expense');
        await userEvent.type(screen.getByPlaceholderText(/\$ 0\.00/), '15.5');
        await userEvent.type(screen.getByPlaceholderText(/Category/i), 'Food');

        const saveButton = screen.getByRole('submit');
        await userEvent.click(saveButton);

        expect(addMock).toHaveBeenCalledTimes(1);
        const saved = addMock.mock.calls[0][0];
        expect(saved.name).toBe('Lunch');
        expect(saved.value).toBeCloseTo(-15.5);
        expect(saved.type).toBe('Expense');
        expect(saved.category).toBe('Food');
    });

    it('strips non-numeric characters from value input', async () => {
        render(<CreateTransaction accountId={1} accounts={fakeAccounts} />);
        await userEvent.click(screen.getByRole('open'));
        const valueInput = screen.getByPlaceholderText(/\$ 0\.00/);
        await userEvent.type(valueInput, 'a$bc123.45d;~ef');
        expect(valueInput).toHaveValue('$ 123.45');
    });

    it('allows changing the date input', async () => {
        render(<CreateTransaction accountId={1} accounts={fakeAccounts} />);
        await userEvent.click(screen.getByRole('open'));
        const dateInput = screen.getByTestId('date-input');
        fireEvent.change(dateInput, { target: { value: '2025-07-20' } });
        expect(dateInput).toHaveValue('2025-07-20');
    });

    it('closes form on background click', async () => {
        render(<CreateTransaction accountId={1} accounts={fakeAccounts} />);
        await userEvent.click(screen.getByRole('open'));
        // const overlay = screen.getByRole('background');
        const form = screen.getByTestId("transaction-form");
        expect(form).toBeInTheDocument();
        await userEvent.click(document.body);
        expect(screen.queryByRole('form')).not.toBeInTheDocument();
        waitFor(() => {
            expect(screen.getByRole('open')).toBeInTheDocument();
        })
        
    });

    it('closes form on close button', async () => {
        render(<CreateTransaction accountId={1} accounts={fakeAccounts} />);
        await userEvent.click(screen.getByRole('open'));
        const close = screen.getByRole('close');
        const form = screen.getByTestId("transaction-form");
        expect(form).toBeInTheDocument();
        await userEvent.click(close);
        expect(screen.queryByRole('form')).not.toBeInTheDocument();
    });

    it('not allow different types', async () => {
        render(<CreateTransaction accountId={1} accounts={fakeAccounts}/>)
        await userEvent.click(screen.getByRole('open'));
        const typeInput = screen.getByRole('combobox');
        const options = Array.from(typeInput.querySelectorAll('option')).map(opt => opt.value);
        expect(options).toEqual(transactionTypes);
    })
})