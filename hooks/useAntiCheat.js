// useAntiCheat Hook - Master anti-cheat system with all security layers
// This is the MOST CRITICAL file in the entire app
import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, BackHandler, Platform } from 'react-native';
import * as ScreenCapture from 'expo-screen-capture';
// import * as ScreenPinning from '../modules/expo-screen-pinning'; // Removed static import to prevent web crash
import * as NavigationBar from 'expo-navigation-bar';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { VIOLATION_TYPES } from '../utils/constants';

const VIOLATION_THRESHOLD = Platform.OS === 'web' ? 5 : 3;

/**
 * Master anti-cheat hook
 * Activates all security layers when the quiz is active
 *
 * @param {boolean} isActive - Whether the quiz is currently active
 * @param {string} studentName - Student's name for logging
 * @param {Function} onAutoSubmit - Callback when max violations reached
 * @returns {Object} - { violations, violationCount, warningVisible, dismissWarning }
 */
export function useAntiCheat(isActive, studentName, onAutoSubmit) {
  const [violations, setViolations] = useState([]);
  const [warningVisible, setWarningVisible] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [isLockedDown, setIsLockedDown] = useState(true); // Default true, then check
  const appStateRef = useRef(AppState.currentState);
  const violationCountRef = useRef(0);
  const isActiveRef = useRef(isActive);

  const onAutoSubmitRef = useRef(onAutoSubmit);
  const violationsRef = useRef([]);

  // Keep isActive ref in sync
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    onAutoSubmitRef.current = onAutoSubmit;
  }, [onAutoSubmit]);

  // Log a violation
  const logViolation = useCallback((type, message) => {
    if (!isActiveRef.current) return;

    const violation = {
      type,
      message: message || type,
      timestamp: new Date().toISOString(),
      count: violationCountRef.current + 1,
    };

    violationCountRef.current += 1;
    violationsRef.current.push(violation);
    setViolations([...violationsRef.current]);

    // Show warning
    setWarningMessage(
      `Warning ${violationCountRef.current}/${VIOLATION_THRESHOLD}: ${message || type}`
    );
    setWarningVisible(true);

    // Auto-dismiss warning after 3 seconds
    setTimeout(() => {
      setWarningVisible(false);
    }, 3000);

    // Check if max violations reached
    if (violationCountRef.current >= VIOLATION_THRESHOLD) {
      // Auto submit after a brief delay to show the final warning
      setTimeout(() => {
        if (onAutoSubmitRef.current) {
          onAutoSubmitRef.current([...violationsRef.current]);
        }
      }, 1500);
    }
  }, []);

  const dismissWarning = useCallback(() => {
    setWarningVisible(false);
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const cleanups = [];

    // ========================================
    // LAYER 1-3: FLAG_SECURE (Screenshots + Recording + Casting)
    // ========================================
    (async () => {
      try {
        await ScreenCapture.preventScreenCaptureAsync('quiz-lockdown');
      } catch (e) {
        console.warn('Screen capture prevention not available:', e.message);
      }
    })();
    cleanups.push(async () => {
      try {
        await ScreenCapture.allowScreenCaptureAsync('quiz-lockdown');
      } catch (e) {
        // ignore
      }
    });

    // Listen for screenshot attempts (some devices fire this even with FLAG_SECURE)
    let screenshotSubscription;
    try {
      screenshotSubscription = ScreenCapture.addScreenshotListener(() => {
        logViolation(
          VIOLATION_TYPES.SCREENSHOT_ATTEMPT,
          'Screenshot attempt detected!'
        );
      });
      cleanups.push(() => screenshotSubscription?.remove());
    } catch (e) {
      // Screenshot listener not available on all devices
    }

    // ========================================
    // LAYER 4: App Switch Detection (AppState)
    // ========================================
    const appStateSubscription = AppState.addEventListener(
      'change',
      (nextAppState) => {
        if (
          appStateRef.current === 'active' &&
          (nextAppState === 'background' || nextAppState === 'inactive')
        ) {
          logViolation(
            VIOLATION_TYPES.APP_SWITCH,
            'You switched away from the quiz!'
          );
        }
        appStateRef.current = nextAppState;
      }
    );
    cleanups.push(() => appStateSubscription?.remove());

    // ========================================
    // LAYER 9: Back Button Override (Android)
    // ========================================
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          logViolation(
            VIOLATION_TYPES.BACK_PRESS,
            'Back button is disabled during the quiz!'
          );
          return true; // Prevent default back action
        }
      );
      cleanups.push(() => backHandler.remove());
    }

    // ========================================
    // LAYER 10: Keep Screen Awake
    // ========================================
    (async () => {
      try {
        await activateKeepAwakeAsync('quiz-active');
      } catch (e) {
        console.warn('Keep awake not available:', e.message);
      }
    })();
    cleanups.push(() => {
      try {
        deactivateKeepAwake('quiz-active');
      } catch (e) {
        // ignore
      }
    });

    // ========================================
    // LAYER 11: Hide Navigation Bar (Immersive Mode)
    // ========================================
    if (Platform.OS === 'android') {
      (async () => {
        try {
          await NavigationBar.setVisibilityAsync("hidden");
          await NavigationBar.setBehaviorAsync("overlay-swipe");
        } catch (e) {
          // ignore
        }
      })();
      cleanups.push(async () => {
        try {
          await NavigationBar.setVisibilityAsync("visible");
        } catch (e) {
          // ignore
        }
      });
    }

    // ========================================
    // LAYER 12: Web Before Unload
    // ========================================
    if (Platform.OS === 'web') {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = '';
        logViolation(VIOLATION_TYPES.BACK_PRESS, 'You attempted to leave the page!');
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      cleanups.push(() => window.removeEventListener('beforeunload', handleBeforeUnload));

      // LAYER 14: Web Fullscreen Enforcement
      const handleFullscreenChange = () => {
        try {
          if (document.fullscreenElement === null && isActiveRef.current) {
            logViolation(
              VIOLATION_TYPES.APP_SWITCH,
              'Exiting fullscreen is NOT allowed!'
            );
          }
        } catch (e) {
          // ignore
        }
      };

      // LAYER 16: Web Focus Lockdown (Blur Detection)
      // Detects when user interacts with AI overlays, sidebars, or other windows
      const handleBlur = () => {
        if (isActiveRef.current) {
          logViolation(
            VIOLATION_TYPES.APP_SWITCH,
            'Window lost focus! Interacting with other tools is forbidden.'
          );
        }
      };

      window.addEventListener('blur', handleBlur);
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      
      cleanups.push(() => {
        window.removeEventListener('blur', handleBlur);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
      });

      // LAYER 15: Disable Copy/Paste/Right-Click
      const preventDefault = (e) => {
        e.preventDefault();
        logViolation(VIOLATION_TYPES.COPY_PASTE, 'This action is disabled!');
      };
      
      // Global CSS for No-Select
      const style = document.createElement('style');
      style.innerHTML = `
        * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-user-drag: none !important;
        }
        input, textarea {
          -webkit-user-select: text !important;
          user-select: text !important;
        }
      `;
      document.head.appendChild(style);
      
      document.addEventListener('copy', preventDefault);
      document.addEventListener('paste', preventDefault);
      document.addEventListener('cut', preventDefault);
      
      const preventContextMenu = (e) => e.preventDefault();
      document.addEventListener('contextmenu', preventContextMenu);
      
      cleanups.push(() => {
        document.head.removeChild(style);
        document.removeEventListener('copy', preventDefault);
        document.removeEventListener('paste', preventDefault);
        document.removeEventListener('cut', preventDefault);
        document.removeEventListener('contextmenu', preventContextMenu);
      });
    }

    // ========================================
    // LAYER 13: Native Android Screen Pinning (Lock Task Mode)
    // ========================================
    if (Platform.OS === 'android') {
      let ScreenPinning;
      try {
        ScreenPinning = require('../modules/expo-screen-pinning');
      } catch (e) {
        console.warn('Native module ScreenPinning not found');
        return;
      }
      
      const checkPinning = () => {
        try {
          const pinned = ScreenPinning.isPinned();
          setIsLockedDown(pinned);
          if (!pinned && isActiveRef.current) {
            ScreenPinning.start(); // Try to start again
          }
        } catch (e) {
          // ignore
        }
      };

      try {
        ScreenPinning.start();
        // Initial check after a short delay to allow OS dialog to show
        setTimeout(checkPinning, 2000);
      } catch (e) {
        console.warn('Screen pinning not available:', e);
      }

      const pinInterval = setInterval(checkPinning, 2000);
      cleanups.push(() => {
        clearInterval(pinInterval);
        try {
          ScreenPinning.stop();
        } catch (e) {
          // ignore
        }
      });
    }

    // ========================================
    // CLEANUP ALL LAYERS
    // ========================================
    return () => {
      cleanups.forEach((cleanup) => {
        try {
          cleanup();
        } catch (e) {
          // ignore cleanup errors
        }
      });
    };
  }, [isActive, logViolation]);

  return {
    violations,
    violationCount: violationCountRef.current,
    warningVisible,
    warningMessage,
    isLockedDown,
    dismissWarning,
    logViolation,
  };
}
