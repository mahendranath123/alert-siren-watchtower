
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogEntry } from '@/hooks/useWebSocket';
import { cn } from '@/lib/utils';

interface LogMonitorProps {
  logs: LogEntry[];
}

const LogMonitor = ({ logs }: LogMonitorProps) => {
  const [filter, setFilter] = useState<string | null>(null);
  
  const filteredLogs = filter 
    ? logs.filter(log => log.level === filter)
    : logs;
  
  const getLevelColor = (level: string) => {
    switch(level) {
      case 'info': return 'bg-blue-500 hover:bg-blue-600';
      case 'warning': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'error': return 'bg-red-500 hover:bg-red-600';
      case 'critical': return 'bg-red-700 hover:bg-red-800';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };
  
  return (
    <Card className="bg-gray-900 border-gray-700 shadow-lg">
      <CardHeader className="border-b border-gray-800 pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-white text-lg">Log Monitor</CardTitle>
          <div className="flex gap-2">
            <Badge 
              className={cn(
                "cursor-pointer", 
                filter === 'info' ? 'bg-blue-500' : 'bg-blue-500/30'
              )}
              onClick={() => setFilter(filter === 'info' ? null : 'info')}
            >
              Info
            </Badge>
            <Badge 
              className={cn(
                "cursor-pointer", 
                filter === 'warning' ? 'bg-yellow-500' : 'bg-yellow-500/30'
              )}
              onClick={() => setFilter(filter === 'warning' ? null : 'warning')}
            >
              Warning
            </Badge>
            <Badge 
              className={cn(
                "cursor-pointer", 
                filter === 'error' || filter === 'critical' ? 'bg-red-500' : 'bg-red-500/30'
              )}
              onClick={() => setFilter(filter === 'error' || filter === 'critical' ? null : 'error')}
            >
              Error/Critical
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 max-h-[500px] overflow-y-auto scrollbar-thin">
        <div className="divide-y divide-gray-800">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div 
                key={log.id} 
                className={cn(
                  "p-3 text-sm flex items-start gap-3 animate-fade-in",
                  log.level === 'critical' && "bg-red-900/20"
                )}
              >
                <Badge className={cn("mt-0.5", getLevelColor(log.level))}>
                  {log.level.toUpperCase()}
                </Badge>
                <div className="flex-1">
                  <div className={cn(
                    "font-mono",
                    log.level === 'critical' && "font-bold text-red-400"
                  )}>
                    {log.message}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              No logs matching the current filter
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LogMonitor;
