import { describe, expect, it } from 'vitest';
import { proxy } from 'valtio';
import { persistStore } from './persist';

/**
 * Waits one microtask tick so Valtio's `subscribe` callback (which
 * fires asynchronously) has a chance to run.
 */
const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

describe('persistStore — hydration from localStorage', () => {
  it('hydrates listed keys when the storage entry exists', () => {
    localStorage.setItem(
      'test-store',
      JSON.stringify({ token: 'cached-token' }),
    );
    const store = proxy<{ token: string | null }>({ token: null });
    persistStore(store, 'test-store', ['token'] as const);
    expect(store.token).toBe('cached-token');
  });

  it('leaves the store untouched when no storage entry exists', () => {
    const store = proxy<{ token: string | null }>({ token: 'default' });
    persistStore(store, 'missing-store', ['token'] as const);
    expect(store.token).toBe('default');
  });

  it('ignores broken JSON without throwing', () => {
    localStorage.setItem('test-store', 'not-json{');
    const store = proxy<{ token: string | null }>({ token: null });
    expect(() =>
      persistStore(store, 'test-store', ['token'] as const),
    ).not.toThrow();
    expect(store.token).toBeNull();
  });

  it('does not hydrate keys NOT in the list', () => {
    localStorage.setItem(
      'test-store',
      JSON.stringify({ token: 'x', extra: 'y' }),
    );
    const store = proxy<{ token: string | null; extra: string }>({
      token: null,
      extra: 'original',
    });
    persistStore(store, 'test-store', ['token'] as const);
    expect(store.token).toBe('x');
    expect(store.extra).toBe('original');
  });
});

describe('persistStore — write on change', () => {
  it('persists listed keys after a store mutation', async () => {
    const store = proxy<{ token: string | null }>({ token: null });
    persistStore(store, 'test-store', ['token'] as const);

    store.token = 'fresh-token';
    await flush();

    const persisted = JSON.parse(
      localStorage.getItem('test-store') ?? '{}',
    ) as Record<string, unknown>;
    expect(persisted).toEqual({ token: 'fresh-token' });
  });

  it('does NOT persist keys outside the list', async () => {
    const store = proxy<{ token: string | null; loading: boolean }>({
      token: null,
      loading: false,
    });
    persistStore(store, 'test-store', ['token'] as const);

    store.loading = true;
    await flush();

    const persisted = JSON.parse(
      localStorage.getItem('test-store') ?? '{}',
    ) as Record<string, unknown>;
    expect(persisted).not.toHaveProperty('loading');
  });

  it('writes the current snapshot on every change', async () => {
    const store = proxy<{ token: string | null }>({ token: null });
    persistStore(store, 'test-store', ['token'] as const);

    store.token = 'one';
    await flush();
    expect(
      (JSON.parse(localStorage.getItem('test-store') ?? '{}') as {
        token: string;
      }).token,
    ).toBe('one');

    store.token = 'two';
    await flush();
    expect(
      (JSON.parse(localStorage.getItem('test-store') ?? '{}') as {
        token: string;
      }).token,
    ).toBe('two');
  });
});
