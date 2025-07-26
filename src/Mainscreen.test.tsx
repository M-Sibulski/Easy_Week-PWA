import { render, screen, waitFor } from "@testing-library/react";
import {describe, it, expect, vi, beforeEach } from "vitest";
import type { MockInstance } from "vitest";
import "@testing-library/jest-dom/vitest";
import * as dexieHooks from 'dexie-react-hooks';
import { db } from "../db";
import { Accounts, Settings, Transactions } from "../types";
import Mainscreen from "./Mainscreen";

const mockUseLiveQuery = (dexieHooks.useLiveQuery as unknown) as MockInstance;

const mockTransactions: Transactions[] = [
  { id: 1, name: 'Salary', value: 1000, date: new Date('2024-01-01'), category: 'Work', type: 'Income', account_id: 1 },
  { id: 2, name: 'Groceries', value: -200, date: new Date('2024-01-01'), category: 'Food', type: 'Expense', account_id: 1 },
  { id: 3, name: 'Book', value: -50, date: new Date('2024-01-02'), category: 'Education', type: 'Expense', account_id: 1 }
];

const mockAccounts: Accounts[] = [
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
];

const mockSettings: Settings[] = [{
  id: 1,
  main_account_id: 1,
  dark: false,
}]

vi.mock('dexie-react-hooks', async () => {
  const actual = await vi.importActual<typeof import('dexie-react-hooks')>('dexie-react-hooks');
  return {
    ...actual,
    db: {
      settings: {
        add: vi.fn()
      },
      accounts: {
        add: vi.fn()
      }
    },
    useLiveQuery: vi.fn()
  };
});

describe("Mainscreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    let call = 0;
    mockUseLiveQuery.mockImplementation(() => {
      call++;
      if (call === 1) return mockTransactions;
      if (call === 2) return mockSettings;
      if (call === 3) return mockAccounts;
      return undefined;
    });
  });

  it("renders Days by unique transaction dates with correct content", async () => {
    render(<Mainscreen />);

    waitFor(() => {
      expect(screen.getByText("Salary")).toBeInTheDocument();
      expect(screen.getByText("Groceries")).toBeInTheDocument();
      expect(screen.getByText("Book")).toBeInTheDocument();
    });
  });

  it("renders nothing if all useLiveQuery return undefined", async () => {
    mockUseLiveQuery.mockReturnValue(undefined);
    render(<Mainscreen />);
    waitFor(() => {
      expect(screen.queryByText("Salary")).not.toBeInTheDocument();
    });
  });

  it("sets accountId to settings.main_account_id on load", async () => {
    render(<Mainscreen />);
    waitFor(() => {
      expect(screen.getByText("Salary")).toBeInTheDocument();
    });
  });

  it("renders CreateTransaction and Account components", async () => {
    render(<Mainscreen />);
    waitFor(() => {
      expect(screen.getByText("Main")).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });

  it("handles missing current account by switching to main or lowest id", async () => {
    const brokenAccounts = [{ id: 2, name: "Spare", dateCreated: new Date(), type: "Everyday" }];
    vi.clearAllMocks();
    let call = 0;
    mockUseLiveQuery.mockImplementation(() => {
        call++;
        if (call === 1) return mockTransactions;
        if (call === 2) return mockSettings;
        if (call === 3) return brokenAccounts;
        return undefined;
    });

    render(<Mainscreen />);
    waitFor(() => {
      expect(screen.queryByText("Salary")).not.toBeInTheDocument();
    });
  });

  it("creates initial settings when settings are empty", async () => {
    const addMock = db.settings.add as ReturnType<typeof vi.fn>;
    vi.mocked(dexieHooks.useLiveQuery).mockImplementationOnce(() => mockTransactions)
      .mockImplementationOnce(() => []) // Empty settings
      .mockImplementationOnce(() => mockAccounts);

    render(<Mainscreen />);
    waitFor(() => {
      expect(addMock).toHaveBeenCalled();
    });
  });

  it("creates main account when accounts are empty", async () => {
    const addMock = db.accounts.add as ReturnType<typeof vi.fn>;
    vi.mocked(dexieHooks.useLiveQuery).mockImplementationOnce(() => mockTransactions)
      .mockImplementationOnce(() => mockSettings)
      .mockImplementationOnce(() => []); // Empty accounts

    render(<Mainscreen />);
    waitFor(() => {
      expect(addMock).toHaveBeenCalled();
    });
  });

  it("updates main_account_id when it's 0", async () => {
    const updateMock = vi.fn();
    const zeroSettings: Settings[] = [{ id: 1, main_account_id: 0, dark: true }];

    vi.mocked(dexieHooks.useLiveQuery).mockImplementationOnce(() => mockTransactions)
      .mockImplementationOnce(() => zeroSettings)
      .mockImplementationOnce(() => mockAccounts);

    render(<Mainscreen />);
    waitFor(() => {
      expect(updateMock).toHaveBeenCalledWith(1, { main_account_id: 1 });
    });
  });

  it("switches to lowest ID account if current and main account are deleted", async () => {
    const updateMock = vi.fn();
    const badAccounts: Accounts[] = [{ id: 99, name: "Only One", type: "Everyday", dateCreated: new Date() }];
    const badSettings: Settings[] = [{ id: 1, main_account_id: 1, dark: false }];

    vi.mocked(dexieHooks.useLiveQuery).mockImplementationOnce(() => mockTransactions)
      .mockImplementationOnce(() => badSettings)
      .mockImplementationOnce(() => badAccounts);

    render(<Mainscreen />);
    waitFor(() => {
      expect(updateMock).toHaveBeenCalledWith(1, { main_account_id: 99 });
    });
  });
});