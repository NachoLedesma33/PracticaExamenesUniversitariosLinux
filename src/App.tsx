import { Layout } from './components/Layout';
import { useTerminalStore } from './store/useTerminalStore';

export default function App() {
  const theme = useTerminalStore((s) => s.theme);

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <Layout />
    </div>
  );
}
