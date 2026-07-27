import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { BottomSheet } from './index';

describe('BottomSheet', () => {
  it('renders children when open is true', () => {
    render(
      <BottomSheet open={true}>
        <p>Sheet content</p>
      </BottomSheet>
    );
    expect(screen.getByText('Sheet content')).toBeInTheDocument();
  });

  it('applies translate-y-0 class when open', () => {
    const { container } = render(
      <BottomSheet open={true}>
        <p>Open sheet</p>
      </BottomSheet>
    );
    const sheet = container.firstElementChild;
    expect(sheet?.className).toContain('translate-y-0');
    expect(sheet?.className).not.toContain('translate-y-full');
  });

  it('applies translate-y-full (not translate-y-100) when closed and shouldRender is true', () => {
    const { rerender, container } = render(
      <BottomSheet open={true}>
        <p>Closing sheet</p>
      </BottomSheet>
    );
    rerender(
      <BottomSheet open={false}>
        <p>Closing sheet</p>
      </BottomSheet>
    );
    const sheet = container.firstElementChild;
    // Defect D-001 fix: must use translate-y-full, NOT translate-y-100
    expect(sheet?.className).toContain('translate-y-full');
    expect(sheet?.className).not.toContain('translate-y-100');
  });

  it('does not render when open is false from the start', () => {
    const { container } = render(
      <BottomSheet open={false}>
        <p>Hidden sheet</p>
      </BottomSheet>
    );
    expect(screen.queryByText('Hidden sheet')).not.toBeInTheDocument();
    expect(container.firstElementChild).toBeNull();
  });

  it('accepts and applies data-testid attribute', () => {
    render(
      <BottomSheet open={true} data-testid="my-sheet">
        <p>Test</p>
      </BottomSheet>
    );
    expect(screen.getByTestId('my-sheet')).toBeInTheDocument();
  });

  it('fires onTransitionEnd to remove from DOM after close animation', () => {
    const { rerender, container } = render(
      <BottomSheet open={true}>
        <p>Animating</p>
      </BottomSheet>
    );

    rerender(
      <BottomSheet open={false}>
        <p>Animating</p>
      </BottomSheet>
    );

    // Simulate transitionend event for "translate" property
    const sheet = container.firstElementChild;
    act(() => {
      sheet?.dispatchEvent(new TransitionEvent('transitionend', { propertyName: 'translate', bubbles: true }));
    });

    expect(screen.queryByText('Animating')).not.toBeInTheDocument();
  });
});
