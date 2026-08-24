import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { DocsSidebar, SIDEBAR_WIDTH } from './DocsSidebar';
import { DocsTopBar } from './DocsTopBar';
import { getPrevNext } from '../navigation';

/** True when the viewport is below the MUI `md` breakpoint (< 900px). */
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 900px)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isMobile;
}

/**
 * Top-level shell for the documentation: fixed sidebar (desktop)
 * or drawer (mobile), sticky topbar with the three selectors, an
 * Outlet for the active page, and prev/next chips at the bottom.
 *
 * Style: white + minimal — the docs intentionally do NOT follow
 * the app's light/dark mode. Same convention as Stripe / Vercel
 * / Linear docs: easier to read code samples in a single mode.
 */
export function DocsLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { prev, next } = getPrevNext(location.pathname);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fff' }}>
      {!isMobile && (
        <div
          style={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
          }}
        >
          <DocsSidebar />
        </div>
      )}

      {isMobile && mobileOpen && (
        <>
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 1200,
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: SIDEBAR_WIDTH,
              background: '#fff',
              zIndex: 1201,
              boxShadow: '0 8px 10px -5px rgba(0,0,0,0.2), 0 16px 24px 2px rgba(0,0,0,0.14)',
            }}
          >
            <DocsSidebar onClose={() => setMobileOpen(false)} />
          </div>
        </>
      )}

      <main
        style={{
          flex: 1,
          marginLeft: isMobile ? 0 : SIDEBAR_WIDTH,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <DocsTopBar
          onMenuOpen={() => setMobileOpen(true)}
          isMobile={isMobile}
        />

        <div style={{ display: 'flex', flex: 1 }}>
        <div
          style={{
            paddingLeft: isMobile ? 24 : 48,
            paddingRight: isMobile ? 24 : 48,
            paddingTop: 40,
            paddingBottom: 40,
            maxWidth: 860,
            width: '100%',
            flex: 1,
            minWidth: 0,
          }}
        >
          <Outlet />

          {(prev || next) && (
            <div
              style={{
                marginTop: 64,
                paddingTop: 24,
                borderTop: '1px solid #EEEEEE',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              {prev ? (
                <button
                  type="button"
                  onClick={() => navigate(prev.path)}
                  style={{
                    appearance: 'none',
                    cursor: 'pointer',
                    border: '1px solid #EEEEEE',
                    color: '#1a1a1a',
                    background: 'transparent',
                    textTransform: 'none',
                    borderRadius: '8px',
                    paddingLeft: 20,
                    paddingRight: 20,
                    paddingTop: 10,
                    paddingBottom: 10,
                    textAlign: 'left',
                  }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#8A8A8A',
                        lineHeight: 1,
                        marginBottom: 2,
                      }}
                    >
                      ← Previous
                    </div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600 }}>
                      {prev.emoji} {prev.label}
                    </div>
                  </div>
                </button>
              ) : (
                <div />
              )}

              {next ? (
                <button
                  type="button"
                  onClick={() => navigate(next.path)}
                  style={{
                    appearance: 'none',
                    cursor: 'pointer',
                    border: '1px solid #EEEEEE',
                    color: '#1a1a1a',
                    background: 'transparent',
                    textTransform: 'none',
                    borderRadius: '8px',
                    paddingLeft: 20,
                    paddingRight: 20,
                    paddingTop: 10,
                    paddingBottom: 10,
                    marginLeft: 'auto',
                    textAlign: 'right',
                  }}
                >
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#8A8A8A',
                        lineHeight: 1,
                        marginBottom: 2,
                      }}
                    >
                      Next →
                    </div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600 }}>
                      {next.emoji} {next.label}
                    </div>
                  </div>
                </button>
              ) : (
                <div />
              )}
            </div>
          )}
        </div>

        {/* Right banner — visible only on wide screens */}
        {!isMobile && (
          <div
            style={{
              width: 220,
              flexShrink: 0,
              paddingTop: 40,
              paddingRight: 24,
            }}
          >
            <div
              style={{
                position: 'sticky',
                top: 80,
                border: '1px solid #EEEEEE',
                borderRadius: 12,
                padding: '20px 16px',
                background: '#FAFAFA',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#8A8A8A', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                DashForge
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', lineHeight: 1.4 }}>
                Production-ready starter kits
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280', lineHeight: 1.5 }}>
                Full-stack kits with source code. One-time purchase, no subscription.
              </div>
              <a
                href="https://dashforge-ui.com/starter-kits"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  background: '#000',
                  color: '#fff',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  marginTop: 4,
                }}
              >
                Browse catalog →
              </a>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}
