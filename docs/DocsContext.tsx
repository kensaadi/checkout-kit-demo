import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_BE,
  DEFAULT_DOC_VERSION,
  DEFAULT_FE,
  type BeFlavor,
  type DocVersion,
  type FeFlavor,
} from './navigation';

/**
 * Shared docs context. Three selectors persisted in localStorage
 * so the visitor's pick survives reloads and tab restores.
 *
 *   - version  → which kit version's documentation to show
 *   - fe       → MUI vs Tailwind (Tailwind is "coming soon" for v1)
 *   - be       → Go vs Node     (Node is "coming soon" for v1)
 *
 * Pages read the relevant selector(s) and either render the real
 * content or the `<ComingSoonEmpty>` placeholder.
 */
type DocsState = {
  version: DocVersion;
  fe: FeFlavor;
  be: BeFlavor;
  setVersion: (v: DocVersion) => void;
  setFe: (f: FeFlavor) => void;
  setBe: (b: BeFlavor) => void;
};

const KEY_VERSION = 'checkout-kit:docs:version';
const KEY_FE = 'checkout-kit:docs:fe';
const KEY_BE = 'checkout-kit:docs:be';

const DocsContext = createContext<DocsState | null>(null);

function read<T extends string>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const v = window.localStorage.getItem(key);
  return (v as T) || fallback;
}

export function DocsProvider({ children }: { children: ReactNode }) {
  const [version, setVersionState] = useState<DocVersion>(() =>
    read<DocVersion>(KEY_VERSION, DEFAULT_DOC_VERSION),
  );
  const [fe, setFeState] = useState<FeFlavor>(() =>
    read<FeFlavor>(KEY_FE, DEFAULT_FE),
  );
  const [be, setBeState] = useState<BeFlavor>(() =>
    read<BeFlavor>(KEY_BE, DEFAULT_BE),
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY_VERSION, version);
    } catch {
      // private mode — drop silently
    }
  }, [version]);
  useEffect(() => {
    try {
      window.localStorage.setItem(KEY_FE, fe);
    } catch {
      // ignore
    }
  }, [fe]);
  useEffect(() => {
    try {
      window.localStorage.setItem(KEY_BE, be);
    } catch {
      // ignore
    }
  }, [be]);

  return (
    <DocsContext.Provider
      value={{
        version,
        fe,
        be,
        setVersion: setVersionState,
        setFe: setFeState,
        setBe: setBeState,
      }}
    >
      {children}
    </DocsContext.Provider>
  );
}

export function useDocs(): DocsState {
  const ctx = useContext(DocsContext);
  if (!ctx) throw new Error('useDocs must be used within DocsProvider');
  return ctx;
}
