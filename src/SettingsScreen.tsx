import './App.css';
import { repository } from './repository';
import { Accounts, Settings } from '../types.ts';
import { useEffect, useRef, useState } from 'react';
import { createSyncId } from '../syncIds.ts';
import { resetCurrentUserData } from './resetUserData';

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
  const [shouldRender, setShouldRender] = useState(false);
  const [mainAccountId, setMainAccountId] = useState(0);
  const [weekStartingDay, setWeekStartingDay] = useState(2);
  const [darkMode, setDarkMode] = useState(true);
  const [isResettingData, setIsResettingData] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!open) return;

    setShouldRender(true);
    setMainAccountId(settings?.main_account_id ?? 0);
    setWeekStartingDay(settings?.week_starting_day ?? 2);
    setDarkMode(settings?.dark ?? true);
  }, [open, settings]);

  useEffect(() => {
    const handleTransitionEnd = (e: TransitionEvent) => {
      if (e.propertyName === 'translate' && !open) {
        setShouldRender(false);
      }
    };

    const node = formRef.current;
    node?.addEventListener('transitionend', handleTransitionEnd);
    return () => node?.removeEventListener('transitionend', handleTransitionEnd);
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
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
    <>
      {shouldRender && (
        <form
          ref={formRef}
          data-testid="settings-form"
          id="settings-form"
          onSubmit={e => saveSettings(e)}
          className={
            'z-40 absolute bottom-0 left-1/2 transition transition-discrete duration-200 ease-in-out transform -translate-x-1/2 bg-blue-500 p-3 rounded-t-xl flex flex-col gap-5 w-full' +
            (open ? ' translate-y-0' : ' translate-y-100')
          }
        >
          <div className="relative flex">
            <h3 className="w-full text-center text-gray-50 font-bold text-lg select-none">Settings</h3>
            <button
              onClick={e => {
                handleCloseButton(e);
              }}
              role="close"
              name="close"
              className="absolute right-0 cursor-pointer h-full p-1 rounded-md hover:bg-blue-400"
            >
              <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#f9fafb">
                <path d="M200-440v-80h560v80H200Z" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-3">
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

            <select
              value={mainAccountId}
              onChange={e => setMainAccountId(Number(e.currentTarget.value))}
              name="main-account"
              id="main-account"
              className="bg-blue-300 rounded-md hover:bg-blue-200 p-1"
            >
              <option value={0}>No main account</option>
              {accounts && accounts.map(a => (
                <option key={a.id} value={a.id}>
                  Main account: {a.name}
                </option>
              ))}
            </select>

            <select
              value={weekStartingDay}
              onChange={e => setWeekStartingDay(Number(e.currentTarget.value))}
              name="week-starting-day"
              id="week-starting-day"
              className="bg-blue-300 rounded-md hover:bg-blue-200 p-1"
            >
              {weekDays.map(day => (
                <option key={day.value} value={day.value}>
                  Week starts on {day.label}
                </option>
              ))}
            </select>

            <button
              data-testid="clear-all-data"
              type="button"
              onClick={handleClearAllData}
              disabled={isResettingData}
              className="cursor-pointer rounded-md border border-red-200 bg-red-500/80 p-2 text-white hover:bg-red-600"
            >
              {isResettingData ? 'Resetting Data...' : 'Reset All Data'}
            </button>

            <button
              data-testid="submit-settings"
              name="submit-settings"
              type="submit"
              className="cursor-pointer h-full p-2 rounded-md hover:bg-blue-400 flex justify-center"
            >
              <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#f9fafb">
                <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
              </svg>
            </button>
          </div>
        </form>
      )}
    </>
  );
};

export default SettingsScreen;
