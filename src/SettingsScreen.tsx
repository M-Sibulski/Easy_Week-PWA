import './App.css';
import { repository } from './repository';
import { Accounts, Settings } from '../types.ts';
import { useEffect, useRef, useState } from 'react';
import { createSyncId } from '../syncIds.ts';
import { resetCurrentUserData } from './resetUserData';
import { BottomSheet, SheetHeader, IconButton, FormField, SubmitButton } from './lib/ui';

interface Props {
  open: boolean;
  callback: () => void;
  settings: Settings | undefined;
  accounts: Accounts[] | undefined;
}

const weekDays = [
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 }
];

const SettingsScreen = ({ open, callback, settings, accounts }: Props) => {
  const [mainAccountId, setMainAccountId] = useState(0);
  const [weekStartingDay, setWeekStartingDay] = useState(2);
  const [darkMode, setDarkMode] = useState(true);
  const [isResettingData, setIsResettingData] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    setMainAccountId(settings?.main_account_id ?? 0);
    setWeekStartingDay(settings?.week_starting_day ?? 2);
    setDarkMode(settings?.dark ?? true);
  }, [open, settings]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(event.target as Node)) {
        callback();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, callback]);

  const saveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const mainAccountSyncId = accounts?.find(account => account.id === mainAccountId)?.syncId;

    try {
      if (settings) {
        await repository.updateSettings(settings.id, {
          main_account_id: mainAccountId,
          main_account_sync_id: mainAccountSyncId,
          week_starting_day: weekStartingDay,
          dark: darkMode
        });
      } else {
        const now = new Date();

        await repository.putSettings({
          id: 1,
          syncId: createSyncId('set'),
          main_account_id: mainAccountId,
          main_account_sync_id: mainAccountSyncId,
          week_starting_day: weekStartingDay,
          dark: darkMode,
          createdAt: now,
          updatedAt: now,
        });
      }
    } catch (error) {
      console.log(error);
    }

    callback();
  };

  const handleCloseButton = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    callback();
  };

  const handleClearAllData = async () => {
    const answer = confirm('This will permanently delete all of your accounts, transactions, categories, and settings from this device and the API, then recreate the starter pack. Continue?');
    if (!answer) {
      return;
    }

    try {
      setIsResettingData(true);
      await resetCurrentUserData();
      callback();
    } catch (error) {
      console.log(error);
    } finally {
      setIsResettingData(false);
    }
  };

  return (
    <BottomSheet open={open} ref={sheetRef} data-testid="settings-sheet">
      <form
        data-testid="settings-form"
        id="settings-form"
        onSubmit={e => saveSettings(e)}
      >
        <SheetHeader
          title="Settings"
          rightSlot={
            <IconButton
              onClick={e => handleCloseButton(e)}
              role="close"
              name="close"
              aria-label="Close settings"
            >
              <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#f9fafb">
                <path d="M200-440v-80h560v80H200Z" />
              </svg>
            </IconButton>
          }
        />

        <div className="flex flex-col gap-3 mt-2">
          <div className="flex gap-3 bg-blue-300 rounded-md p-1 hover:bg-blue-200">
            <label htmlFor="dark-mode" className="flex-1 select-none">
              Dark mode
            </label>
            <input
              id="dark-mode"
              type="checkbox"
              checked={darkMode}
              onChange={e => setDarkMode(e.currentTarget.checked)}
              className="size-6"
            />
          </div>

          <FormField
            as="select"
            value={mainAccountId}
            onChange={e => setMainAccountId(Number(e.currentTarget.value))}
            name="main-account"
            id="main-account"
          >
            <option value={0}>No main account</option>
            {accounts && accounts.map(a => (
              <option key={a.id} value={a.id}>
                Main account: {a.name}
              </option>
            ))}
          </FormField>

          <FormField
            as="select"
            value={weekStartingDay}
            onChange={e => setWeekStartingDay(Number(e.currentTarget.value))}
            name="week-starting-day"
            id="week-starting-day"
          >
            {weekDays.map(day => (
              <option key={day.value} value={day.value}>
                Week starts on {day.label}
              </option>
            ))}
          </FormField>

          <button
            data-testid="clear-all-data"
            type="button"
            onClick={handleClearAllData}
            disabled={isResettingData}
            className="cursor-pointer rounded-md border border-red-200 bg-red-500/80 p-2 text-white hover:bg-red-600"
          >
            {isResettingData ? 'Resetting Data...' : 'Reset All Data'}
          </button>

          <SubmitButton
            data-testid="submit-settings"
            name="submit-settings"
          />
        </div>
      </form>
    </BottomSheet>
  );
};

export default SettingsScreen;
