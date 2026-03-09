import { useState, useEffect, useRef, useCallback } from 'react';
import { videoService } from '../services/api';
import type { PollResponse } from '../types';

interface UsePollingResult {
  status: PollResponse | null;
  isPolling: boolean;
  error: string | null;
}

export function usePolling(
  operationName: string | null,
  enabled: boolean = true,
  intervalMs: number = 10000,
): UsePollingResult {
  const [status, setStatus] = useState<PollResponse | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  const poll = useCallback(async () => {
    if (!operationName) return;
    try {
      const result = await videoService.checkStatus(operationName);
      setStatus(result);
      if (result.done) {
        setIsPolling(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (result.error) {
          setError(result.error.message);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Polling failed';
      setError(message);
      setIsPolling(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [operationName]);

  useEffect(() => {
    if (!operationName || !enabled) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);
    setError(null);
    setStatus(null);

    poll();

    intervalRef.current = window.setInterval(poll, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [operationName, enabled, intervalMs, poll]);

  return { status, isPolling, error };
}
