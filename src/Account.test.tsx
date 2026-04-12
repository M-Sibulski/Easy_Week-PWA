import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import Account from "./Account";
import type { Accounts, Settings } from "../types";
import jsonToDB from "./JsonImport";
import type { ImportProgress } from "./JsonImport";

const mockSignOut = vi.fn().mockResolvedValue({});

vi.mock("./JsonImport", () => ({
  default: vi.fn()
}));

vi.mock("./auth/AuthProvider", () => ({
  useAuth: () => ({
    signOut: mockSignOut,
  }),
}));

const mockAccounts: Accounts[] = [
  {
    id: 1,
    syncId: "acc-main",
    name: "Main",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    type: "Everyday"
  },
  {
    id: 2,
    syncId: "acc-savings",
    name: "Savings",
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
    type: "Savings",
    goalDate: new Date("2026-10-07"),
    goalValue: 500
  }
];

const mockSettings: Settings = {
  id: 1,
  syncId: "set-main",
  main_account_id: 1,
  dark: false,
  week_starting_day: 1,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
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

  it("opens the menu and calls jsonToDB on file import", async () => {
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

    const importLabel = await screen.findByText("Import File");
    expect(importLabel).toBeInTheDocument();

    const fileInput = screen.getByLabelText("Import File");
    const file = new File([JSON.stringify([])], "data.json", { type: "application/json" });

    vi.mocked(jsonToDB).mockImplementation(async (_file: File | undefined, _accountId: number, onProgress?: (progress: ImportProgress) => void) => {
      onProgress?.({
        stage: "importing",
        message: "Importing transactions (1/2)...",
        completed: 1,
        total: 2,
      });
    });

    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      expect(jsonToDB).toHaveBeenCalledWith(file, 1, expect.any(Function));
      expect(screen.getByTestId("import-status")).toHaveTextContent("Importing transactions (1/2)...");
      expect(screen.getByTestId("import-status")).toHaveTextContent("1/2");
    });
  });

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

  it("opens settings screen from account menu", async () => {
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
    await userEvent.click(screen.getByText("Settings"));

    expect(await screen.findByTestId("settings-form")).toBeInTheDocument();
  });

  it("signs out from the account menu", async () => {
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
    await userEvent.click(screen.getByText("Sign out"));

    expect(mockSignOut).toHaveBeenCalled();
  });
});
