import type { BucketType } from '../../types';

export interface PlannerEditableItem {
  localId: string;
  id?: number;
  category: string;
  bucket_type: BucketType;
  amount: number;
}

interface TemplateItemRowProps {
  item: PlannerEditableItem;
  onChange: (item: PlannerEditableItem) => void;
  onDelete: (localId: string) => void;
  disabled?: boolean;
}

const bucketOptions: Array<{ value: BucketType; label: string }> = [
  { value: 'income', label: 'Income' },
  { value: 'fixed_expense', label: 'Fixed expense' },
  { value: 'variable_expense', label: 'Variable expense' },
  { value: 'savings', label: 'Savings' },
];

export default function TemplateItemRow({ item, onChange, onDelete, disabled = false }: TemplateItemRowProps) {
  return (
    <div className="grid grid-cols-1 gap-2 rounded-xl border border-gray-300 bg-white p-3 shadow-sm dark:border-[var(--ew-border)] dark:bg-[var(--ew-surface-100)] md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1fr)_auto]">
      <input
        aria-label="Template category"
        type="text"
        value={item.category}
        disabled={disabled}
        onChange={(event) => onChange({ ...item, category: event.target.value })}
        placeholder="Category"
        className="rounded-lg border border-gray-300 px-3 py-2 dark:border-[var(--ew-border)] dark:bg-[var(--ew-surface-200)] dark:text-[var(--ew-text)]"
      />
      <select
        aria-label="Template bucket"
        value={item.bucket_type}
        disabled={disabled}
        onChange={(event) => onChange({ ...item, bucket_type: event.target.value as BucketType })}
        className="rounded-lg border border-gray-300 px-3 py-2 dark:border-[var(--ew-border)] dark:bg-[var(--ew-surface-200)] dark:text-[var(--ew-text)]"
      >
        {bucketOptions.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <input
        aria-label="Template amount"
        type="number"
        min="0"
        step="0.01"
        value={item.amount}
        disabled={disabled}
        onChange={(event) => onChange({ ...item, amount: Number(event.target.value) })}
        className="rounded-lg border border-gray-300 px-3 py-2 dark:border-[var(--ew-border)] dark:bg-[var(--ew-surface-200)] dark:text-[var(--ew-text)]"
      />
      <button
        type="button"
        aria-label="Delete template item"
        disabled={disabled}
        onClick={() => onDelete(item.localId)}
        className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-700 dark:hover:bg-red-950/30"
      >
        Delete
      </button>
    </div>
  );
}
