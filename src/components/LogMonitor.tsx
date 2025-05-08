
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogEntry } from '@/hooks/useWebSocket';
import { cn } from '@/lib/utils';
import { useTheme } from './ThemeProvider';
import { Bell, Siren } from 'lucide-react';

interface LogMonitorProps {
  logs: LogEntry[];
}

const LogMonitor = ({ logs }: LogMonitorProps) => {
  const [filter, setFilter] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const { theme } = useTheme();
  
  const filteredLogs = logs.filter(log => {
    // Apply level filter if set
    if (filter && log.level !== filter) {
      return false;
    }
    
    // Apply source filter if set
    if (sourceFilter) {
      if (sourceFilter === 'nagios' && log.source !== 'nagios') {
        return false;
      }
      if (sourceFilter === 'system' && log.source === 'nagios') {
        return false;
      }
    }
    
    return true;
  });
  
  const getLevelColor = (level: string) => {
    switch(level) {
      case 'info': return 'bg-blue-500 hover:bg-blue-600';
      case 'warning': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'error': return 'bg-red-500 hover:bg-red-600';
      case 'critical': return 'bg-red-700 hover:bg-red-800';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };
  
  const isDarkMode = theme === 'dark';
  
  return (
    <Card className={cn(
      "border shadow-lg transition-colors duration-200",
      isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
    )}>
      <CardHeader className={cn(
        "border-b pb-3 transition-colors duration-200",
        isDarkMode ? "border-gray-800" : "border-gray-200"
      )}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <CardTitle className={cn(
            "text-lg",
            isDarkMode ? "text-white" : "text-gray-800"
          )}>Log Monitor</CardTitle>
          <div className="flex flex-wrap gap-2">
            {/* Source filters */}
            <div className="flex gap-2 mr-4">
              <Badge 
                className={cn(
                  "cursor-pointer flex items-center gap-1", 
                  sourceFilter === 'system' ? 'bg-purple-500' : isDarkMode ? 'bg-purple-500/30' : 'bg-purple-200'
                )}
                onClick={() => setSourceFilter(sourceFilter === 'system' ? null : 'system')}
              >
                <Bell size={12} /> System
              </Badge>
              <Badge 
                className={cn(
                  "cursor-pointer flex items-center gap-1", 
                  sourceFilter === 'nagios' ? 'bg-blue-500' : isDarkMode ? 'bg-blue-500/30' : 'bg-blue-200'
                )}
                onClick={() => setSourceFilter(sourceFilter === 'nagios' ? null : 'nagios')}
              >
                <Siren size={12} /> Nagios
              </Badge>
            </div>
            
            {/* Level filters */}
            <Badge 
              className={cn(
                "cursor-pointer", 
                filter === 'info' ? 'bg-blue-500' : isDarkMode ? 'bg-blue-500/30' : 'bg-blue-200'
              )}
              onClick={() => setFilter(filter === 'info' ? null : 'info')}
            >
              Info
            </Badge>
            <Badge 
              className={cn(
                "cursor-pointer", 
                filter === 'warning' ? 'bg-yellow-500' : isDarkMode ? 'bg-yellow-500/30' : 'bg-yellow-200'
              )}
              onClick={() => setFilter(filter === 'warning' ? null : 'warning')}
            >
              Warning
            </Badge>
            <Badge 
              className={cn(
                "cursor-pointer", 
                filter === 'error' || filter === 'critical' ? 'bg-red-500' : isDarkMode ? 'bg-red-500/30' : 'bg-red-200'
              )}
              onClick={() => setFilter(filter === 'error' || filter === 'critical' ? null : 'critical')}
            >
              Critical
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 max-h-[500px] overflow-y-auto scrollbar-thin">
        <div className={cn(
          "divide-y transition-colors duration-200",
          isDarkMode ? "divide-gray-800" : "divide-gray-200"
        )}>
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => {
              const isNagios = log.source === 'nagios';
              const icon = isNagios ? <Siren size={16} className="mr-1" /> : null;
              
              return (
                <div 
                  key={log.id} 
                  className={cn(
                    "p-3 text-sm flex items-start gap-3 animate-fade-in",
                    log.level === 'critical' && (isDarkMode ? 
                      (isNagios ? "bg-blue-900/20" : "bg-red-900/20") : 
                      (isNagios ? "bg-blue-50" : "bg-red-50")
                    ),
                    isDarkMode ? "text-gray-100" : "text-gray-800"
                  )}
                >
                  <Badge className={cn("mt-0.5 flex items-center", getLevelColor(log.level))}>
                    {icon}
                    {log.level.toUpperCase()}
                  </Badge>
                  <div className="flex-1">
                    <div className={cn(
                      "font-mono",
                      log.level === 'critical' && (
                        isNagios ? 
                          (isDarkMode ? "font-bold text-blue-400" : "font-bold text-blue-600") :
                          (isDarkMode ? "font-bold text-red-400" : "font-bold text-red-600")
                      )
                    )}>
                      {log.message}
                    </div>
                    <div className={cn(
                      "text-xs mt-1 flex justify-between",
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    )}>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      {isNagios && (
                        <span className={cn(
                          "font-medium", 
                          isDarkMode ? "text-blue-400" : "text-blue-600"
                        )}>
                          Nagios
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={cn(
              "p-6 text-center",
              isDarkMode ? "text-gray-500" : "text-gray-400"
            )}>
              No logs matching the current filter
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LogMonitor;
