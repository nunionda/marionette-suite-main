import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock import.meta.env for Vite
vi.stubGlobal('import', {
  meta: {
    env: {
      VITE_OPENROUTER_API_KEY: 'test-api-key'
    }
  }
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
};
vi.stubGlobal('localStorage', localStorageMock);
