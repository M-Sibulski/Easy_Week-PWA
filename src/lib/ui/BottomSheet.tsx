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
 *
 * Animation lifecycle (managed internally):
 * - When `open` changes to true: children mount with `translate-y-full`,
 *   then a rAF triggers `translate-y-0` for the slide-in animation.
 * - When `open` changes to false: CSS transition fires `translate-y-full`,
 *   and after `transitionend` children are unmounted from the DOM.
 */
const BottomSheet = forwardRef<HTMLDivElement, BottomSheetProps>(
  ({ open, children, className, 'data-testid': testId }, ref) => {
    // shouldRender controls DOM presence; isOpen controls the CSS translate class.
    const [shouldRender, setShouldRender] = useState(open);
    const [isOpen, setIsOpen] = useState(open);
    const internalRef = useRef<HTMLDivElement>(null);
    const resolvedRef = (ref as React.RefObject<HTMLDivElement>) ?? internalRef;

    useEffect(() => {
      if (open) {
        // Mount content off-screen first, then slide in via rAF.
        setShouldRender(true);
        const raf = requestAnimationFrame(() => setIsOpen(true));
        return () => cancelAnimationFrame(raf);
      } else {
        // Start slide-out; DOM removal handled by transitionend listener below.
        setIsOpen(false);
      }
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
          'bg-blue-500 dark:bg-blue-900 p-3 rounded-t-xl flex flex-col gap-5 w-full ' +
          (isOpen ? 'translate-y-0' : 'translate-y-full') +
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
