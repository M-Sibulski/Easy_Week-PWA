import type { BucketType } from '../../types';
import type { PlannerEditableItem } from './TemplateItemRow';

interface SnapshotItemEditorProps {
  item: PlannerEditableItem;
  editable: boolean;
  onChange: (item: PlannerEditableItem) => void;
  onDelete: (localId: string) => void;
}

const bucketOptions: Array<{ value: BucketType; label: string }> = [
  { value: 'income', label: 'Income' },
  { value: 'fixed_expense', label: 'Fixed expense' },
  { value: 'variable_expense', label: 'Variable expense' },
  { value: 'savings', label: 'Savings' },
];

export default function SnapshotItemEditor({ item, editable, onChange, onDelete }: SnapshotItemEditorProps) {
  return (
    <div className="grid grid-cols-1 gap-2 rounded-xl border border-gray-300 bg-white p-3 shadow-sm dark:border-[var(--ew-border)] dark:bg-[var(--ew-surface-100)] md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1fr)_auto]">
      <input
        aria-label="Snapshot category"
        type="text"
        value={item.category}
        disabled={!editable}
        onChange={(event) => onChange({ ...item, category: event.target.value })}
        className="rounded-lg border border-gray-300 px-3 py-2 disabled:opacity-70 dark:border-[var(--ew-border)] dark:bg-[var(--ew-surface-200)] dark:text-[var(--ew-text)]"
      />
      <select
        aria-label="Snapshot bucket"
        value={item.bucket_type}
        disabled={!editable}
        onChange={(event) => onChange({ ...item, bucket_type: event.target.value as BucketType })}
        className="rounded-lg border border-gray-300 px-3 py-2 disabled:opacity-70 dark:border-[var(--ew-border)] dark:bg-[var(--ew-surface-200)] dark:text-[var(--ew-text)]"
      >
        {bucketOptions.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <input
        aria-label="Snapshot amount"
        type="number"
        min="0"
        step="0.01"
        value={item.amount}
        disabled={!editable}
        onChange={(event) => onChange({ ...item, amount: Number(event.target.value) })}
        className="rounded-lg border border-gray-300 px-3 py-2 disabled:opacity-70 dark:border-[var(--ew-border)] dark:bg-[var(--ew-surface-200)] dark:text-[var(--ew-text)]"
      />
      <button
        type="button"
        aria-label="Delete snapshot item"
        disabled={!editable}
        onClick={() => onDelete(item.localId)}
        className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-700 dark:hover:bg-red-950/30"
      >
        Delete
      </button>
    </div>
  );
}
