import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DOC_VERSIONS, flatNavItems } from '../navigation';
import { useDocs } from '../DocsContext';

type Props = {
  onMenuOpen: () => void;
  isMobile: boolean;
};

/** True when the viewport is at the MUI `md` breakpoint or wider (>= 900px). */
function useIsMdUp(): boolean {
  const [isMdUp, setIsMdUp] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(min-width: 900px)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)');
    const onChange = () => setIsMdUp(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isMdUp;
}

/**
 * Sticky top bar with breadcrumbs + the three docs selectors:
 *   - version (dropdown — v1.0.0 today, append to DOC_VERSIONS)
 *   - frontend flavor (MUI ⇄ Tailwind — Tailwind = coming soon)
 *   - backend flavor  (Go  ⇄ Node     — Node = coming soon)
 *
 * Glass effect + sticky position so it stays visible while
 * scrolling through long pages.
 */
export function DocsTopBar({ onMenuOpen, isMobile }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const { version, fe, be, setVersion, setFe, setBe } = useDocs();
  const [versionOpen, setVersionOpen] = useState(false);
  const isMdUp = useIsMdUp();

  const currentItem = flatNavItems.find((i) =>
    i.path === '/docs'
      ? location.pathname === '/docs'
      : location.pathname.startsWith(i.path),
  );

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        minHeight: 52,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: isMdUp ? 24 : 16,
        paddingRight: isMdUp ? 24 : 16,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #EEEEEE',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      {isMobile && (
        <button
          type="button"
          onClick={onMenuOpen}
          style={{
            appearance: 'none',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1a1a1a',
            padding: 4,
            marginRight: 4,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: '13px',
          color: '#8A8A8A',
          flex: 1,
        }}
      >
        <span
          onClick={() => navigate('/docs')}
          style={{
            fontSize: '13px',
            color: '#8A8A8A',
            cursor: 'pointer',
          }}
        >
          Docs
        </span>
        {currentItem && (
          <>
            <span aria-hidden style={{ color: '#8A8A8A' }}>
              ›
            </span>
            <span
              style={{ fontSize: '13px', color: '#1a1a1a', fontWeight: 500 }}
            >
              {currentItem.label}
            </span>
          </>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
          paddingTop: 8,
          paddingBottom: 8,
        }}
      >
        {/* Version selector */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setVersionOpen((o) => !o)}
            style={{
              appearance: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              paddingLeft: 10,
              paddingRight: 10,
              paddingTop: 4,
              paddingBottom: 4,
              borderRadius: '999px',
              border: '1px solid #E5E7EB',
              background: '#fff',
              fontSize: '12px',
              fontWeight: 700,
              color: '#1a1a1a',
              letterSpacing: '0.01em',
            }}
          >
            {version} ▾
          </button>
          {versionOpen && (
            <>
              <div
                onClick={() => setVersionOpen(false)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 20,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  zIndex: 21,
                  minWidth: 180,
                  background: '#fff',
                  borderRadius: '4px',
                  border: '1px solid #EEEEEE',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                  paddingTop: 8,
                  paddingBottom: 8,
                  overflow: 'hidden',
                }}
              >
                {DOC_VERSIONS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      setVersion(v);
                      setVersionOpen(false);
                    }}
                    style={{
                      appearance: 'none',
                      border: 'none',
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '13.5px',
                      color: '#1a1a1a',
                      paddingLeft: 16,
                      paddingRight: 16,
                      paddingTop: 6,
                      paddingBottom: 6,
                      background: v === version ? 'rgba(0,0,0,0.04)' : 'transparent',
                    }}
                  >
                    <span
                      style={{
                        minWidth: 28,
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      {v === version ? (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="#000"
                        >
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      ) : (
                        <span style={{ width: 20 }} />
                      )}
                    </span>
                    {v}
                  </button>
                ))}
                <div
                  style={{
                    fontSize: '12px',
                    color: '#9CA3AF',
                    fontStyle: 'italic',
                    paddingLeft: 16,
                    paddingRight: 16,
                    paddingTop: 6,
                    paddingBottom: 6,
                    cursor: 'default',
                  }}
                >
                  More versions coming
                </div>
              </div>
            </>
          )}
        </div>

        {/* FE flavor toggle */}
        <SegmentedToggle
          label="FE"
          value={fe}
          options={[
            { value: 'mui', label: 'MUI' },
            { value: 'tailwind', label: 'Tailwind' },
          ]}
          onChange={(v) => setFe(v as 'mui' | 'tailwind')}
        />

        {/* BE flavor toggle */}
        <SegmentedToggle
          label="BE"
          value={be}
          options={[
            { value: 'go', label: 'Go' },
            { value: 'node', label: 'Node' },
          ]}
          onChange={(v) => setBe(v as 'go' | 'node')}
        />
      </div>
    </div>
  );
}

function SegmentedToggle({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: 2,
        borderRadius: '999px',
        border: '1px solid #E5E7EB',
        background: '#fff',
      }}
    >
      <div
        style={{
          fontSize: '10.5px',
          fontWeight: 700,
          color: '#9CA3AF',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginLeft: 8,
          marginRight: 4,
        }}
      >
        {label}
      </div>
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              appearance: 'none',
              border: 'none',
              cursor: 'pointer',
              paddingLeft: 10,
              paddingRight: 10,
              paddingTop: 3,
              paddingBottom: 3,
              borderRadius: '999px',
              background: isActive ? '#000' : 'transparent',
              color: isActive ? '#fff' : '#1a1a1a',
              fontSize: '12px',
              fontWeight: isActive ? 700 : 500,
              transition: 'background-color .15s ease, color .15s ease',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
