import { act, fireEvent, render, screen, } from '@testing-library/react';
import PWABadge from './PWABadge';
import registerPeriodicSync from './registerPeriodicSync';
import {describe, it, expect, vi, type Mock, afterEach} from "vitest";
import React from 'react';
import "@testing-library/jest-dom/vitest";
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup()          // 🧹 unmount whatever the last test rendered
  vi.clearAllMocks() // keep this line to reset spies
})

// ---------- 1.  Prepare a programmable mock of useRegisterSW ----------
const updateServiceWorkerMock = vi.fn()

let setOfflineReady!: React.Dispatch<React.SetStateAction<boolean>>

/**
 * A helper that builds a fresh hook implementation for every test.
 */
function buildMockHook(initial: { offlineReady?: boolean; needRefresh?: boolean }) {
  return () => {
    // real React state so the component re-renders when we call the setters
    const [offlineReady, _setOfflineReady] = React.useState(!!initial.offlineReady)
    const [needRefresh, _setNeedRefresh] = React.useState(!!initial.needRefresh)

    // put the setters in outer-scope variables so tests can call them
    setOfflineReady = _setOfflineReady

    return {
      offlineReady: [offlineReady, _setOfflineReady] as const,
      needRefresh: [needRefresh, _setNeedRefresh] as const,
      updateServiceWorker: updateServiceWorkerMock,
    }
  }
}

// Tell Vitest how to resolve the virtual module --------------------------------
vi.mock('virtual:pwa-register/react', () => ({
  // During each individual test we’ll override the implementation
  useRegisterSW: vi.fn(),
}))
const { useRegisterSW } = await vi.importMock<typeof import('virtual:pwa-register/react')>('virtual:pwa-register/react')

// ------------------------------------------------------------------------------

describe('<PWABadge />', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing while nothing is ready', () => {
    (useRegisterSW as Mock).mockImplementation(buildMockHook({}))

    render(<PWABadge />)

    // the wrapper is always there, so instead assert that the toast
    // (or either of its texts) is missing:
    expect(
        screen.queryByText(/App ready to work offline/i),
    ).not.toBeInTheDocument()
    expect(
        screen.queryByText(/New content available/i),
    ).not.toBeInTheDocument()
    })

  it('shows the “offline ready” toast and hides it when “Close” is pressed', () => {
    (useRegisterSW as Mock).mockImplementation(buildMockHook({}))

    render(<PWABadge />)

    // 🔹 make the SW become ready
    act(() => setOfflineReady(true))

    // toast is now visible
    const message = screen.getByText(/App ready to work offline/i)
    expect(message).toBeInTheDocument()

    // click “Close”
    fireEvent.click(screen.getByTestId('close1'))

    // toast gone
    expect(
        screen.queryByText(/App ready to work offline/i),
    ).not.toBeInTheDocument()
    })

  it('shows the “need refresh” toast and calls updateServiceWorker(true) on “Reload”', () => {
    (useRegisterSW as Mock).mockImplementation(buildMockHook({ needRefresh: true }))

    render(<PWABadge />)

    // grab the UNIQUE toast message instead of the wrapper role
    const toastMsg = screen.getByText(/New content available/i)
    expect(toastMsg).toBeInTheDocument()

    // click the Reload button
    fireEvent.click(screen.getByTestId('refresh'))

    expect(updateServiceWorkerMock).toHaveBeenCalledTimes(1)
    expect(updateServiceWorkerMock).toHaveBeenCalledWith(true)
    })

    it('does NOT schedule anything when period <= 0', () => {
        vi.useFakeTimers()
        const update = vi.fn()

        registerPeriodicSync(0, '/sw.js', { update } as unknown as ServiceWorkerRegistration)

        // advancing time should do nothing
        vi.advanceTimersByTime(10_000)
        expect(update).not.toHaveBeenCalled()
        // and no intervals were registered
        expect(vi.getTimerCount()).toBe(0)

        vi.useRealTimers()
    })
    
    it('polls the sw url every period ms and calls update()', async () => {
        vi.useFakeTimers()

        const fetchMock = vi.fn(() => Promise.resolve({ status: 200 }))
        vi.stubGlobal('fetch', fetchMock)

        const update = vi.fn()
        registerPeriodicSync(1_000, '/sw.js', { update } as unknown as ServiceWorkerRegistration)

        // ⬇️ advance 3 seconds *and* wait for the async work triggered each tick
        await vi.advanceTimersByTimeAsync(3_000)

        expect(fetchMock).toHaveBeenCalledTimes(3)
        expect(update).toHaveBeenCalledTimes(3)

        vi.useRealTimers()
    })

    it('does NOT call update() when the response status is not 200', () => {
        vi.useFakeTimers()
        vi.stubGlobal('fetch', () => Promise.resolve({ status: 500 }))
        const update = vi.fn()

        registerPeriodicSync(1_000, '/sw.js', { update } as unknown as ServiceWorkerRegistration)

        vi.advanceTimersByTime(2_000)
        expect(update).not.toHaveBeenCalled()

        vi.useRealTimers()
    })

    it('skips polling while the user is offline', () => {
        vi.useFakeTimers()

        // Simulate offline mode
        Object.defineProperty(globalThis.navigator, 'onLine', { value: false, configurable: true })

        globalThis.fetch = vi.fn()
        const update = vi.fn()

        registerPeriodicSync(1_000, '/sw.js', { update } as unknown as ServiceWorkerRegistration)

        vi.advanceTimersByTime(2_000)
        expect(globalThis.fetch).not.toHaveBeenCalled()
        expect(update).not.toHaveBeenCalled()

        vi.useRealTimers()
        // clean up the stubbed property so other tests aren't affected
        // delete (globalThis.navigator as Navigator).onLine
        vi.spyOn(window.navigator, 'onLine', 'get').mockReturnValue(false);
    })

    it('hides the “need refresh” toast when Close is pressed', () => {
        (useRegisterSW as Mock).mockImplementation(buildMockHook({ needRefresh: true }))

        render(<PWABadge />)

        expect(screen.getByText(/New content available/i)).toBeInTheDocument()

        fireEvent.click(screen.getByTestId('close2'))

        expect(
            screen.queryByText(/New content available/i),
        ).not.toBeInTheDocument()
    })
})