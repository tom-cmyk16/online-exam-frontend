import React, { useState, useEffect } from 'react';
import api from '../api/xiosInstance';

interface ServerStatusProps {
  onStatusChange?: (isOnline: boolean) => void;
}

const ServerStatus: React.FC<ServerStatusProps> = ({ onStatusChange }) => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const checkServerStatus = async () => {
    try {
      // Try to ping the server
      await api.get('/health', { timeout: 5000 });
      setIsOnline(true);
      onStatusChange?.(true);
    } catch (error) {
      setIsOnline(false);
      onStatusChange?.(false);
      console.warn('🔴 Backend server is not responding');
    }
    setLastCheck(new Date());
  };

  useEffect(() => {
    checkServerStatus();
    
    // Check server status every 30 seconds
    const interval = setInterval(checkServerStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (isOnline === null) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
        Checking server status...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
      <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
        {isOnline ? 'Server Online' : 'Server Offline'}
      </span>
      <span className="text-gray-400">
        • Last check: {lastCheck.toLocaleTimeString()}
      </span>
      {!isOnline && (
        <button
          onClick={checkServerStatus}
          className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ServerStatus;