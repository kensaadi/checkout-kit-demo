import { useEffect, useState } from 'react';

type Props = {
  /** Which selector is the visitor on that we don't have content for? */
  flavor: 'tailwind' | 'node';
};

const LABELS = {
  tailwind: {
    title: 'Tailwind flavor — coming soon',
    body: 'The Tailwind variant of the kit ships next. For now, switch the FE selector back to MUI to see the live documentation.',
    selectorHint: 'FE: MUI',
  },
  node: {
    title: 'Node backend — coming soon',
    body: 'The Node.js backend variant ships next. For now, switch the BE selector back to Go to see the live documentation.',
    selectorHint: 'BE: Go',
  },
} as const;

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
 * Placeholder shown when the visitor selects a flavor we have not
 * shipped content for yet. The microcopy points back at the
 * selector they need to flip so they don't bounce.
 */
export function ComingSoonEmpty({ flavor }: Props) {
  const l = LABELS[flavor];
  const isMdUp = useIsMdUp();
  return (
    <div
      style={{
        marginTop: 32,
        marginBottom: 32,
        padding: isMdUp ? 48 : 32,
        borderRadius: '12px',
        border: '1px dashed #E5E7EB',
        background: 'linear-gradient(135deg, #FAFAFA 0%, #F3F4F6 100%)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: '#fff',
          border: '1px solid #E5E7EB',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="#9CA3AF" aria-hidden>
          <path d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zm-4-5l-4-4V4h8v3.5l-4 4z" />
        </svg>
      </div>
      <div
        style={{ fontSize: '20px', fontWeight: 700, marginBottom: 8, color: '#1a1a1a' }}
      >
        {l.title}
      </div>
      <div
        style={{
          fontSize: '14px',
          color: '#6B7280',
          lineHeight: 1.6,
          maxWidth: 460,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {l.body}
      </div>
      <div
        style={{
          marginTop: 24,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 8,
          paddingBottom: 8,
          borderRadius: '999px',
          background: '#fff',
          border: '1px solid #E5E7EB',
          fontSize: '12px',
          color: '#6B7280',
          fontFamily: 'monospace',
        }}
      >
        ↑ Switch the top-bar selector to{' '}
        <span style={{ fontWeight: 700, color: '#000' }}>
          {l.selectorHint}
        </span>
      </div>
    </div>
  );
}
