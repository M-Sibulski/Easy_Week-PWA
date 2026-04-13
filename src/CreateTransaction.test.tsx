import CreateTransaction from "./CreateTransaction";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {beforeEach, describe, it, expect, vi} from "vitest";
import "@testing-library/jest-dom/vitest";
import { db } from "../db";
import { transactionTypes, Accounts } from "../types";
import { dateToInputType } from "./dateConversions";

vi.mock('../db', async () => {
  const actual = await vi.importActual<typeof import('../db')>('../db');

  return {
    ...actual,
    db: {
      transactions: {
        add: vi.fn()
      },
      categorySuggestions: {
        where: vi.fn(),
        add: vi.fn(),
        put: vi.fn(),
      }
    }
  };
});

const fakeAccounts: Accounts[] = [
  {
    id: 1,
    syncId: 'acc-main',
    name: 'Main',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    type: 'Everyday',
  },
  {
    id: 15,
    syncId: 'acc-savings',
    name: 'Savings',
    createdAt: new Date('2024-10-07'),
    updatedAt: new Date('2024-10-07'),
    type: 'Savings',
    goalDate: new Date('2026-10-07'),
    goalValue: 500,
  },
]


describe("CreateTransaction", () => {
    const categorySuggestions = [
      {
        id: 1,
        syncId: 'cat-uber-transport',
        token: 'uber',
        category: 'Transport',
        score: 2,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ];

    const mockCategorySuggestionQuery = (results = categorySuggestions) => {
        const toArray = vi.fn().mockResolvedValue(results);
        const anyOf = vi.fn().mockReturnValue({ toArray });
        (db.categorySuggestions.where as ReturnType<typeof vi.fn>).mockReturnValue({ anyOf });
        return { anyOf, toArray };
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockCategorySuggestionQuery([]);
        (db.categorySuggestions.add as ReturnType<typeof vi.fn>).mockResolvedValue(1);
        (db.categorySuggestions.put as ReturnType<typeof vi.fn>).mockResolvedValue(1);
    });
    
    
    it("renders", () => {
        render(<CreateTransaction accountId={1} accounts={fakeAccounts} renderOpenButton={true}/>);
        expect(screen.getByRole("open")).toBeInTheDocument();
    });

    it("renders Name input", async () => {
        render(<CreateTransaction accountId={1} accounts={fakeAccounts} renderOpenButton={true}/>);
        const addButton = screen.getByRole('open');
        await userEvent.click(addButton);
        const nameInput = screen.getByPlaceholderText("Name (Generic Transaction)");
        expect(nameInput).toBeInTheDocument();
    });

    it('shows form when clicking the add button', async () => {
        render(<CreateTransaction accountId={1} accounts={fakeAccounts} renderOpenButton={true}/>);
        const addButton = screen.getByRole('open');
        await userEvent.click(addButton);
        expect(screen.getByText(/New Transaction/i)).toBeInTheDocument();
    });

    it('focuses the name input when opening the form', async () => {
        render(<CreateTransaction accountId={1} accounts={fakeAccounts} renderOpenButton={true}/>);

        await userEvent.click(screen.getByRole('open'));

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/Name/i)).toHaveFocus();
        });
    });

    it('clears form when clicking the clear button', async () => {
        render(<CreateTransaction accountId={1} accounts={fakeAccounts} renderOpenButton={true}/>);
        await userEvent.click(screen.getByRole('open'));

        await userEvent.type(screen.getByPlaceholderText(/Name/i), 'Test Name');
        await userEvent.click(screen.getByRole('clear'));

        expect(screen.getByPlaceholderText(/Name/i)).toHaveValue('');
    });

    it('submits a transaction with correct data', async () => {
        const addMock = db.transactions.add as ReturnType<typeof vi.fn>;
        render(<CreateTransaction accountId={1} accounts={fakeAccounts} renderOpenButton={true}/>);
        await userEvent.click(screen.getByRole('open'));

        await userEvent.type(screen.getByPlaceholderText(/Name/i), 'Lunch');
        await userEvent.selectOptions(screen.getByRole('combobox'), 'Expense');
        await userEvent.type(screen.getByPlaceholderText(/\$ 0\.00/), '15.5');
        fireEvent.change(screen.getByTestId('date-input'), { target: { value: '2025-07-20' } });
        await userEvent.type(screen.getByPlaceholderText(/Category/i), 'Food');

        const saveButton = screen.getByRole('submit');
        await userEvent.click(saveButton);

        expect(addMock).toHaveBeenCalledTimes(1);
        const saved = addMock.mock.calls[0][0];
        expect(saved.name).toBe('Lunch');
        expect(saved.value).toBeCloseTo(-15.5);
        expect(saved.type).toBe('Expense');
        expect(saved.category).toBe('Food');
        expect(dateToInputType(saved.date)).toBe('2025-07-20');
    });

    it('focuses the name input again after submitting and clearing the form', async () => {
        render(<CreateTransaction accountId={1} accounts={fakeAccounts} renderOpenButton={true}/>);

        await userEvent.click(screen.getByRole('open'));
        await userEvent.type(screen.getByPlaceholderText(/Name/i), 'Refocus Test');
        await userEvent.type(screen.getByPlaceholderText(/\$ 0\.00/), '8');
        await userEvent.type(screen.getByPlaceholderText(/Category/i), 'Food');

        await userEvent.click(screen.getByRole('submit'));

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/Name/i)).toHaveValue('');
            expect(screen.getByPlaceholderText(/Name/i)).toHaveFocus();
        });
    });

    it('strips non-numeric characters from value input', async () => {
        render(<CreateTransaction accountId={1} accounts={fakeAccounts} renderOpenButton={true}/>);
        await userEvent.click(screen.getByRole('open'));
        const valueInput = screen.getByPlaceholderText(/\$ 0\.00/);
        await userEvent.type(valueInput, 'a$bc123.45d;~ef');
        expect(valueInput).toHaveValue('$ 123.45');
    });

    it('allows changing the date input', async () => {
        render(<CreateTransaction accountId={1} accounts={fakeAccounts} renderOpenButton={true}/>);
        await userEvent.click(screen.getByRole('open'));
        const dateInput = screen.getByTestId('date-input');
        fireEvent.change(dateInput, { target: { value: '2025-07-20' } });
        expect(dateInput).toHaveValue('2025-07-20');
    });

    it('closes form on background click', async () => {
        render(<CreateTransaction accountId={1} accounts={fakeAccounts} renderOpenButton={true}/>);
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
        render(<CreateTransaction accountId={1} accounts={fakeAccounts} renderOpenButton={true}/>);
        await userEvent.click(screen.getByRole('open'));
        const close = screen.getByRole('close');
        const form = screen.getByTestId("transaction-form");
        expect(form).toBeInTheDocument();
        await userEvent.click(close);
        expect(screen.queryByRole('form')).not.toBeInTheDocument();
    });

    it('not allow different types', async () => {
        render(<CreateTransaction accountId={1} accounts={fakeAccounts} renderOpenButton={true}/>)
        await userEvent.click(screen.getByRole('open'));
        const typeInput = screen.getByRole('combobox');
        const options = Array.from(typeInput.querySelectorAll('option')).map(opt => opt.value);
        expect(options).toEqual(transactionTypes);
    })

    it('prefills category when a confident suggestion exists', async () => {
        mockCategorySuggestionQuery();
        render(<CreateTransaction accountId={1} accounts={fakeAccounts} renderOpenButton={true}/>);

        await userEvent.click(screen.getByRole('open'));
        await userEvent.type(screen.getByPlaceholderText(/Name/i), 'Uber Ride');

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/Category/i)).toHaveValue('Transport');
        });
    });

    it('learns manual categories when submitting a transaction', async () => {
        mockCategorySuggestionQuery([]);
        const addCategorySuggestion = db.categorySuggestions.add as ReturnType<typeof vi.fn>;
        render(<CreateTransaction accountId={1} accounts={fakeAccounts} renderOpenButton={true}/>);

        await userEvent.click(screen.getByRole('open'));
        await userEvent.type(screen.getByPlaceholderText(/Name/i), 'Uber Eats');
        await userEvent.type(screen.getByPlaceholderText(/\$ 0\.00/), '18');
        await userEvent.type(screen.getByPlaceholderText(/Category/i), 'Transport');
        await userEvent.click(screen.getByRole('submit'));

        expect(addCategorySuggestion).toHaveBeenCalledTimes(3);
        expect(addCategorySuggestion).toHaveBeenCalledWith(expect.objectContaining({
            token: '__exact_name__:uber eats',
            category: 'Transport',
            score: 1,
        }));
        expect(addCategorySuggestion).toHaveBeenCalledWith(expect.objectContaining({
            token: 'uber',
            category: 'Transport',
            score: 1,
        }));
        expect(addCategorySuggestion).toHaveBeenCalledWith(expect.objectContaining({
            token: 'eats',
            category: 'Transport',
            score: 1,
        }));
    });

    it('does not clear the form when the selected account cannot be resolved', async () => {
        render(<CreateTransaction accountId={0} accounts={fakeAccounts} renderOpenButton={true}/>);

        await userEvent.click(screen.getByRole('open'));
        await userEvent.type(screen.getByPlaceholderText(/Name/i), 'Broken Save');
        await userEvent.type(screen.getByPlaceholderText(/\$ 0\.00/), '10');
        await userEvent.type(screen.getByPlaceholderText(/Category/i), 'Food');
        await userEvent.click(screen.getByRole('submit'));

        expect(db.transactions.add).not.toHaveBeenCalled();
        expect(screen.getByPlaceholderText(/Name/i)).toHaveValue('Broken Save');
        expect(screen.getByPlaceholderText(/\$ 0\.00/)).toHaveValue('$ 10');
        expect(screen.getByPlaceholderText(/Category/i)).toHaveValue('Food');
    });

    it('moves focus to the next field when pressing Enter before the category field', async () => {
        render(<CreateTransaction accountId={1} accounts={fakeAccounts} renderOpenButton={true}/>);

        await userEvent.click(screen.getByRole('open'));

        const nameInput = screen.getByPlaceholderText(/Name/i);
        const typeSelect = screen.getByRole('combobox');
        const valueInput = screen.getByPlaceholderText(/\$ 0\.00/);
        const dateInput = screen.getByTestId('date-input');
        const categoryInput = screen.getByPlaceholderText(/Category/i);

        nameInput.focus();
        await userEvent.keyboard('{Enter}');
        expect(typeSelect).toHaveFocus();

        await userEvent.keyboard('{Enter}');
        expect(valueInput).toHaveFocus();

        await userEvent.keyboard('{Enter}');
        expect(dateInput).toHaveFocus();

        await userEvent.keyboard('{Enter}');
        expect(categoryInput).toHaveFocus();
    });

    it('submits the form when pressing Enter on the category field', async () => {
        const addMock = db.transactions.add as ReturnType<typeof vi.fn>;
        render(<CreateTransaction accountId={1} accounts={fakeAccounts} renderOpenButton={true}/>);

        await userEvent.click(screen.getByRole('open'));
        await userEvent.type(screen.getByPlaceholderText(/Name/i), 'Keyboard Submit');
        await userEvent.type(screen.getByPlaceholderText(/\$ 0\.00/), '12');
        const categoryInput = screen.getByPlaceholderText(/Category/i);
        await userEvent.type(categoryInput, 'Food');

        categoryInput.focus();
        await userEvent.keyboard('{Enter}');

        expect(addMock).toHaveBeenCalledTimes(1);
        expect(addMock.mock.calls[0][0]).toEqual(expect.objectContaining({
            name: 'Keyboard Submit',
            category: 'Food',
        }));
    });
})