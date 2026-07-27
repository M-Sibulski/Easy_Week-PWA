import type { ReactNode } from 'react';

export interface SheetHeaderProps {
  /** Title displayed centered in the header */
  title: string;
  /** Optional content for the left slot (e.g. clear button) */
  leftSlot?: ReactNode;
  /** Optional content for the right slot (e.g. close button) */
  rightSlot?: ReactNode;
}

/**
 * SheetHeader — standard header row for bottom-sheet forms.
 * Provides a centered title with optional left and right slots.
 */
export default function SheetHeader({ title, leftSlot, rightSlot }: SheetHeaderProps) {
  return (
    <div className="relative flex items-center">
      {leftSlot && (
        <span className="absolute left-0 flex h-full items-center">{leftSlot}</span>
      )}
      <h3 className="w-full text-center text-gray-50 font-bold text-lg select-none">
        {title}
      </h3>
      {rightSlot && (
        <span className="absolute right-0 flex h-full items-center">{rightSlot}</span>
      )}
    </div>
  );
}
