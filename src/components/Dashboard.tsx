
import { useEffect } from 'react';
import Header from './Header';
import LogMonitor from './LogMonitor';
import AlertPanel from './AlertPanel';
import useWebSocket from '@/hooks/useWebSocket';
import { initializeAudio } from '@/utils/audioUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';
import { AlertTriangle, Siren } from 'lucide-react';

const Dashboard = () => {
  const { logs, alert, status, clearAlert } = useWebSocket('ws://localhost:5000/ws');
  const { theme } = useTheme();
  
  useEffect(() => {
    // Initialize audio on first user interaction
    const handleInteraction = () => {
      initializeAudio();
      document.removeEventListener('click', handleInteraction);
    };
    
    document.addEventListener('click', handleInteraction);
    
    return () => {
      document.removeEventListener('click', handleInteraction);
    };
  }, []);
  
  const isDarkMode = theme === 'dark';

  // Count Nagios alerts
  const nagiosAlerts = logs.filter(log => log.source === 'nagios' && log.level === 'critical').length;
  const systemAlerts = logs.filter(log => (!log.source || log.source === 'system') && log.level === 'critical').length;

  return (
    <div className={cn(
      "min-h-screen flex flex-col transition-colors duration-200",
      isDarkMode ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-800"
    )}>
      <Header status={status} />
      
      <main className="flex-1 container mx-auto py-6 px-4">
        <AlertPanel alert={alert} onClear={clearAlert} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className={cn(
            "border shadow-md transition-colors duration-200",
            isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
          )}>
            <CardHeader>
              <CardTitle className={cn(
                "text-lg",
                isDarkMode ? "text-white" : "text-gray-800"
              )}>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-yellow-500" />
                  <span>System Status</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-500">Monitoring</div>
              <div className={cn(
                "text-sm mt-2",
                isDarkMode ? "text-gray-400" : "text-gray-500"
              )}>
                Watching for critical alerts
              </div>
            </CardContent>
          </Card>
          
          <Card className={cn(
            "border shadow-md transition-colors duration-200",
            isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
          )}>
            <CardHeader>
              <CardTitle className={cn(
                "text-lg",
                isDarkMode ? "text-white" : "text-gray-800"
              )}>
                <div className="flex items-center gap-2">
                  <Siren size={18} className="text-blue-500" />
                  <span>Nagios Integration</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "font-mono text-sm p-2 rounded",
                isDarkMode ? "bg-gray-800 text-yellow-400" : "bg-gray-100 text-yellow-600"
              )}>
                /nagios-webhook
              </div>
              <div className={cn(
                "text-xs mt-2",
                isDarkMode ? "text-gray-400" : "text-gray-500"
              )}>
                Connect Nagios alerts to this endpoint
              </div>
            </CardContent>
          </Card>
          
          <Card className={cn(
            "border shadow-md transition-colors duration-200",
            isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
          )}>
            <CardHeader>
              <CardTitle className={cn(
                "text-lg",
                isDarkMode ? "text-white" : "text-gray-800"
              )}>Alert Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm">
                <div>
                  <div className={isDarkMode ? "text-gray-400" : "text-gray-500"}>System:</div>
                  <div className={cn(
                    "text-2xl font-bold",
                    isDarkMode ? "text-red-400" : "text-red-500"
                  )}>
                    {systemAlerts}
                  </div>
                </div>
                <div>
                  <div className={isDarkMode ? "text-gray-400" : "text-gray-500"}>Nagios:</div>
                  <div className={cn(
                    "text-2xl font-bold",
                    isDarkMode ? "text-blue-400" : "text-blue-500"
                  )}>
                    {nagiosAlerts}
                  </div>
                </div>
                <div>
                  <div className={isDarkMode ? "text-gray-400" : "text-gray-500"}>Total:</div>
                  <div className={cn(
                    "text-2xl font-bold",
                    isDarkMode ? "text-yellow-400" : "text-yellow-500"
                  )}>
                    {systemAlerts + nagiosAlerts}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <LogMonitor logs={logs} />
      </main>
    </div>
  );
};

export default Dashboard;
