import { describe, expect, it } from 'vitest';
import { pickLastWriteWinsRecord } from './syncService';

describe('pickLastWriteWinsRecord', () => {
  it('returns the local record when it is newer than the remote one', () => {
    const localRecord = {
      syncId: 'txn-1',
      updatedAt: new Date('2026-01-03T12:00:00.000Z'),
    };
    const remoteRecord = {
      syncId: 'txn-1',
      updatedAt: new Date('2026-01-03T11:00:00.000Z'),
    };

    expect(pickLastWriteWinsRecord(localRecord, remoteRecord)).toEqual(localRecord);
  });

  it('returns the remote record when it is newer than the local one', () => {
    const localRecord = {
      syncId: 'txn-1',
      updatedAt: new Date('2026-01-03T10:00:00.000Z'),
    };
    const remoteRecord = {
      syncId: 'txn-1',
      updatedAt: new Date('2026-01-03T12:00:00.000Z'),
    };

    expect(pickLastWriteWinsRecord(localRecord, remoteRecord)).toEqual(remoteRecord);
  });

  it('prefers the local record when timestamps match exactly', () => {
    const localRecord = {
      syncId: 'txn-1',
      updatedAt: new Date('2026-01-03T12:00:00.000Z'),
    };
    const remoteRecord = {
      syncId: 'txn-1',
      updatedAt: new Date('2026-01-03T12:00:00.000Z'),
    };

    expect(pickLastWriteWinsRecord(localRecord, remoteRecord)).toEqual(localRecord);
  });
});
