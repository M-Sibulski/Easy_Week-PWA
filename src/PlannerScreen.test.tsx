import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Accounts, Settings } from '../types';
import PlannerScreen from './PlannerScreen';

const {
  mockUseStandardWeekTemplate,
  mockUseWeeklyPlansByAccount,
  mockRepository,
} = vi.hoisted(() => ({
  mockUseStandardWeekTemplate: vi.fn(),
  mockUseWeeklyPlansByAccount: vi.fn(),
  mockRepository: {
    upsertStandardWeekTemplate: vi.fn(),
    createWeeklyPlanFromTemplate: vi.fn(),
    updateWeeklyPlan: vi.fn(),
  },
}));

vi.mock('./hooks/useAppData', () => ({
  useStandardWeekTemplate: (accountId: number) => mockUseStandardWeekTemplate(accountId),
  useWeeklyPlansByAccount: (accountId: number) => mockUseWeeklyPlansByAccount(accountId),
}));

vi.mock('./repository', () => ({
  repository: mockRepository,
}));

describe('PlannerScreen', () => {
  const accounts: Accounts[] = [
    { id: 1, syncId: 'acc-main', name: 'Main', type: 'Everyday', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
  ];
  const settings: Settings = {
    id: 1,
    syncId: 'set-main',
    dark: false,
    main_account_id: 1,
    main_account_sync_id: 'acc-main',
    week_starting_day: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseStandardWeekTemplate.mockReturnValue(undefined);
    mockUseWeeklyPlansByAccount.mockReturnValue([]);
  });

  it('saves a standard week template from the empty state', async () => {
    render(<PlannerScreen accountId={1} accounts={accounts} settings={settings} referenceDate={new Date('2024-01-03T12:00:00Z')} />);

    fireEvent.change(screen.getByLabelText('Template category'), { target: { value: 'Rent' } });
    fireEvent.change(screen.getByLabelText('Template bucket'), { target: { value: 'fixed_expense' } });
    fireEvent.change(screen.getByLabelText('Template amount'), { target: { value: '500' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save standard week' }));

    await waitFor(() => {
      expect(mockRepository.upsertStandardWeekTemplate).toHaveBeenCalledWith(expect.objectContaining({
        account_id: 1,
        week_starting_day_snapshot: 1,
      }), [expect.objectContaining({ category: 'Rent', bucket_type: 'fixed_expense', amount: 500 })]);
    });
  });

  it('shows the create-this-week-plan CTA when a template exists without a snapshot', async () => {
    mockUseStandardWeekTemplate.mockReturnValue({
      template: {
        id: 2,
        syncId: 'tpl-2',
        account_id: 1,
        account_sync_id: 'acc-main',
        week_starting_day_snapshot: 1,
        name: 'Standard Week',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      items: [
        { id: 1, syncId: 'tpi-1', template_id: 2, category: 'Food', bucket_type: 'variable_expense', amount: 200, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
      ],
    });

    render(<PlannerScreen accountId={1} accounts={accounts} settings={settings} referenceDate={new Date('2024-01-03T12:00:00Z')} />);

    expect(screen.getByRole('button', { name: 'Create this week plan' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Create this week plan' }));

    await waitFor(() => {
      expect(mockRepository.createWeeklyPlanFromTemplate).toHaveBeenCalled();
    });
  });

  it('saves draft snapshot edits', async () => {
    mockUseWeeklyPlansByAccount.mockReturnValue([
      {
        snapshot: {
          id: 7,
          syncId: 'wpl-7',
          account_id: 1,
          account_sync_id: 'acc-main',
          template_id: 2,
          week_start: new Date('2024-01-01T00:00:00.000Z'),
          week_end: new Date('2024-01-07T23:59:59.999Z'),
          status: 'draft',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        items: [
          { id: 11, syncId: 'wpi-11', weekly_plan_id: 7, category: 'Food', bucket_type: 'variable_expense', amount: 100, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
        ],
      },
    ]);

    render(<PlannerScreen accountId={1} accounts={accounts} settings={settings} referenceDate={new Date('2024-01-03T12:00:00Z')} />);

    fireEvent.change(screen.getByLabelText('Weekly plan notes'), { target: { value: 'Updated notes' } });
    fireEvent.change(screen.getByLabelText('Snapshot amount'), { target: { value: '175' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save weekly plan' }));

    await waitFor(() => {
      expect(mockRepository.updateWeeklyPlan).toHaveBeenCalledWith(7, { notes: 'Updated notes' }, expect.objectContaining({
        update: [expect.objectContaining({ id: 11, changes: expect.objectContaining({ amount: 175 }) })],
      }));
    });
  });

  it('renders locked snapshots in read-only mode', () => {
    mockUseWeeklyPlansByAccount.mockReturnValue([
      {
        snapshot: {
          id: 8,
          syncId: 'wpl-8',
          account_id: 1,
          account_sync_id: 'acc-main',
          template_id: 2,
          week_start: new Date('2024-01-01T00:00:00.000Z'),
          week_end: new Date('2024-01-07T23:59:59.999Z'),
          status: 'locked',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-08'),
        },
        items: [
          { id: 12, syncId: 'wpi-12', weekly_plan_id: 8, category: 'Rent', bucket_type: 'fixed_expense', amount: 500, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
        ],
      },
    ]);

    render(<PlannerScreen accountId={1} accounts={accounts} settings={settings} referenceDate={new Date('2024-01-03T12:00:00Z')} />);

    expect(screen.getByText('Locked')).toBeInTheDocument();
    expect(screen.getByLabelText('Weekly plan notes')).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Save weekly plan' })).not.toBeInTheDocument();
  });
});
