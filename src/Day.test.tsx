import { render, screen } from "@testing-library/react";
import {describe, it, expect} from "vitest";
import "@testing-library/jest-dom/vitest";
import { Transactions } from "../db";
import Day from "./Day";

const fakeTransactions: Transactions[] = [
  {
  id: 1,
  value: -50,
  name: 'Groceries',
  date: new Date('2024-01-01'),
  category: 'Food',
  type: 'Expense',
  account_id: 1
},
  {
  id: 2,
  value: 200,
  name: 'Wage1',
  date: new Date('2024-01-01'),
  category: 'Wages',
  type: 'Income',
  account_id: 1
},
]

const fakeTotal = 150;
const fakeDate = '2024-01-01';

describe("Day", () => {
    it("Create array of transactions", () => {
        render(<Day transactions={fakeTransactions} total={fakeTotal} date={fakeDate}/>);
        // expect(screen.getByTestId("transaction")).toBeVisible();
        expect(screen.getByText('2024-01-01')).toBeInTheDocument();
        expect(screen.getByText('Groceries')).toBeInTheDocument();
        expect(screen.getByText('Food')).toBeInTheDocument();
        expect(screen.getByText('- $50')).toBeInTheDocument();
        expect(screen.getByText('Wage1')).toBeInTheDocument();
        expect(screen.getByText('Wages')).toBeInTheDocument();
        expect(screen.getByText('$200')).toBeInTheDocument();
    });

    it("displays total", () => {
      render(<Day transactions={fakeTransactions} total={fakeTotal} date={fakeDate}/>);
      expect(screen.getByTestId('total').innerHTML).toEqual("$150")
    })
})