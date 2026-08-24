import { useLocation, useNavigate } from 'react-router-dom';
import { docsNavigation } from '../navigation';
import { useDocs } from '../DocsContext';

const SIDEBAR_WIDTH = 264;

/**
 * Sidebar inspired by the registration-kit docs layout. Reads
 * the current version from DocsContext so the header version
 * stays in sync with the top-bar selector.
 */
type Props = { onClose?: () => void };

export function DocsSidebar({ onClose }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const { version } = useDocs();

  function handleNav(path: string) {
    navigate(path);
    onClose?.();
  }

  return (
    <div
      style={{
        width: SIDEBAR_WIDTH,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        borderRight: '1px solid #EEEEEE',
        overflowY: 'auto',
      }}
    >
      {/* Logo */}
      <div
        style={{
          paddingLeft: 24,
          paddingRight: 24,
          paddingTop: 20,
          paddingBottom: 20,
          borderBottom: '1px solid #EEEEEE',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          cursor: 'pointer',
          flexShrink: 0,
        }}
        onClick={() => handleNav('/docs')}
      >
        <svg
          viewBox="0 0 512 512"
          style={{ width: 32, height: 32, flexShrink: 0 }}
          aria-hidden
        >
          <defs>
            <linearGradient id="docs-brand-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
          <rect width="512" height="512" rx="96" fill="url(#docs-brand-grad)" />
          <path
            d="M 156 232 L 356 232 L 376 404 Q 376 420 360 420 L 152 420 Q 136 420 136 404 Z"
            fill="#FFFFFF"
          />
          <path
            d="M 210 232 Q 210 168 256 168 Q 302 168 302 232"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={26}
            strokeLinecap="round"
          />
          <path
            d="M 196 322 L 240 366 L 322 280"
            fill="none"
            stroke="url(#docs-brand-grad)"
            strokeWidth={38}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div>
          <div style={{ fontWeight: 700, fontSize: '14px', lineHeight: 1.2 }}>
            Checkout Kit
          </div>
          <div style={{ fontSize: '11px', color: '#8A8A8A', lineHeight: 1 }}>
            {version} · Documentation
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, paddingLeft: 12, paddingRight: 12, paddingTop: 16, paddingBottom: 16 }}>
        {docsNavigation.map((section) => (
          <div key={section.section} style={{ marginBottom: 20 }}>
            <div
              style={{
                paddingLeft: 12,
                paddingRight: 12,
                marginBottom: 4,
                fontSize: '11px',
                fontWeight: 700,
                color: '#8A8A8A',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {section.section}
            </div>
            <div>
              {section.items.map((item) => {
                const isActive =
                  item.path === '/docs'
                    ? location.pathname === '/docs'
                    : location.pathname.startsWith(item.path);

                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleNav(item.path)}
                    style={{
                      appearance: 'none',
                      border: 'none',
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      paddingLeft: 12,
                      paddingRight: 12,
                      paddingTop: 6,
                      paddingBottom: 6,
                      marginBottom: 2,
                      gap: 8,
                      background: isActive ? '#000' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                  >
                    <span style={{ fontSize: '15px', lineHeight: 1 }}>
                      {item.emoji}
                    </span>
                    <span
                      style={{
                        fontSize: '13.5px',
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? '#fff' : '#1a1a1a',
                        lineHeight: 1,
                      }}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          paddingLeft: 24,
          paddingRight: 24,
          paddingTop: 16,
          paddingBottom: 16,
          borderTop: '1px solid #EEEEEE',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <a
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '12px',
            fontWeight: 600,
            color: '#000',
            textDecoration: 'none',
          }}
        >
          ← Back to app
        </a>
        <div style={{ fontSize: '11.5px', color: '#8A8A8A' }}>
          Built with{' '}
          <a
            href="https://dashforge-ui.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#000', fontWeight: 600, textDecoration: 'none' }}
          >
            DashForge
          </a>
        </div>
      </div>
    </div>
  );
}

export { SIDEBAR_WIDTH };
