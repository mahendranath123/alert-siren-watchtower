
import { Bell } from 'lucide-react';
import StatusIndicator from './StatusIndicator';
import { ServerStatus } from '@/hooks/useWebSocket';

interface HeaderProps {
  status: ServerStatus;
}

const Header = ({ status }: HeaderProps) => {
  return (
    <header className="bg-gray-900 text-white p-4 flex justify-between items-center border-b border-gray-700">
      <div className="flex items-center gap-3">
        <Bell size={24} className="text-blue-400" />
        <h1 className="text-xl font-bold">Alert Siren Watchtower</h1>
      </div>
      <StatusIndicator status={status} />
    </header>
  );
};

export default Header;
