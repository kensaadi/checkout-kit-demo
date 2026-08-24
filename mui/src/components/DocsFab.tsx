import { Box, Tooltip } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { keyframes } from '@emotion/react';

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.12); }
  70% { box-shadow: 0 0 0 10px rgba(0, 0, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
`;

/**
 * Floating shortcut to the documentation. Pinned bottom-LEFT on
 * every screen EXCEPT the docs themselves. Bottom-right is owned
 * by the InspectThisPage FAB — keeping the two on opposite
 * corners avoids any overlap on feature pages where both mount.
 */
export function DocsFab() {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname.startsWith('/docs')) return null;

  return (
    <Tooltip title="Documentation" placement="right" arrow>
      <Box
        onClick={() => navigate('/docs')}
        sx={{
          position: 'fixed',
          bottom: 28,
          left: 28,
          width: 52,
          height: 52,
          borderRadius: '14px',
          background: '#fff',
          border: '1.5px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 9999,
          animation: `${pulse} 2.5s ease-in-out infinite, ${float} 3s ease-in-out infinite`,
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            animation: 'none',
            transform: 'translateY(-2px) scale(1.05)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
          },
        }}
      >
        <Box
          sx={{
            color: '#1a1a1a',
            fontSize: '11px',
            fontWeight: 700,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            lineHeight: 1,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            userSelect: 'none',
          }}
        >
          Docs
        </Box>
      </Box>
    </Tooltip>
  );
}
