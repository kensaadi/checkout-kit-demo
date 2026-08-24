import { useState, type ReactNode } from 'react';
import {
  Box,
  Chip,
  Divider,
  Drawer,
  Fab,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import CodeIcon from '@mui/icons-material/CodeRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';

/**
 * Surface-level metadata that the "Inspect this page" drawer
 * renders. Each entry is a curated, hand-written hint about what
 * the page demonstrates and which kit features it exercises —
 * NOT a runtime introspection. Keeps the kit's intent legible to
 * an evaluating prospect without forcing them to read the source.
 */
export type InspectMetadata = {
  /** Short title in the drawer header. */
  title: string;
  /** Primary file backing this screen, relative to the repo root. */
  filePath: string;
  /** Approximate LOC of the primary file — included as a credibility
   *  signal ("this whole screen is 180 lines"). Manually-supplied. */
  lines: number;
  /** One-paragraph plain-English explanation of what the screen
   *  shows and why it's interesting. */
  summary: string;
  /** Bullet list of concrete kit features exercised by this screen. */
  features: string[];
  /** Tech stack labels rendered as chips. */
  stack: string[];
  /** Optional: API endpoints this screen hits, for the technically
   *  curious. */
  endpoints?: string[];
};

/**
 * Demo-only "Inspect this page" affordance. Renders a floating
 * action button bottom-right; click opens a drawer with the
 * curated metadata.
 *
 * NOT part of the kit's production surface — the kit's buyer
 * removes the `<InspectThisPage metadata={...} />` mount lines
 * to ship without it. Self-contained: no external deps beyond
 * MUI.
 */
export function InspectThisPage({ metadata }: { metadata: InspectMetadata }) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  return (
    <>
      <Tooltip title="Inspect this page" placement="left">
        <Fab
          color="primary"
          size="medium"
          onClick={() => setOpen(true)}
          sx={{
            position: 'fixed',
            bottom: { xs: 16, md: 24 },
            right: { xs: 16, md: 24 },
            zIndex: (t) => t.zIndex.fab,
            boxShadow: theme.tokens.shadow.lg,
          }}
          aria-label="Inspect this page"
        >
          <CodeIcon />
        </Fab>
      </Tooltip>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100%', sm: 420 },
              border: 'none',
            },
          },
        }}
      >
        <Box sx={{ p: 3, position: 'relative' }}>
          <IconButton
            onClick={() => setOpen(false)}
            sx={{ position: 'absolute', top: 12, right: 12 }}
            aria-label="Close"
          >
            <CloseIcon />
          </IconButton>

          <Stack spacing={3} sx={{ pt: 1 }}>
            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ display: 'block', mb: 0.5 }}
              >
                Inspect this page
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {metadata.title}
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: theme.tokens.radius.md + 'px',
                bgcolor: theme.tokens.colors.surfaceMuted,
                fontFamily: 'monospace',
                fontSize: '0.8rem',
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box
                  sx={{
                    color: theme.tokens.colors.textSecondary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={metadata.filePath}
                >
                  {metadata.filePath}
                </Box>
                <Chip
                  label={`${metadata.lines} LOC`}
                  size="small"
                  sx={{
                    bgcolor: theme.tokens.colors.primarySoft,
                    color: theme.tokens.colors.primary,
                    fontWeight: 700,
                    fontFamily: 'inherit',
                    flexShrink: 0,
                  }}
                />
              </Stack>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              {metadata.summary}
            </Typography>

            <Section title="Kit features exercised">
              <Stack spacing={1}>
                {metadata.features.map((feat) => (
                  <FeatureBullet key={feat}>{feat}</FeatureBullet>
                ))}
              </Stack>
            </Section>

            {metadata.endpoints && metadata.endpoints.length > 0 && (
              <Section title="API endpoints">
                <Stack spacing={1}>
                  {metadata.endpoints.map((ep) => (
                    <Box
                      key={ep}
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.78rem',
                        color: theme.tokens.colors.textSecondary,
                        bgcolor: theme.tokens.colors.surfaceMuted,
                        px: 1.5,
                        py: 0.75,
                        borderRadius: theme.tokens.radius.sm + 'px',
                      }}
                    >
                      {ep}
                    </Box>
                  ))}
                </Stack>
              </Section>
            )}

            <Divider />

            <Section title="Tech stack">
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: 'wrap', gap: 1 }}
              >
                {metadata.stack.map((s) => (
                  <Chip
                    key={s}
                    label={s}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                ))}
              </Stack>
            </Section>

            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: theme.tokens.radius.md + 'px',
                bgcolor: theme.tokens.colors.successSoft,
                color: theme.tokens.colors.success,
                fontSize: '0.8rem',
                lineHeight: 1.5,
              }}
            >
              💡 In your fork, delete{' '}
              <Box component="code" sx={{ fontFamily: 'monospace' }}>
                components/demo/
              </Box>{' '}
              and the four <code>{`<InspectThisPage />`}</code> mount
              lines to ship without this affordance.
            </Box>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: 'block',
          mb: 1.25,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function FeatureBullet({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
      <Box
        sx={{
          mt: 0.7,
          width: 6,
          height: 6,
          borderRadius: '50%',
          bgcolor: theme.tokens.colors.primary,
          flexShrink: 0,
        }}
      />
      <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.5 }}>
        {children}
      </Typography>
    </Stack>
  );
}
