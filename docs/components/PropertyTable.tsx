export type PropertyRow = {
  name: string;
  type: string;
  required?: boolean;
  description: string;
  defaultValue?: string;
};

type Props = { rows: PropertyRow[]; caption?: string };

export function PropertyTable({ rows, caption }: Props) {
  return (
    <div style={{ marginTop: 20, marginBottom: 20 }}>
      {caption && (
        <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: 8 }}>
          {caption}
        </div>
      )}
      <div
        style={{
          borderRadius: '8px',
          border: '1px solid #EEEEEE',
          overflow: 'hidden',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'auto',
          }}
        >
          <thead>
            <tr style={{ background: '#F9F9F9' }}>
              {['Name', 'Type', 'Required', 'Description'].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: 'left',
                    fontWeight: 600,
                    fontSize: '12px',
                    color: '#6B7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    paddingTop: 10,
                    paddingBottom: 10,
                    paddingLeft: 16,
                    paddingRight: 16,
                    borderBottom: '1px solid #EEEEEE',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.name}
                style={{
                  background: i % 2 === 0 ? '#fff' : '#FAFAFA',
                }}
              >
                <td
                  style={{
                    paddingTop: 10,
                    paddingBottom: 10,
                    paddingLeft: 16,
                    paddingRight: 16,
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#1a1a1a',
                    borderBottom: i < rows.length - 1 ? '1px solid #EEEEEE' : 0,
                  }}
                >
                  {row.name}
                </td>
                <td
                  style={{
                    paddingTop: 10,
                    paddingBottom: 10,
                    paddingLeft: 16,
                    paddingRight: 16,
                    borderBottom: i < rows.length - 1 ? '1px solid #EEEEEE' : 0,
                  }}
                >
                  <code
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      paddingLeft: '6px',
                      paddingRight: '6px',
                      paddingTop: '2px',
                      paddingBottom: '2px',
                      borderRadius: '4px',
                      background: '#F3F3F3',
                      color: '#7C3AED',
                    }}
                  >
                    {row.type}
                  </code>
                </td>
                <td
                  style={{
                    paddingTop: 10,
                    paddingBottom: 10,
                    paddingLeft: 16,
                    paddingRight: 16,
                    borderBottom: i < rows.length - 1 ? '1px solid #EEEEEE' : 0,
                  }}
                >
                  {row.required ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        height: 20,
                        padding: '0 8px',
                        borderRadius: '999px',
                        background: '#FEE2E2',
                        color: '#991B1B',
                        fontWeight: 600,
                      }}
                    >
                      required
                    </span>
                  ) : (
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
                        color: '#6B7280',
                      }}
                    >
                      optional
                    </span>
                  )}
                </td>
                <td
                  style={{
                    paddingTop: 10,
                    paddingBottom: 10,
                    paddingLeft: 16,
                    paddingRight: 16,
                    fontSize: '13.5px',
                    color: '#374151',
                    borderBottom: i < rows.length - 1 ? '1px solid #EEEEEE' : 0,
                  }}
                >
                  {row.description}
                  {row.defaultValue && (
                    <span
                      style={{ marginLeft: 4, fontSize: '12px', color: '#9CA3AF' }}
                    >
                      (default: <code>{row.defaultValue}</code>)
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
