import 'fake-indexeddb/auto';
import { vi } from 'vitest';

vi.mock('virtual:pwa-register/react', () => ({
	useRegisterSW: () => ({
		offlineReady: [false, vi.fn()],
		needRefresh: [false, vi.fn()],
		updateServiceWorker: vi.fn(),
	}),
}));