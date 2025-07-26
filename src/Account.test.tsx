import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Account from "./Account";
import type { Accounts, Settings } from "../types";

vi.mock("./JsonImport", () => ({
  default: vi.fn()
}));

const mockAccounts: Accounts[] = [
  {
    id: 1,
    name: "Main",
    dateCreated: new Date("2024-01-01"),
    type: "Everyday"
  },
  {
    id: 2,
    name: "Savings",
    dateCreated: new Date("2024-02-01"),
    type: "Savings",
    goalDate: new Date("2026-10-07"),
    goalValue: 500
  }
];

const mockSettings: Settings = {
  id: 1,
  main_account_id: 1,
  dark: false
};

describe("Account component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders account select and total", () => {
    render(
      <Account
        accountId={1}
        total={300}
        accounts={mockAccounts}
        changeAccount={vi.fn()}
        settings={mockSettings}
      />
    );
    waitFor(() => {
    expect(screen.getByTestId("account")).toBeInTheDocument();
    expect(screen.getByTestId("total")).toHaveTextContent("$300.00");
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Main")).toBeInTheDocument();
    })
  });

  it("shows goal value and date if available", () => {
    render(
      <Account
        accountId={2}
        total={500}
        accounts={mockAccounts}
        changeAccount={vi.fn()}
        settings={mockSettings}
      />
    );
    waitFor(() => expect(screen.getByText(/Goal: \$500 by/)).toBeInTheDocument())
    
  });

  /* it("opens the menu and calls jsonToDB on file import", async () => {
    render(
      <Account
        accountId={1}
        total={0}
        accounts={mockAccounts}
        changeAccount={vi.fn()}
        settings={mockSettings}
      />
    );

    await userEvent.click(screen.getByRole("close"));

    const importLabel = await screen.findByText("Import JSON");
    expect(importLabel).toBeInTheDocument();

    const fileInput = screen.getByLabelText("Import JSON");
    // const file = new File([JSON.stringify([])], "data.json", { type: "application/json" });
    const file = {
        text: vi.fn().mockResolvedValue(JSON.stringify([
            {
            value: 100,
            type: "Income",
            name: "Test Transaction",
            date: new Date().toISOString(),
            }
        ]))
        } as unknown as File;

    fireEvent.change(fileInput, {
      target: { files: [file] }
    });

    waitFor(() => {
      expect(jsonToDB).toHaveBeenCalledWith(file, 1);
    });
  }); */

  it("displays 'Create Account' if no accounts are passed", () => {
    render(
      <Account
        accountId={1}
        total={0}
        accounts={[]}
        changeAccount={vi.fn()}
        settings={mockSettings}
      />
    );
    waitFor(() => expect(screen.getByText("Create Account")).toBeInTheDocument())
  });
});
