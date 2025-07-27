import { useRef, useCallback, useEffect } from "react";

interface UseInactivityTimerOptions {
  timeout: number; // timeout in milliseconds
  onTimeout: () => void;
  enabled: boolean;
  warningTime?: number; // time before timeout to show warning (in milliseconds)
  onWarning?: () => void;
}

export const useInactivityTimer = ({
  timeout,
  onTimeout,
  enabled,
  warningTime,
  onWarning,
}: UseInactivityTimerOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    clearTimers();

    if (!enabled) return;

    // Set warning timer if specified
    if (warningTime && onWarning) {
      warningTimeoutRef.current = setTimeout(() => {
        onWarning();
      }, timeout - warningTime);
    }

    // Set main timeout
    timeoutRef.current = setTimeout(() => {
      onTimeout();
    }, timeout);
  }, [enabled, timeout, onTimeout, warningTime, onWarning, clearTimers]);

  useEffect(() => {
    if (!enabled) {
      clearTimers();
      return;
    }

    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
      "keydown",
    ];

    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Start timer
    resetTimer();

    return () => {
      // Cleanup
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
      clearTimers();
    };
  }, [enabled, resetTimer, clearTimers]);

  return {
    resetTimer,
    clearTimers,
    getLastActivity: () => lastActivityRef.current,
  };
};
