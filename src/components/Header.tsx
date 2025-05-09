
import { Bell, Shield, Moon, Sun, ShieldAlert } from 'lucide-react';
import StatusIndicator from './StatusIndicator';
import { ServerStatus } from '@/hooks/useWebSocket';
import { useTheme } from './ThemeProvider';
import { Button } from './ui/button';

interface HeaderProps {
  status: ServerStatus;
}

const Header = ({ status }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className="bg-gray-900 dark:bg-gray-900 light:bg-gray-100 text-white light:text-gray-900 p-4 flex justify-between items-center border-b border-gray-700 dark:border-gray-700 light:border-gray-300 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <ShieldAlert size={24} className="text-blue-400 dark:text-blue-400 light:text-blue-600" />
        <h1 className="text-xl font-bold">Nagios Host Monitoring System</h1>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full" aria-label="Toggle theme">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <StatusIndicator status={status} />
      </div>
    </header>
  );
};

export default Header;
