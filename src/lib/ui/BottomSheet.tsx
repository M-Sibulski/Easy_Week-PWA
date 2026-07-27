import { forwardRef, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

export interface BottomSheetProps {
  open: boolean;
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
}

/**
 * BottomSheet — sliding overlay container.
 *
 * Fixes defect D-001: uses `translate-y-full` (100%) for the off-canvas state,
 * not the erroneous `translate-y-100` (100px) that was previously used.
 */
const BottomSheet = forwardRef<HTMLDivElement, BottomSheetProps>(
  ({ open, children, className, 'data-testid': testId }, ref) => {
    const [shouldRender, setShouldRender] = useState(open);
    const internalRef = useRef<HTMLDivElement>(null);
    const resolvedRef = (ref as React.RefObject<HTMLDivElement>) ?? internalRef;

    useEffect(() => {
      if (open) setShouldRender(true);
    }, [open]);

    useEffect(() => {
      const node = resolvedRef?.current ?? internalRef.current;
      const handleTransitionEnd = (e: TransitionEvent) => {
        if (e.propertyName === 'translate' && !open) {
          setShouldRender(false);
        }
      };
      node?.addEventListener('transitionend', handleTransitionEnd);
      return () => node?.removeEventListener('transitionend', handleTransitionEnd);
    }, [open, resolvedRef]);

    if (!shouldRender) return null;

    return (
      <div
        ref={resolvedRef}
        data-testid={testId}
        className={
          'z-40 absolute bottom-0 left-1/2 transition duration-200 ease-in-out transform -translate-x-1/2 ' +
          'bg-blue-500 dark:bg-blue-800 p-3 rounded-t-xl flex flex-col gap-5 w-full ' +
          (open ? 'translate-y-0' : 'translate-y-full') +
          (className ? ' ' + className : '')
        }
      >
        {children}
      </div>
    );
  }
);

BottomSheet.displayName = 'BottomSheet';

export default BottomSheet;
