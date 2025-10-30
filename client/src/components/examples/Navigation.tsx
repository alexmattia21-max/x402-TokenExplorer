import Navigation from '../Navigation';
import { ThemeProvider } from '@/hooks/use-theme';

export default function NavigationExample() {
  return (
    <ThemeProvider>
      <div className="bg-background min-h-screen">
        <Navigation />
      </div>
    </ThemeProvider>
  );
}
