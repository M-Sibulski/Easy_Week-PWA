import type { Settings } from '../types.ts';
import type { IRepository } from './repository/IRepository';
import { createSyncId as defaultCreateSyncId } from '../syncIds.ts';

type StarterRepository = Pick<IRepository, 'putAccount' | 'putSettings'>;

type StarterDependencies = {
  createSyncId?: typeof defaultCreateSyncId;
  now?: Date;
};

export function buildStarterAccounts(
  dependencies: StarterDependencies = {},
) {
  const createSyncId = dependencies.createSyncId ?? defaultCreateSyncId;
  const now = dependencies.now ?? new Date();

  return [
    {
      id: 1,
      syncId: createSyncId('acc'),
      name: 'Main Account',
      type: 'Everyday' as const,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 2,
      syncId: createSyncId('acc'),
      name: 'Savings',
      type: 'Savings' as const,
      goalDate: new Date('2026/05/10'),
      goalValue: 4000,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function buildStarterSettings(
  dependencies: StarterDependencies = {},
): Settings {
  const createSyncId = dependencies.createSyncId ?? defaultCreateSyncId;
  const now = dependencies.now ?? new Date();

  return {
    id: 1,
    syncId: createSyncId('set'),
    dark: true,
    main_account_id: 0,
    main_account_sync_id: undefined,
    week_starting_day: 2,
    createdAt: now,
    updatedAt: now,
  };
}

export async function initializeStarterPack(
  repository: StarterRepository,
  dependencies: StarterDependencies = {},
) {
  const accounts = buildStarterAccounts(dependencies);
  const settings = buildStarterSettings(dependencies);

  for (const account of accounts) {
    await repository.putAccount(account);
  }

  await repository.putSettings(settings);
}
