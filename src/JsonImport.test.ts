import { describe, it, expect, vi, beforeEach } from 'vitest';
import jsonToDB from './JsonImport';
import { db } from '../db';
import type { Transactions } from '../types';

vi.mock('../db', () => {
  return {
    db: {
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
    },
  ];

  

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('confirm', mockConfirm);
    vi.stubGlobal('alert', mockAlert);
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

    expect(mockAlert).toHaveBeenCalledWith('Invalid JSON file.');
  });

  it('should alert if JSON is not an array', async () => {
    const file = new File(['{"name": "test"}'], 'data.json', { type: 'application/json' });
    await jsonToDB(file, 1);

    expect(mockAlert).toHaveBeenCalledWith('Invalid JSON file.');
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
});