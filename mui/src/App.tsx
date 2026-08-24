import { AppProviders } from './app/AppProviders';
import { AppRouter } from './app/AppRouter';
import { DocsFab } from './components/DocsFab';

export function App() {
  return (
    <AppProviders>
      <AppRouter />
      <DocsFab />
    </AppProviders>
  );
}
