import { render, screen } from "@testing-library/react";
import {describe, it, expect, vi, beforeEach } from "vitest";
import type { MockInstance } from "vitest";
import "@testing-library/jest-dom/vitest";
import * as dexieHooks from 'dexie-react-hooks';
import { Transactions } from "../db";
import Mainscreen from "./Mainscreen";

const transactions: Transactions[] = [
  { id: 1, name: 'Salary', value: 1000, date: new Date('2024-01-01'), category: 'Work', type: 'Income', account_id: 1 },
  { id: 2, name: 'Groceries', value: -200, date: new Date('2024-01-01'), category: 'Food', type: 'Expense', account_id: 1 },
  { id: 3, name: 'Book', value: -50, date: new Date('2024-01-02'), category: 'Education', type: 'Expense', account_id: 1 }
];

vi.mock('dexie-react-hooks', async () => {
  const actual = await vi.importActual<typeof import('dexie-react-hooks')>('dexie-react-hooks');
  return {
    ...actual,
    useLiveQuery: vi.fn()
  };
});

describe("Mainscreen", () => {
    beforeEach(() => {
      ((dexieHooks.useLiveQuery as unknown) as MockInstance).mockReturnValue(transactions);
    });

    it('renders one Day per unique transaction date with correct transactions', () => {
      render(<Mainscreen />);

      const dayElements = screen.getAllByTestId('day');
      expect(dayElements.length).toBe(2);

      expect(screen.getByText('Salary')).toBeInTheDocument();
      expect(screen.getByText('Groceries')).toBeInTheDocument();
      expect(screen.getByText('Book')).toBeInTheDocument();

      // Check order or totals if needed (depends on Day implementation)
    });

    it('renders all unique days', () => {
    render(<Mainscreen />);
    
    // Your Day component likely renders the date in some way
    // You can use a pattern or mock the component
    expect(screen.getAllByText('2024-01-01')).toHaveLength(1);
    expect(screen.getByText('2024-01-02')).toBeInTheDocument();
  });

  it('renders no days if useLiveQuery returns undefined', () => {
    ((dexieHooks.useLiveQuery as unknown) as MockInstance).mockReturnValue(undefined);

    render(<Mainscreen />);

    // Should render nothing
    expect(screen.queryByText('Salary')).not.toBeInTheDocument();
    expect(screen.queryByText('2024-01-01')).not.toBeInTheDocument();
  });

})