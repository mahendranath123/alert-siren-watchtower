
import { useEffect } from 'react';
import Header from './Header';
import LogMonitor from './LogMonitor';
import AlertPanel from './AlertPanel';
import useWebSocket from '@/hooks/useWebSocket';
import { initializeAudio } from '@/utils/audioUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  const { logs, alert, status, clearAlert } = useWebSocket('ws://localhost:5000/ws');
  
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

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      <Header status={status} />
      
      <main className="flex-1 container mx-auto py-6 px-4">
        <AlertPanel alert={alert} onClear={clearAlert} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-400">Monitoring</div>
              <div className="text-sm text-gray-400 mt-2">
                Watching for critical alerts
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Log Path</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-yellow-400 text-sm bg-gray-800 p-2 rounded">
                /var/log/mylog.log
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Monitoring for "host down" messages
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Alert Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm">
                <div>
                  <div className="text-gray-400">Today:</div>
                  <div className="text-2xl font-bold text-red-400">
                    {logs.filter(log => log.level === 'critical').length}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">This Week:</div>
                  <div className="text-2xl font-bold text-orange-400">12</div>
                </div>
                <div>
                  <div className="text-gray-400">This Month:</div>
                  <div className="text-2xl font-bold text-yellow-400">27</div>
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
