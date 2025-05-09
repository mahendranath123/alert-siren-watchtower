
import { useState, useEffect, useCallback, useRef } from 'react';

export interface LogEntry {
  timestamp: string;
  message: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  id: string;
  source?: string; // Add optional source field for Nagios integration
  hostname?: string; // Add hostname field for selective host monitoring
  status?: string; // Add status field for host status (UP/DOWN)
}

export interface ServerStatus {
  status: 'connected' | 'disconnected' | 'error';
  lastUpdate: Date;
}

// List of important hosts to monitor (subset from your shell script)
const IMPORTANT_HOSTS = [
  "UFO_MOVIEZ_PVT_LTD_1Gig_ILL",
  "Pharma_Access_Pvt_Ltd_10G_SW",
  "Infinity_Cars_Pvt_Ltd_Turbhe_CKT_5503_Primay_Nerul_10G_SW",
  "AR_Gold_Pvt_Ltd_Primary_Fiber_MKT",
  "Skanem_10G_SW",
  "Work_Store_Limited_Primary_From_BMC_SW"
  // You can add more hosts from your list as needed
];

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

    // Simulate receiving critical alerts for specific hosts occasionally
    const simulateAlertInterval = setInterval(() => {
      if (Math.random() < 0.3) {
        const sourceType = Math.random() < 0.7 ? 'nagios' : 'system';
        let alertMessage = '';
        let hostname = '';
        let status = 'DOWN';
        
        if (sourceType === 'nagios') {
          // Select a random important host from the list
          hostname = IMPORTANT_HOSTS[Math.floor(Math.random() * IMPORTANT_HOSTS.length)];
          alertMessage = `HOST NOTIFICATION: ${hostname} is ${status} - Host unreachable`;
        } else {
          hostname = `server-${Math.floor(Math.random() * 10)}`;
          alertMessage = `CRITICAL ALERT: host down detected on ${hostname}`;
        }
        
        const criticalAlert: LogEntry = {
          timestamp: new Date().toISOString(),
          message: alertMessage,
          level: 'critical',
          id: `alert-${Date.now()}`,
          source: sourceType,
          hostname: hostname,
          status: status
        };
        
        setAlert(criticalAlert);
        setLogs(prev => [criticalAlert, ...prev.slice(0, 99)]);
        
        // Clear the alert after 10 seconds
        setTimeout(() => {
          setAlert(null);
        }, 10000);
        
        // Simulate recovery after some time
        setTimeout(() => {
          if (Math.random() > 0.3) { // 70% chance of recovery
            const recoveryLog: LogEntry = {
              timestamp: new Date().toISOString(),
              message: `HOST NOTIFICATION: ${hostname} is UP - Host has recovered`,
              level: 'info',
              id: `recovery-${Date.now()}`,
              source: sourceType,
              hostname: hostname,
              status: 'UP'
            };
            
            setLogs(prev => [recoveryLog, ...prev.slice(0, 99)]);
          }
        }, Math.random() * 15000 + 5000); // Recovery between 5-20 seconds later
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
