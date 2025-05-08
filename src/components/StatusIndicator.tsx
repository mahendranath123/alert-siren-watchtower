
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ServerStatus } from '@/hooks/useWebSocket';

interface StatusIndicatorProps {
  status: ServerStatus;
}

const StatusIndicator = ({ status }: StatusIndicatorProps) => {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    const updateTimeAgo = () => {
      const seconds = Math.floor((new Date().getTime() - status.lastUpdate.getTime()) / 1000);
      
      if (seconds < 60) {
        setTimeAgo(`${seconds} sec ago`);
      } else if (seconds < 3600) {
        setTimeAgo(`${Math.floor(seconds / 60)} min ago`);
      } else {
        setTimeAgo(`${Math.floor(seconds / 3600)} hr ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 10000);
    return () => clearInterval(interval);
  }, [status.lastUpdate]);

  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        "h-3 w-3 rounded-full",
        status.status === 'connected' ? "bg-green-500 animate-pulse" : 
        status.status === 'error' ? "bg-red-500" : "bg-yellow-500"
      )}></div>
      <div className="text-sm">
        <span className="font-medium">
          {status.status === 'connected' ? 'Monitor Active' : 
           status.status === 'error' ? 'Connection Error' : 'Disconnected'}
        </span>
        <span className="text-xs text-gray-400 ml-2">{timeAgo}</span>
      </div>
    </div>
  );
};

export default StatusIndicator;
