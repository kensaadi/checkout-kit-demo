import { CodeBlock } from './CodeBlock';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const methodColors: Record<HttpMethod, { bg: string; color: string }> = {
  GET: { bg: '#DBEAFE', color: '#1D4ED8' },
  POST: { bg: '#D1FAE5', color: '#065F46' },
  PUT: { bg: '#FEF3C7', color: '#92400E' },
  PATCH: { bg: '#EDE9FE', color: '#5B21B6' },
  DELETE: { bg: '#FEE2E2', color: '#991B1B' },
};

type Props = {
  method: HttpMethod;
  path: string;
  description: string;
  auth?: boolean;
  requestExample?: string;
  responseExample?: string;
};

export function ApiEndpoint({
  method,
  path,
  description,
  auth,
  requestExample,
  responseExample,
}: Props) {
  const mc = methodColors[method];

  return (
    <div
      style={{
        marginTop: 24,
        marginBottom: 24,
        border: '1px solid #EEEEEE',
        borderRadius: '10px',
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          paddingLeft: 20,
          paddingRight: 20,
          paddingTop: 14,
          paddingBottom: 14,
          background: '#F9F9F9',
          borderBottom: '1px solid #EEEEEE',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: mc.bg,
            color: mc.color,
            fontWeight: 700,
            fontSize: '11.5px',
            height: 22,
            padding: '0 8px',
            borderRadius: '4px',
            letterSpacing: '0.05em',
          }}
        >
          {method}
        </span>
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: '14px',
            fontWeight: 600,
            color: '#1a1a1a',
            flex: 1,
          }}
        >
          {path}
        </span>
        {auth && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              height: 20,
              padding: '0 8px',
              borderRadius: '999px',
              background: '#F3F4F6',
              color: '#374151',
            }}
          >
            🔐 Auth required
          </span>
        )}
      </div>

      <div
        style={{
          paddingLeft: 20,
          paddingRight: 20,
          paddingTop: 12,
          paddingBottom: requestExample || responseExample ? 0 : 16,
        }}
      >
        <div style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6 }}>
          {description}
        </div>
      </div>

      {(requestExample || responseExample) && (
        <div style={{ paddingLeft: 20, paddingRight: 20, paddingBottom: 16 }}>
          {requestExample && (
            <>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#6B7280',
                  marginTop: 16,
                  marginBottom: 4,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Request body
              </div>
              <CodeBlock code={requestExample} language="json" />
            </>
          )}
          {responseExample && (
            <>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#6B7280',
                  marginTop: 12,
                  marginBottom: 4,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Response
              </div>
              <CodeBlock code={responseExample} language="json" />
            </>
          )}
        </div>
      )}
    </div>
  );
}
