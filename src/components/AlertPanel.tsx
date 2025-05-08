
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Bell, XCircle } from 'lucide-react';
import { LogEntry } from '@/hooks/useWebSocket';
import { playAlertSound } from '@/utils/audioUtils';

interface AlertPanelProps {
  alert: LogEntry | null;
  onClear: () => void;
}

const AlertPanel = ({ alert, onClear }: AlertPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (alert) {
      // Play alert sound when a new alert comes in
      playAlertSound();
      
      // Scroll into view if necessary
      if (panelRef.current) {
        panelRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [alert?.id]);

  if (!alert) return null;

  return (
    <div 
      ref={panelRef}
      className="animate-slide-in mb-6"
    >
      <Alert variant="destructive" className="bg-red-900/50 border-red-500 animate-shake">
        <Bell className="h-5 w-5 animate-pulse text-red-400" />
        <AlertTitle className="text-red-200 flex justify-between items-center">
          <span>Critical Alert Detected!</span>
          <Button 
            variant="ghost" 
            className="h-8 w-8 p-0 text-red-300 hover:text-white hover:bg-red-800"
            onClick={onClear}
          >
            <XCircle size={18} />
          </Button>
        </AlertTitle>
        <AlertDescription className="text-red-100 mt-2 font-mono text-sm">
          {alert.message}
          <div className="text-xs opacity-75 mt-1">
            {new Date(alert.timestamp).toLocaleTimeString()}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default AlertPanel;
