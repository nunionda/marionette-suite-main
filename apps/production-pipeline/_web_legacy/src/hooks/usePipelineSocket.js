import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * usePipelineSocket
 * 마리오네트 파이프라인 엔진(FastAPI)과의 WebSocket 연결을 관리하는 커스텀 훅
 */
export const usePipelineSocket = (runId) => {
  const [status, setStatus] = useState('IDLE');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const handleMessage = useCallback((msg) => {
    switch (msg.type) {
      case 'pipeline_started':
        setStatus('RUNNING');
        setLogs(prev => [...prev, { type: 'header', text: `// PIPELINE STARTED [ID: ${msg.run_id}]` }]);
        break;
      case 'step_started':
        setCurrentStep(msg.step);
        setProgress(msg.progress);
        setLogs(prev => [...prev, { type: 'header', text: `// AGENT: ${msg.step.toUpperCase()} STARTED` }]);
        break;
      case 'step_completed':
        setProgress(msg.progress);
        setLogs(prev => [...prev, { 
          type: 'success', 
          text: `[SUCCESS] ${msg.step} completed: ${msg.message}`,
          soq_score: msg.soq_score,
          eval_decision: msg.eval_decision
        }]);
        break;
      case 'step_failed':
        setStatus('FAILED');
        setLogs(prev => [...prev, { type: 'error', text: `[ERROR] ${msg.step} failed: ${msg.error}` }]);
        break;
      case 'pipeline_completed':
        setStatus('COMPLETED');
        setProgress(100);
        setCurrentStep(null);
        setLogs(prev => [...prev, { type: 'success', text: '// PIPELINE EXECUTION COMPLETE' }]);
        break;
      default:
        break;
    }
  }, []);

  const connect = useCallback(() => {
    if (!runId || runId === 'GLOBAL') return;
    
    if (socketRef.current) {
      socketRef.current.close();
    }

    const wsUrl = `ws://${window.location.hostname}:${import.meta.env.VITE_API_PORT || '3005'}/ws/pipeline/${runId}`;
    console.log(`🔌 Connecting to Pipeline Engine: ${wsUrl}`);
    
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('✅ Pipeline Engine Connected');
      setStatus('CONNECTED');
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleMessage(message);
      } catch (err) {
        console.error('Failed to parse WebSocket message', err);
      }
    };

    ws.onclose = () => {
      console.log('🔌 Pipeline Engine Disconnected');
      setStatus('DISCONNECTED');
      // Reconnection handled via useEffect status check
    };

    ws.onerror = (err) => {
      console.error('WebSocket Error:', err);
      setError('Connection failed');
      setStatus('ERROR');
    };
  }, [runId, handleMessage]);

  useEffect(() => {
    if (status === 'IDLE' || status === 'DISCONNECTED') {
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    }
    
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [status, connect]);

  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, []);

  const sendMessage = (msg) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msg));
    }
  };

  return {
    status,
    progress,
    currentStep,
    logs,
    error,
    sendMessage
  };
};
