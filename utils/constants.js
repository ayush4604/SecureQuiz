// App-wide constants

export const APP_NAME = 'SecureQuiz';
export const APP_VERSION = '1.0.0';

// Teacher
export const DEFAULT_TEACHER_PIN = '1234';
export const TEACHER_PIN_LENGTH = 4;

// Quiz
export const QUIZ_CODE_LENGTH = 6;
export const MIN_QUESTIONS = 1;
export const MAX_QUESTIONS = 50;
export const DEFAULT_TIME_LIMIT = 15; // minutes
export const MIN_TIME_LIMIT = 1;
export const MAX_TIME_LIMIT = 180;
export const OPTIONS_PER_QUESTION = 4;
export const QUESTION_TYPES = {
  SINGLE: 'single',
  MULTI: 'multi',
  TEXT: 'text',
};

// Anti-cheat
export const MAX_VIOLATIONS = 3;
export const VIOLATION_TYPES = {
  APP_SWITCH: 'APP_SWITCH',
  SCREENSHOT_ATTEMPT: 'SCREENSHOT_ATTEMPT',
  OVERLAY_DETECTED: 'OVERLAY_DETECTED',
  SPLIT_SCREEN: 'SPLIT_SCREEN',
  BACK_PRESS: 'BACK_PRESS',
  COPY_PASTE: 'COPY_PASTE',
};

export const VIOLATION_LABELS = {
  APP_SWITCH: 'Switched away from app',
  SCREENSHOT_ATTEMPT: 'Screenshot attempt detected',
  OVERLAY_DETECTED: 'Screen overlay detected',
  SPLIT_SCREEN: 'Split screen attempted',
  BACK_PRESS: 'Pressed back button during quiz',
  COPY_PASTE: 'Attempted copy/paste action',
};

// Quiz statuses
export const QUIZ_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
};

export const SESSION_STATUS = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  SUBMITTED: 'submitted',
  AUTO_SUBMITTED: 'auto_submitted',
};

// Timer urgency thresholds (in seconds)
export const TIMER_URGENCY = {
  NORMAL: 300,    // > 5 min = green
  WARNING: 120,   // 2-5 min = yellow
  CRITICAL: 60,   // < 1 min = red
};

// Async storage keys
export const STORAGE_KEYS = {
  TEACHER_PIN: '@securequiz_teacher_pin',
  QUIZZES: '@securequiz_quizzes',
  SESSIONS: '@securequiz_sessions',
  STUDENT_NAME: '@securequiz_student_name',
};
