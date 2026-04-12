import { render, screen, waitFor } from "@testing-library/react";
import {describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { Accounts, Settings, Transactions } from "../types";
import Mainscreen from "./Mainscreen";

const { mockUseAccounts, mockUseTransactions, mockUseSettingsArray, mockRepository } = vi.hoisted(() => ({
  mockUseAccounts: vi.fn(),
  mockUseTransactions: vi.fn(),
  mockUseSettingsArray: vi.fn(),
  mockRepository: {
    clearAccounts: vi.fn(),
    clearTransactions: vi.fn(),
    clearCategorySuggestions: vi.fn(),
    clearSettings: vi.fn(),
    putAccount: vi.fn(),
    putSettings: vi.fn(),
    updateSettings: vi.fn(),
  },
}));

const mockTransactions: Transactions[] = [
  { id: 1, syncId: 'txn-salary', name: 'Salary', value: 1000, date: new Date('2024-01-01'), category: 'Work', type: 'Income', account_id: 1, account_sync_id: 'acc-main', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
  { id: 2, syncId: 'txn-groceries', name: 'Groceries', value: -200, date: new Date('2024-01-01'), category: 'Food', type: 'Expense', account_id: 1, account_sync_id: 'acc-main', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
  { id: 3, syncId: 'txn-book', name: 'Book', value: -50, date: new Date('2024-01-02'), category: 'Education', type: 'Expense', account_id: 1, account_sync_id: 'acc-main', createdAt: new Date('2024-01-02'), updatedAt: new Date('2024-01-02') }
];

const mockAccounts: Accounts[] = [
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
];

const mockSettings: Settings[] = [{
  id: 1,
  syncId: 'set-main',
  main_account_id: 1,
  dark: false,
  week_starting_day: 1,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}]

vi.mock('./auth/useAuth', () => ({
  useAuth: () => ({
    loading: false,
    user: { id: 'user-1' },
  }),
}));

vi.mock('./repository', () => ({
  repository: mockRepository,
}));

vi.mock('./hooks/useAppData', () => ({
  useAccounts: () => mockUseAccounts(),
  useTransactions: () => mockUseTransactions(),
  useSettingsArray: () => mockUseSettingsArray(),
}));

describe("Mainscreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTransactions.mockReturnValue(mockTransactions);
    mockUseSettingsArray.mockReturnValue(mockSettings);
    mockUseAccounts.mockReturnValue(mockAccounts);
  });

  it("renders the current account summary and add button", async () => {
    render(<Mainscreen />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Main")).toBeInTheDocument();
      expect(screen.getByTestId("total")).toHaveTextContent("$750.00");
      expect(screen.getByRole("open")).toBeInTheDocument();
    });
  });

  it("renders nothing if all useLiveQuery return undefined", async () => {
    mockUseTransactions.mockReturnValue(undefined);
    mockUseSettingsArray.mockReturnValue(undefined);
    mockUseAccounts.mockReturnValue(undefined);
    render(<Mainscreen />);
    await waitFor(() => {
      expect(screen.queryByText("Salary")).not.toBeInTheDocument();
    });
  });

  it("sets accountId to settings.main_account_id on load", async () => {
    render(<Mainscreen />);
    await waitFor(() => {
      expect(screen.getByDisplayValue("Main")).toBeInTheDocument();
    });
  });

  it("renders CreateTransaction and Account components", async () => {
    render(<Mainscreen />);
    await waitFor(() => {
      expect(screen.getByText("Main")).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });

  it("handles missing current account by switching to main or lowest id", async () => {
    const brokenAccounts = [{ id: 2, syncId: 'acc-spare', name: "Spare", createdAt: new Date(), updatedAt: new Date(), type: "Everyday" }];
    mockUseAccounts.mockReturnValue(brokenAccounts);

    render(<Mainscreen />);
    await waitFor(() => {
      expect(screen.queryByText("Salary")).not.toBeInTheDocument();
      expect(mockRepository.updateSettings).toHaveBeenCalledWith(1, { main_account_id: 2, main_account_sync_id: 'acc-spare' });
    });
  });

  it("creates initial settings when settings are empty", async () => {
    mockUseSettingsArray.mockReturnValue([]);

    render(<Mainscreen />);
    await waitFor(() => {
      expect(mockRepository.clearAccounts).toHaveBeenCalled();
      expect(mockRepository.clearTransactions).toHaveBeenCalled();
      expect(mockRepository.clearCategorySuggestions).toHaveBeenCalled();
      expect(mockRepository.clearSettings).toHaveBeenCalled();
      expect(mockRepository.putAccount).toHaveBeenCalled();
      expect(mockRepository.putSettings).toHaveBeenCalled();
    });
  });

  it("updates main_account_id when it's 0", async () => {
    const zeroSettings: Settings[] = [{ id: 1, syncId: 'set-zero', main_account_id: 0, dark: true, week_starting_day: 1, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') }];

    mockUseSettingsArray.mockReturnValue(zeroSettings);

    render(<Mainscreen />);
    await waitFor(() => {
      expect(mockRepository.updateSettings).toHaveBeenCalledWith(1, { main_account_id: 1, main_account_sync_id: 'acc-main' });
    });
  });

  it("switches to lowest ID account if current and main account are deleted", async () => {
    const badAccounts: Accounts[] = [{ id: 99, syncId: 'acc-only-one', name: "Only One", type: "Everyday", createdAt: new Date(), updatedAt: new Date() }];
    const badSettings: Settings[] = [{ id: 1, syncId: 'set-bad', main_account_id: 1, dark: false, week_starting_day: 1, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') }];

    mockUseSettingsArray.mockReturnValue(badSettings);
    mockUseAccounts.mockReturnValue(badAccounts);

    render(<Mainscreen />);
    await waitFor(() => {
      expect(mockRepository.updateSettings).toHaveBeenCalledWith(1, { main_account_id: 99, main_account_sync_id: 'acc-only-one' });
    });
  });
});