import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

type Props = {
  code: string;
  language?: string;
  filename?: string;
};

/**
 * Stripe-docs-style code block: traffic-light header, optional
 * filename, language label, copy button. Body uses vscDarkPlus
 * syntax theme regardless of the app's light/dark mode — same
 * choice the registration-kit makes, keeps code samples readable
 * everywhere.
 */
export function CodeBlock({ code, language = 'typescript', filename }: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      style={{
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #2d2d2d',
        marginTop: 20,
        marginBottom: 20,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 6,
          paddingBottom: 6,
          background: '#1e1e1e',
          borderBottom: '1px solid #2d2d2d',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
          {filename && (
            <span
              style={{
                marginLeft: 12,
                fontSize: '12px',
                color: '#858585',
                fontFamily: 'monospace',
              }}
            >
              {filename}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '11px', color: '#555', textTransform: 'lowercase' }}>
            {language}
          </span>
          <button
            type="button"
            title={copied ? 'Copied!' : 'Copy'}
            onClick={handleCopy}
            style={{
              appearance: 'none',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: copied ? '#09B675' : '#858585',
              padding: 4,
            }}
          >
            {copied ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '20px 24px',
          fontSize: '13.5px',
          lineHeight: '1.6',
          background: '#1e1e1e',
          borderRadius: 0,
        }}
        showLineNumbers={code.trim().split('\n').length > 6}
        lineNumberStyle={{ color: '#404040', minWidth: '2.5em' }}
      >
        {code.trim()}
      </SyntaxHighlighter>
    </div>
  );
}

export function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code
      style={{
        fontFamily: 'monospace',
        fontSize: '13px',
        paddingLeft: '5px',
        paddingRight: '5px',
        paddingTop: '2px',
        paddingBottom: '2px',
        borderRadius: '4px',
        background: '#F3F3F3',
        border: '1px solid #E8E8E8',
        color: '#1a1a1a',
      }}
    >
      {children}
    </code>
  );
}
