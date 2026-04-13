import { describe, it, expect, vi, beforeEach } from 'vitest';
import jsonToDB from './JsonImport';
import { repository } from './repository';
import type { Transactions } from '../types';

vi.mock('./repository', () => {
  return {
    repository: {
      getAccounts: vi.fn(),
      addAccount: vi.fn(),
      getAllTransactions: vi.fn(),
      addTransaction: vi.fn(),
      getCategorySuggestionsByTokens: vi.fn(),
      addCategorySuggestion: vi.fn(),
      putCategorySuggestion: vi.fn(),
    }
  };
});

describe('jsonToDB', () => {
  const mockConfirm = vi.fn();
  const mockAlert = vi.fn();
  const createMockFile = (contents: string) => ({
    text: vi.fn().mockResolvedValue(contents),
  } as unknown as File);

  const sampleData: Transactions[] = [
    {
      id: 1,
      syncId: 'txn-salary',
      name: 'Salary',
      value: 1000,
      date: new Date('2024-01-01'),
      category: 'Work',
      type: 'Income',
      account_id: 1,
      account_sync_id: 'acc-main',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ];

  

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('confirm', mockConfirm);
    vi.stubGlobal('alert', mockAlert);
    vi.mocked(repository.getAccounts).mockResolvedValue([
      {
        id: 1,
        syncId: 'acc-main',
        name: 'Main Account',
        type: 'Everyday',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ]);
    vi.mocked(repository.getCategorySuggestionsByTokens).mockResolvedValue([]);
  });

  it('should parse a valid JSON file and insert transactions into the DB', async () => {
    const mockFile = {
        text: vi.fn().mockResolvedValue(JSON.stringify([
            {
            value: 100,
            type: "Income",
            name: "Test Transaction",
            date: new Date().toISOString(),
            }
        ]))
        } as unknown as File;

    mockConfirm.mockReturnValue(true);
    vi.mocked(repository.getAllTransactions).mockResolvedValue([]);

    await jsonToDB(mockFile, 1);

    expect(repository.addTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Test Transaction', type: "Income", value: 100 })
    );
  });

  it('should alert for invalid JSON', async () => {
    const file = createMockFile('invalid-json');
    await jsonToDB(file, 1);

    expect(mockAlert).toHaveBeenCalledWith('Invalid JSON or CSV file.');
  });

  it('should alert if JSON is not an array', async () => {
    const file = createMockFile('{"name": "test"}');
    await jsonToDB(file, 1);

    expect(mockAlert).toHaveBeenCalledWith('Invalid JSON or CSV file.');
  });

  it('should do nothing if file is undefined', async () => {
    await jsonToDB(undefined, 1);
    expect(repository.addTransaction).not.toHaveBeenCalled();
  });

  it('should not insert if user does not confirm', async () => {
    const json = JSON.stringify([{ ...sampleData[0], date: sampleData[0].date.toISOString() }]);
    const file = createMockFile(json);

    mockConfirm.mockReturnValue(false);

    await jsonToDB(file, 1);
    expect(repository.addTransaction).not.toHaveBeenCalled();
  });

  it('should import supported bank CSV format', async () => {
    const csv =
      'Date,Amount,Payee,Particulars,Code,Reference,Tran Type,This Party Account,Other Party Account,Serial,Transaction Code,Batch Number,Originating Bank/Branch,Processed Date\n' +
      '24/03/24,-98.38,WOOLWORTHS NZ/MOORHO,1967,MOORHOUSE,408964241249,POS,02-0820-0660426-00,---,,"00",4310,"02-0499",24/03/24';
    const file = createMockFile(csv);

    mockConfirm.mockReturnValue(true);
    vi.mocked(repository.getAllTransactions).mockResolvedValue([]);

    await jsonToDB(file, 1);

    expect(repository.addTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'WOOLWORTHS NZ/MOORHO',
        value: -98.38,
        type: 'Expense',
        account_id: 1,
        category: 'POS',
      })
    );
  });

  it('should import FT rows as transfers from the current account', async () => {
    const csv =
      'Date,Amount,Payee,Particulars,Code,Reference,Tran Type,This Party Account,Other Party Account,Serial,Transaction Code,Batch Number,Originating Bank/Branch,Processed Date\n' +
      '24/03/24,-50.00,Savings Account,,,123,FT,02-0820-0660426-00,---,,,4310,02-0499,24/03/24';
    const file = createMockFile(csv);

    mockConfirm.mockReturnValue(true);
    vi.mocked(repository.getAllTransactions).mockResolvedValue([]);
    vi.mocked(repository.addAccount).mockResolvedValue(2);

    await jsonToDB(file, 1);

    expect(repository.addAccount).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Savings Account',
        type: 'Everyday',
      })
    );
    expect(repository.addTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Transfer',
        type: 'Transfer',
        value: -50,
        account_id: 1,
        to_account_id: 2,
      })
    );
  });

  it('should import positive FT rows as transfers into the current account', async () => {
    const csv =
      'Date,Amount,Payee,Particulars,Code,Reference,Tran Type,This Party Account,Other Party Account,Serial,Transaction Code,Batch Number,Originating Bank/Branch,Processed Date\n' +
      '24/03/24,50.00,Savings Account,,,123,FT,02-0820-0660426-00,---,,,4310,02-0499,24/03/24';
    const file = createMockFile(csv);

    mockConfirm.mockReturnValue(true);
    vi.mocked(repository.getAllTransactions).mockResolvedValue([]);
    vi.mocked(repository.getAccounts).mockResolvedValue([
      {
        id: 1,
        syncId: 'acc-main',
        name: 'Main Account',
        type: 'Everyday',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 2,
        syncId: 'acc-savings',
        name: 'Savings Account',
        type: 'Everyday',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ]);

    await jsonToDB(file, 1);

    expect(repository.addAccount).not.toHaveBeenCalled();
    expect(repository.addTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Transfer',
        type: 'Transfer',
        value: -50,
        account_id: 2,
        to_account_id: 1,
      })
    );
  });


  it('should import both rows when a file contains 2 identical transactions not in the DB', async () => {
    const row = { value: 50, type: 'Expense', name: 'Coffee', date: new Date('2024-03-01').toISOString(), category: 'Food' };
    const file = createMockFile(JSON.stringify([row, row]));

    mockConfirm.mockReturnValue(true);
    vi.mocked(repository.getAllTransactions).mockResolvedValue([]);

    await jsonToDB(file, 1);

    expect(repository.addTransaction).toHaveBeenCalledTimes(2);
  });

  it('should skip duplicate non-transfer transactions that already exist', async () => {
    const file = createMockFile(JSON.stringify([
      {
        value: 100,
        type: 'Income',
        name: 'Test Transaction',
        date: new Date('2024-01-01').toISOString(),
        category: 'Salary',
      },
    ]));

    mockConfirm.mockReturnValue(true);
    vi.mocked(repository.getAllTransactions).mockResolvedValue([
      {
        id: 10,
        syncId: 'txn-existing-income',
        value: 100,
        type: 'Income',
        name: 'Test Transaction',
        date: new Date('2024-01-01'),
        category: 'Salary',
        account_id: 1,
        account_sync_id: 'acc-main',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ]);

    await jsonToDB(file, 1);

    expect(repository.addTransaction).not.toHaveBeenCalled();
  });

  it('should skip mirrored transfer imports that already exist in another account', async () => {
    const csv =
      'Date,Amount,Payee,Particulars,Code,Reference,Tran Type,This Party Account,Other Party Account,Serial,Transaction Code,Batch Number,Originating Bank/Branch,Processed Date\n' +
      '07/03/26,-1700.00,Moto,,,INTERNET XFR,FT,02-0820-0660426-01,02-0820-0660426-05,,"00",0000,"02-1255",07/03/26';
    const file = createMockFile(csv);

    mockConfirm.mockReturnValue(true);
    vi.mocked(repository.getAccounts).mockResolvedValue([
      {
        id: 1,
        syncId: 'acc-moto',
        name: 'Moto',
        type: 'Everyday',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 2,
        syncId: 'acc-bills',
        name: 'Bills',
        type: 'Everyday',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ]);
    vi.mocked(repository.getAllTransactions).mockResolvedValue([
      {
        id: 12,
        syncId: 'txn-existing-transfer',
        name: 'Transfer',
        type: 'Transfer',
        value: -1700,
        date: new Date(2026, 2, 7),
        account_id: 2,
        account_sync_id: 'acc-bills',
        to_account_id: 1,
        to_account_sync_id: 'acc-moto',
        category: 'FT',
        createdAt: new Date(2026, 2, 7),
        updatedAt: new Date(2026, 2, 7),
      },
    ]);

    await jsonToDB(file, 2);

    expect(repository.addTransaction).not.toHaveBeenCalled();
  });

  it('fills a missing category only when the confidence score is high', async () => {
    const file = createMockFile(JSON.stringify([
      {
        value: -18,
        type: 'Expense',
        name: 'Uber Ride',
        date: new Date('2024-01-01').toISOString(),
      },
    ]));

    mockConfirm.mockReturnValue(true);
    vi.mocked(repository.getAllTransactions).mockResolvedValue([]);
    vi.mocked(repository.getCategorySuggestionsByTokens).mockResolvedValue([
      {
        id: 1,
        syncId: 'cat-1',
        token: 'uber',
        category: 'Transport',
        score: 2,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ]);

    await jsonToDB(file, 1);

    expect(repository.addTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Uber Ride',
        category: 'Transport',
      })
    );
  });

  it('learns from imported rows that already include a category', async () => {
    const file = createMockFile(JSON.stringify([
      {
        value: -22,
        type: 'Expense',
        name: 'Uber Eats',
        date: new Date('2024-01-01').toISOString(),
        category: 'Food',
      },
    ]));

    mockConfirm.mockReturnValue(true);
    vi.mocked(repository.getAllTransactions).mockResolvedValue([]);

    await jsonToDB(file, 1);

    expect(repository.addCategorySuggestion).toHaveBeenCalledWith(expect.objectContaining({
      token: 'uber',
      category: 'Food',
      score: 1,
    }));
    expect(repository.addCategorySuggestion).toHaveBeenCalledWith(expect.objectContaining({
      token: 'eats',
      category: 'Food',
      score: 1,
    }));
  });

});
