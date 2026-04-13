import { describe, expect, it } from 'vitest';
import type { CategorySuggestion } from '../../types';
import {
  mapRemoteCategorySuggestion,
  pickLastWriteWinsRecord,
  serializeCategorySuggestion,
} from './syncService';

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

describe('category suggestion sync mapping', () => {
  it('maps a remote category suggestion row into the local model', () => {
    expect(mapRemoteCategorySuggestion({
      sync_id: 'cat-1',
      token: 'uber',
      category: 'Transport',
      score: 4,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-02T00:00:00.000Z',
      deleted_at: null,
    })).toEqual({
      syncId: 'cat-1',
      token: 'uber',
      category: 'Transport',
      score: 4,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      deletedAt: undefined,
    });
  });

  it('serializes a local category suggestion row for Supabase upsert', () => {
    const row: CategorySuggestion = {
      id: 7,
      syncId: 'cat-7',
      token: 'uber',
      category: 'Transport',
      score: 3,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    };

    expect(serializeCategorySuggestion('user-1', row)).toEqual({
      user_id: 'user-1',
      sync_id: 'cat-7',
      token: 'uber',
      category: 'Transport',
      score: 3,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-02T00:00:00.000Z',
      deleted_at: null,
    });
  });
});
