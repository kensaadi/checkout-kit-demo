type CalloutVariant = 'info' | 'warning' | 'success' | 'tip';

const variants: Record<
  CalloutVariant,
  { bg: string; border: string; emoji: string; label: string }
> = {
  info: { bg: '#EFF6FF', border: '#BFDBFE', emoji: 'ℹ️', label: 'Note' },
  warning: { bg: '#FFFBEB', border: '#FDE68A', emoji: '⚠️', label: 'Warning' },
  success: { bg: '#F0FDF4', border: '#BBF7D0', emoji: '✅', label: 'Good to know' },
  tip: { bg: '#FAF5FF', border: '#E9D5FF', emoji: '💡', label: 'Tip' },
};

type Props = {
  variant?: CalloutVariant;
  title?: string;
  children: React.ReactNode;
};

export function Callout({ variant = 'info', title, children }: Props) {
  const v = variants[variant];
  return (
    <div
      style={{
        marginTop: 20,
        marginBottom: 20,
        padding: '14px 18px',
        borderRadius: '8px',
        background: v.bg,
        borderLeft: `4px solid ${v.border}`,
      }}
    >
      <div
        style={{
          fontWeight: 600,
          fontSize: '13.5px',
          marginBottom: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          color: '#1a1a1a',
        }}
      >
        <span>{v.emoji}</span>
        <span>{title ?? v.label}</span>
      </div>
      <div style={{ fontSize: '13.5px', lineHeight: 1.65, color: '#374151' }}>
        {children}
      </div>
    </div>
  );
}
