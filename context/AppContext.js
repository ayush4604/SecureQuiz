// App Context - Global state management for the entire app
// Handles teacher auth, student info, and quiz state

import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext(null);

const initialState = {
  // Role
  role: null, // 'teacher' | 'student'

  // Teacher
  isTeacherAuth: false,
  teacherPin: null,

  // Student
  studentName: '',
  studentId: null,

  // Active quiz
  activeQuizId: null,
  activeQuizCode: null,
  activeQuiz: null,

  // Quiz session
  sessionId: null,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, role: action.payload };

    case 'TEACHER_LOGIN':
      return { ...state, isTeacherAuth: true, teacherPin: action.payload };

    case 'TEACHER_LOGOUT':
      return { ...state, isTeacherAuth: false, teacherPin: null, role: null };

    case 'SET_STUDENT':
      return {
        ...state,
        studentName: action.payload.name,
        studentId: action.payload.id,
      };

    case 'SET_ACTIVE_QUIZ':
      return {
        ...state,
        activeQuizId: action.payload.id,
        activeQuizCode: action.payload.code,
        activeQuiz: action.payload.quiz,
      };

    case 'SET_SESSION':
      return { ...state, sessionId: action.payload };

    case 'CLEAR_QUIZ':
      return {
        ...state,
        activeQuizId: null,
        activeQuizCode: null,
        activeQuiz: null,
        sessionId: null,
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
