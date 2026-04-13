import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import SettingsScreen from './SettingsScreen';
import { repository } from './repository';
import { resetCurrentUserData } from './resetUserData';

vi.mock('./repository', () => ({
  repository: {
    clearAccounts: vi.fn(),
    clearTransactions: vi.fn(),
    putSettings: vi.fn(),
    updateSettings: vi.fn(),
  },
}));

vi.mock('../syncIds.ts', () => ({
  createSyncId: vi.fn(() => 'set-generated'),
}));

vi.mock('./resetUserData', () => ({
  resetCurrentUserData: vi.fn(),
}));

describe('SettingsScreen', () => {
  const mockCallback = vi.fn();
  const mockConfirm = vi.fn();
  const mockAccounts = [
    {
      id: 1,
      syncId: 'acc-main',
      name: 'Main',
      type: 'Everyday' as const,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 2,
      syncId: 'acc-savings',
      name: 'Savings',
      type: 'Savings' as const,
      goalDate: new Date('2025-12-31'),
      goalValue: 1000,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ];
  const existingSettings = {
    id: 3,
    syncId: 'set-clear',
    dark: false,
    main_account_id: 1,
    main_account_sync_id: 'acc-main',
    week_starting_day: 4,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('confirm', mockConfirm);
  });

  it('runs the full reset flow after confirmation', async () => {
    mockConfirm.mockReturnValue(true);
    vi.mocked(resetCurrentUserData).mockResolvedValue(undefined);

    render(
      <SettingsScreen
        open={true}
        callback={mockCallback}
        settings={existingSettings}
        accounts={mockAccounts}
      />
    );

    await userEvent.click(screen.getByTestId('clear-all-data'));

    expect(resetCurrentUserData).toHaveBeenCalled();
    expect(mockCallback).toHaveBeenCalled();
  });

  it('does nothing when clear all data is cancelled', async () => {
    mockConfirm.mockReturnValue(false);

    render(
      <SettingsScreen
        open={true}
        callback={mockCallback}
        settings={{ ...existingSettings, id: 1, syncId: 'set-existing', dark: true, week_starting_day: 2 }}
        accounts={mockAccounts}
      />
    );

    await userEvent.click(screen.getByTestId('clear-all-data'));

    expect(resetCurrentUserData).not.toHaveBeenCalled();
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('updates existing settings and resolves the main account sync id on submit', async () => {
    vi.mocked(repository.updateSettings).mockResolvedValue(undefined);

    render(
      <SettingsScreen
        open={true}
        callback={mockCallback}
        settings={existingSettings}
        accounts={mockAccounts}
      />
    );

    const [mainAccountSelect, weekStartingDaySelect] = screen.getAllByRole('combobox');

    await userEvent.selectOptions(mainAccountSelect, '2');
    await userEvent.selectOptions(weekStartingDaySelect, '1');
    await userEvent.click(screen.getByLabelText(/dark mode/i));
    await userEvent.click(screen.getByTestId('submit-settings'));

    expect(repository.updateSettings).toHaveBeenCalledWith(3, {
      main_account_id: 2,
      main_account_sync_id: 'acc-savings',
      week_starting_day: 1,
      dark: true,
    });
    expect(mockCallback).toHaveBeenCalled();
  });

  it('creates settings when none exist yet', async () => {
    vi.mocked(repository.putSettings).mockResolvedValue(undefined);

    render(
      <SettingsScreen
        open={true}
        callback={mockCallback}
        settings={undefined}
        accounts={mockAccounts}
      />
    );

    const [mainAccountSelect, weekStartingDaySelect] = screen.getAllByRole('combobox');

    await userEvent.selectOptions(mainAccountSelect, '2');
    await userEvent.selectOptions(weekStartingDaySelect, '6');
    await userEvent.click(screen.getByLabelText(/dark mode/i));
    await userEvent.click(screen.getByTestId('submit-settings'));

    expect(repository.putSettings).toHaveBeenCalledWith(expect.objectContaining({
      id: 1,
      syncId: 'set-generated',
      main_account_id: 2,
      main_account_sync_id: 'acc-savings',
      week_starting_day: 6,
      dark: false,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    }));
    expect(mockCallback).toHaveBeenCalled();
  });

  it('closes when clicking outside the form', () => {
    render(
      <SettingsScreen
        open={true}
        callback={mockCallback}
        settings={existingSettings}
        accounts={mockAccounts}
      />
    );

    fireEvent.mouseDown(document.body);

    expect(mockCallback).toHaveBeenCalled();
  });

  it('stops rendering after the close transition finishes', async () => {
    const { rerender } = render(
      <SettingsScreen
        open={true}
        callback={mockCallback}
        settings={existingSettings}
        accounts={mockAccounts}
      />
    );

    expect(screen.getByTestId('settings-form')).toBeInTheDocument();

    rerender(
      <SettingsScreen
        open={false}
        callback={mockCallback}
        settings={existingSettings}
        accounts={mockAccounts}
      />
    );

    const transitionEvent = new Event('transitionend');
    Object.defineProperty(transitionEvent, 'propertyName', { value: 'translate' });
    fireEvent(screen.getByTestId('settings-form'), transitionEvent);

    await waitFor(() => {
      expect(screen.queryByTestId('settings-form')).not.toBeInTheDocument();
    });
  });
});