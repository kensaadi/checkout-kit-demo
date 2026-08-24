type Step = { title: string; description: React.ReactNode };

export function StepList({ steps }: { steps: Step[] }) {
  return (
    <div style={{ marginTop: 20, marginBottom: 20 }}>
      {steps.map((step, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            gap: 16,
            marginBottom: i < steps.length - 1 ? 20 : 0,
          }}
        >
          <div
            style={{
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#000',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </div>
            {i < steps.length - 1 && (
              <div
                style={{ width: '1px', flex: 1, background: '#EEEEEE', marginTop: 6 }}
              />
            )}
          </div>
          <div style={{ paddingBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: 4 }}>
              {step.title}
            </div>
            <div
              style={{ fontSize: '14px', color: '#545454', lineHeight: 1.65 }}
            >
              {step.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
