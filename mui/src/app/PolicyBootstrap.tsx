import { useEffect, type ReactNode } from 'react';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { RbacProvider } from '@dashforge/rbac';
import type { RbacPolicy } from '@dashforge/rbac';
import { useSnapshot } from 'valtio';
import {
  loadPolicy,
  policiesStore,
} from '@shared/store/policies.store';
import { useUser } from '@shared/store/user.store';
import { SplashScreen } from '../components/layout/SplashScreen';

/**
 * Boot-phase wrapper.
 *
 * On mount, kicks off the policy fetch. Three states:
 *
 *   loading → <SplashScreen />
 *   error   → inline retry screen
 *   ready   → <RbacProvider> with subject from userStore
 *
 * Once mounted in 'ready', the RbacProvider stays mounted for the
 * lifetime of the session. The subject prop is reactively pulled
 * from userStore — a login / logout updates RBAC decisions
 * automatically without a re-bootstrap.
 *
 * Failure UX is intentionally simple: a centred Alert + Retry
 * button. The kit's buyer can replace this with their own brand
 * tone — single component, single file.
 */
export function PolicyBootstrap({ children }: { children: ReactNode }) {
  const snap = useSnapshot(policiesStore);
  const { user } = useUser();

  useEffect(() => {
    loadPolicy();
  }, []);

  if (snap.status === 'loading') {
    return <SplashScreen />;
  }

  if (snap.status === 'error') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          bgcolor: 'background.default',
        }}
      >
        <Stack spacing={2} sx={{ maxWidth: 480, width: '100%' }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            checkout-kit
          </Typography>
          <Alert severity="error">
            Failed to load the access policy: {snap.error}
          </Alert>
          <Button variant="contained" onClick={() => loadPolicy()}>
            Retry
          </Button>
        </Stack>
      </Box>
    );
  }

  // status === 'ready' — `policy` is non-null here. We cast the
  // readonly snapshot back to a mutable RbacPolicy at this
  // boundary: useSnapshot freezes the shape for React safety,
  // but RbacProvider treats the prop as input-only and never
  // mutates it. Cast confined to this one line.
  return (
    <RbacProvider
      policy={snap.policy as RbacPolicy}
      subject={
        user ? { id: user.id, roles: [...user.roles] } : null
      }
    >
      {children}
    </RbacProvider>
  );
}
