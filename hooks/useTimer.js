// useTimer Hook - Countdown timer with urgency levels

import { useState, useEffect, useRef, useCallback } from 'react';
import { TIMER_URGENCY } from '../utils/constants';

/**
 * Countdown timer hook
 * @param {number} totalMinutes - Total time in minutes
 * @param {boolean} isActive - Whether timer should be running
 * @param {Function} onExpire - Callback when timer reaches 0
 * @returns {Object} - { timeLeft, formattedTime, urgency, progress }
 */
export function useTimer(totalMinutes, isActive, onExpire) {
  const totalSeconds = totalMinutes * 60;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const intervalRef = useRef(null);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    const startSeconds = Math.max(1, parseInt(totalMinutes) * 60 || 60);
    setTimeLeft(startSeconds);
    console.log(`[Timer] Initialized with ${startSeconds}s`);
  }, [totalMinutes]);

  useEffect(() => {
    if (!isActive) return;
    
    console.log(`[Timer] Running...`);

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          console.log('[Timer] Expired! Triggering callback...');
          clearInterval(intervalRef.current);
          if (onExpireRef.current) {
            onExpireRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  // Format time as MM:SS
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Determine urgency level
  const getUrgency = useCallback(() => {
    if (timeLeft > TIMER_URGENCY.NORMAL) return 'normal';
    if (timeLeft > TIMER_URGENCY.WARNING) return 'normal';
    if (timeLeft > TIMER_URGENCY.CRITICAL) return 'warning';
    return 'critical';
  }, [timeLeft]);

  // Progress (0 to 1)
  const progress = totalSeconds > 0 ? timeLeft / totalSeconds : 0;

  return {
    timeLeft,
    formattedTime: formatTime(timeLeft),
    urgency: getUrgency(),
    progress,
  };
}
