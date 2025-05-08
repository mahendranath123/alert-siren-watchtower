
import { useState, useEffect, useCallback, useRef } from 'react';

export interface LogEntry {
  timestamp: string;
  message: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  id: string;
  source?: string; // Add optional source field for Nagios integration
}

export interface ServerStatus {
  status: 'connected' | 'disconnected' | 'error';
  lastUpdate: Date;
}

const useWebSocket = (url: string) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [alert, setAlert] = useState<LogEntry | null>(null);
  const [status, setStatus] = useState<ServerStatus>({
    status: 'disconnected',
    lastUpdate: new Date(),
  });
  const socketRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    // In a real app, this would connect to a real WebSocket server
    // For the demo, we'll simulate incoming logs and alerts with setTimeout
    console.log(`Connecting to websocket at ${url}...`);
    setStatus({
      status: 'connected',
      lastUpdate: new Date(),
    });

    // Simulate receiving log entries
    const simulateLogInterval = setInterval(() => {
      const randomLevel = Math.random();
      const level = 
        randomLevel < 0.7 ? 'info' :
        randomLevel < 0.85 ? 'warning' : 'error';
      
      const newLog: LogEntry = {
        timestamp: new Date().toISOString(),
        message: `System ${level === 'info' ? 'running normally' : level === 'warning' ? 'experiencing high load' : 'showing unusual activity'} (log-${Date.now()})`,
        level,
        id: Date.now().toString(),
      };
      
      setLogs(prev => [newLog, ...prev.slice(0, 99)]);
    }, 3000);

    // Simulate receiving critical alerts occasionally
    const simulateAlertInterval = setInterval(() => {
      if (Math.random() < 0.3) {
        const sourceType = Math.random() < 0.5 ? 'system' : 'nagios';
        let alertMessage = '';
        
        if (sourceType === 'nagios') {
          const services = ['HTTP', 'Database', 'CPU Load', 'Memory Usage', 'Disk Space'];
          const randomService = services[Math.floor(Math.random() * services.length)];
          alertMessage = `NAGIOS ALERT: server-${Math.floor(Math.random() * 10)}/${randomService} is CRITICAL - Threshold exceeded`;
        } else {
          alertMessage = `CRITICAL ALERT: host down detected on server-${Math.floor(Math.random() * 10)}`;
        }
        
        const criticalAlert: LogEntry = {
          timestamp: new Date().toISOString(),
          message: alertMessage,
          level: 'critical',
          id: `alert-${Date.now()}`,
          source: sourceType
        };
        
        setAlert(criticalAlert);
        setLogs(prev => [criticalAlert, ...prev.slice(0, 99)]);
        
        // Clear the alert after 10 seconds
        setTimeout(() => {
          setAlert(null);
        }, 10000);
      }
    }, 15000);

    return () => {
      clearInterval(simulateLogInterval);
      clearInterval(simulateAlertInterval);
      setStatus({
        status: 'disconnected',
        lastUpdate: new Date(),
      });
    };
  }, [url]);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  const clearAlert = useCallback(() => {
    setAlert(null);
  }, []);

  return { logs, alert, status, clearAlert };
};

export default useWebSocket;
