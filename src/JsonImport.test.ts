import { describe, it, expect, vi, beforeEach } from 'vitest';
import jsonToDB from './JsonImport';
import { db } from '../db';
import type { Transactions } from '../types';

vi.mock('../db', () => {
  return {
    db: {
      accounts: {
        toArray: vi.fn(),
        add: vi.fn(),
      },
      transactions: {
        where: vi.fn().mockReturnThis(),
        equals: vi.fn().mockReturnThis(),
        toArray: vi.fn(),
        delete: vi.fn(),
        add: vi.fn()
      }
    }
  };
});

describe('jsonToDB', () => {
  const mockConfirm = vi.fn();
  const mockAlert = vi.fn();

  const sampleData: Transactions[] = [
    {
      id: 1,
      name: 'Salary',
      value: 1000,
      date: new Date('2024-01-01'),
      category: 'Work',
      type: 'Income',
      account_id: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ];

  

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('confirm', mockConfirm);
    vi.stubGlobal('alert', mockAlert);
    vi.mocked(db.accounts.toArray).mockResolvedValue([
      {
        id: 1,
        name: 'Main Account',
        type: 'Everyday',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ]);
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
    vi.mocked(db.transactions.toArray).mockResolvedValue([]);

    await jsonToDB(mockFile, 1);

    expect(db.transactions.add).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Test Transaction', type: "Income", value: 100 })
    );
  });

  it('should alert for invalid JSON', async () => {
    const file = new File(['invalid-json'], 'data.json', { type: 'application/json' });
    await jsonToDB(file, 1);

    expect(mockAlert).toHaveBeenCalledWith('Invalid JSON or CSV file.');
  });

  it('should alert if JSON is not an array', async () => {
    const file = new File(['{"name": "test"}'], 'data.json', { type: 'application/json' });
    await jsonToDB(file, 1);

    expect(mockAlert).toHaveBeenCalledWith('Invalid JSON or CSV file.');
  });

  it('should do nothing if file is undefined', async () => {
    await jsonToDB(undefined, 1);
    expect(db.transactions.add).not.toHaveBeenCalled();
  });

  it('should not insert if user does not confirm', async () => {
    const json = JSON.stringify([{ ...sampleData[0], date: sampleData[0].date.toISOString() }]);
    const file = new File([json], 'data.json', { type: 'application/json' });

    mockConfirm.mockReturnValue(false);

    await jsonToDB(file, 1);
    expect(db.transactions.add).not.toHaveBeenCalled();
  });

  it('should import supported bank CSV format', async () => {
    const csv =
      'Date,Amount,Payee,Particulars,Code,Reference,Tran Type,This Party Account,Other Party Account,Serial,Transaction Code,Batch Number,Originating Bank/Branch,Processed Date\n' +
      '24/03/24,-98.38,WOOLWORTHS NZ/MOORHO,1967,MOORHOUSE,408964241249,POS,02-0820-0660426-00,---,,"00",4310,"02-0499",24/03/24';
    const file = new File([csv], 'bank.csv', { type: 'text/csv' });

    mockConfirm.mockReturnValue(true);
    vi.mocked(db.transactions.toArray).mockResolvedValue([]);

    await jsonToDB(file, 1);

    expect(db.transactions.add).toHaveBeenCalledWith(
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
    const file = new File([csv], 'transfer-out.csv', { type: 'text/csv' });

    mockConfirm.mockReturnValue(true);
    vi.mocked(db.transactions.toArray).mockResolvedValue([]);
    vi.mocked(db.accounts.add).mockResolvedValue(2);

    await jsonToDB(file, 1);

    expect(db.accounts.add).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Savings Account',
        type: 'Everyday',
      })
    );
    expect(db.transactions.add).toHaveBeenCalledWith(
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
    const file = new File([csv], 'transfer-in.csv', { type: 'text/csv' });

    mockConfirm.mockReturnValue(true);
    vi.mocked(db.transactions.toArray).mockResolvedValue([]);
    vi.mocked(db.accounts.toArray).mockResolvedValue([
      {
        id: 1,
        name: 'Main Account',
        type: 'Everyday',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 2,
        name: 'Savings Account',
        type: 'Everyday',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ]);

    await jsonToDB(file, 1);

    expect(db.accounts.add).not.toHaveBeenCalled();
    expect(db.transactions.add).toHaveBeenCalledWith(
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
    const file = new File([JSON.stringify([row, row])], 'data.json', { type: 'application/json' });

    mockConfirm.mockReturnValue(true);
    vi.mocked(db.transactions.toArray).mockResolvedValue([]);

    await jsonToDB(file, 1);

    expect(db.transactions.add).toHaveBeenCalledTimes(2);
  });

  it('should skip duplicate non-transfer transactions that already exist', async () => {
    const file = new File([
      JSON.stringify([
        {
          value: 100,
          type: 'Income',
          name: 'Test Transaction',
          date: new Date('2024-01-01').toISOString(),
          category: 'Salary',
        },
      ])
    ], 'data.json', { type: 'application/json' });

    mockConfirm.mockReturnValue(true);
    vi.mocked(db.transactions.toArray).mockResolvedValue([
      {
        id: 10,
        value: 100,
        type: 'Income',
        name: 'Test Transaction',
        date: new Date('2024-01-01'),
        category: 'Salary',
        account_id: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ]);

    await jsonToDB(file, 1);

    expect(db.transactions.add).not.toHaveBeenCalled();
  });

  it('should skip mirrored transfer imports that already exist in another account', async () => {
    const csv =
      'Date,Amount,Payee,Particulars,Code,Reference,Tran Type,This Party Account,Other Party Account,Serial,Transaction Code,Batch Number,Originating Bank/Branch,Processed Date\n' +
      '07/03/26,-1700.00,Moto,,,INTERNET XFR,FT,02-0820-0660426-01,02-0820-0660426-05,,"00",0000,"02-1255",07/03/26';
    const file = new File([csv], 'bills-transfer.csv', { type: 'text/csv' });

    mockConfirm.mockReturnValue(true);
    vi.mocked(db.accounts.toArray).mockResolvedValue([
      {
        id: 1,
        name: 'Moto',
        type: 'Everyday',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 2,
        name: 'Bills',
        type: 'Everyday',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ]);
    vi.mocked(db.transactions.toArray).mockResolvedValue([
      {
        id: 12,
        name: 'Transfer',
        type: 'Transfer',
        value: -1700,
        date: new Date(2026, 2, 7),
        account_id: 2,
        to_account_id: 1,
        category: 'FT',
        createdAt: new Date(2026, 2, 7),
        updatedAt: new Date(2026, 2, 7),
      },
    ]);

    await jsonToDB(file, 2);

    expect(db.transactions.add).not.toHaveBeenCalled();
  });

});
