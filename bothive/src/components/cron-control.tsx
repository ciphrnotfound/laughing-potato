'use client';

import { useState, useEffect } from 'react';
import { Power, RefreshCw, Clock, CheckCircle } from 'lucide-react';

export function CronControl() {
  const [cronStatus, setCronStatus] = useState<'idle' | 'running' | 'checking'>('checking');
  const [message, setMessage] = useState('');

  const checkCronStatus = async () => {
    try {
      const response = await fetch('/api/cron/start');
      const data = await response.json();
      setCronStatus(data.running ? 'running' : 'idle');
      setMessage(data.message);
    } catch (error) {
      setCronStatus('idle');
      setMessage('Failed to check cron status');
    }
  };

  const startCron = async () => {
    try {
      setCronStatus('checking');
      const response = await fetch('/api/cron/start', { method: 'POST' });
      const data = await response.json();
      setCronStatus('running');
      setMessage(data.message);
    } catch (error) {
      setCronStatus('idle');
      setMessage('Failed to start cron');
    }
  };

  const stopCron = async () => {
    try {
      setCronStatus('checking');
      const response = await fetch('/api/cron/start', { method: 'DELETE' });
      const data = await response.json();
      setCronStatus('idle');
      setMessage(data.message);
    } catch (error) {
      setCronStatus('idle');
      setMessage('Failed to stop cron');
    }
  };

  useEffect(() => {
    checkCronStatus();
  }, []);

  return (
    <div className="fixed bottom-20 right-4 z-50 bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-gray-700/50 min-w-[280px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full animate-pulse ${
            cronStatus === 'running' ? 'bg-emerald-500 shadow-emerald-500/50 shadow-lg' : 
            cronStatus === 'checking' ? 'bg-amber-500 shadow-amber-500/50 shadow-lg' : 'bg-red-500 shadow-red-500/50 shadow-lg'
          }`} />
          <span className="text-sm font-semibold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            Auto-Cron
          </span>
        </div>
        <div className="text-xs px-2 py-1 rounded-full bg-gray-700/50 text-gray-300">
          {cronStatus === 'running' ? 'Active' : 
           cronStatus === 'checking' ? 'Checking' : 'Inactive'}
        </div>
      </div>
      
      {/* Status Message */}
      <div className="text-xs text-gray-400 mb-4 line-clamp-2">
        {message || 'Automatic scheduled post publishing'}
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-2">
        {cronStatus === 'idle' && (
          <button
            onClick={startCron}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-emerald-600/25"
          >
            <Power className="w-3.5 h-3.5" />
            Start
          </button>
        )}
        {cronStatus === 'running' && (
          <button
            onClick={stopCron}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-red-600/25"
          >
            <Power className="w-3.5 h-3.5" />
            Stop
          </button>
        )}
        <button
          onClick={checkCronStatus}
          disabled={cronStatus === 'checking'}
          className="flex items-center justify-center gap-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${cronStatus === 'checking' ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Success indicator when running */}
      {cronStatus === 'running' && (
        <div className="mt-3 pt-3 border-t border-gray-700/50 flex items-center gap-2 text-xs text-emerald-400">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Scheduled posts will publish automatically</span>
        </div>
      )}
    </div>
  );
}
