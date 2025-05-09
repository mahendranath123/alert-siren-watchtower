
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Bell, AlertTriangle, XCircle, Siren, MonitorX } from 'lucide-react';
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
      // Use a higher volume for Nagios alerts
      const isNagiosAlert = alert.source === 'nagios';
      playAlertSound(isNagiosAlert ? 2.5 : 1.5); // Even louder for Nagios
      
      // Scroll into view if necessary
      if (panelRef.current) {
        panelRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [alert?.id]);

  if (!alert) return null;

  // Check if this is a Nagios alert
  const isNagiosAlert = alert.source === 'nagios';
  const alertIcon = isNagiosAlert ? <Siren className="h-5 w-5 animate-pulse text-red-400" /> : <MonitorX className="h-5 w-5 animate-pulse text-red-400" />;
  const alertTitle = isNagiosAlert ? `Nagios Critical Alert - ${alert.hostname || 'Unknown Host'}` : "Critical Alert Detected!";
  const alertClass = isNagiosAlert ? "bg-red-950/60 border-red-600 animate-shake" : "bg-red-900/50 border-red-500 animate-shake";

  return (
    <div 
      ref={panelRef}
      className="animate-slide-in mb-6"
    >
      <Alert variant="destructive" className={alertClass}>
        {alertIcon}
        <AlertTitle className="text-red-200 flex justify-between items-center">
          <span>{alertTitle}</span>
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
          {alert.hostname && (
            <div className="mt-1 bg-red-950/70 p-1 rounded border border-red-800">
              <span className="font-bold">Host:</span> {alert.hostname} 
              {alert.status && (
                <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                  alert.status === 'DOWN' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                }`}>
                  {alert.status}
                </span>
              )}
            </div>
          )}
          <div className="text-xs opacity-75 mt-1">
            {new Date(alert.timestamp).toLocaleTimeString()}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default AlertPanel;
