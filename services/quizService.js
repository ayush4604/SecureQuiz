// Quiz Service - CRUD operations for quizzes
// Supports both Firebase and local AsyncStorage fallback

import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateQuizCode, generateId } from '../utils/codeGenerator';
import { STORAGE_KEYS, QUIZ_STATUS } from '../utils/constants';
import { isFirebaseConfigured, db, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, serverTimestamp } from './firebase';

// ============ LOCAL STORAGE OPERATIONS (Fallback) ============

async function getLocalQuizzes() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.QUIZZES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

async function saveLocalQuizzes(quizzes) {
  await AsyncStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
}

// ============ DEVICE TEACHER ID ============

const DEVICE_TEACHER_ID_KEY = '@securequiz_teacher_id';

async function getDeviceTeacherId() {
  try {
    let id = await AsyncStorage.getItem(DEVICE_TEACHER_ID_KEY);
    if (!id) {
      id = generateId();
      await AsyncStorage.setItem(DEVICE_TEACHER_ID_KEY, id);
    }
    return id;
  } catch (e) {
    return 'fallback-teacher-id';
  }
}

// ============ QUIZ CRUD ============

/**
 * Create a new quiz
 * @param {Object} quizData - { title, timeLimit, questions, teacherPin }
 * @returns {Object} - Created quiz with generated code and ID
 */
export async function createQuiz(quizData) {
  const quizId = generateId();
  const code = generateQuizCode();
  const teacherId = await getDeviceTeacherId();

  const quiz = {
    id: quizId,
    code,
    title: quizData.title,
    timeLimit: quizData.timeLimit,
    questions: quizData.questions,
    status: QUIZ_STATUS.DRAFT,
    createdAt: new Date().toISOString(),
    sessions: [],
    teacherId,
  };

  if (isFirebaseConfigured()) {
    try {
      await setDoc(doc(db, 'quizzes', quizId), {
        ...quiz,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn('Firebase write failed, using local storage:', e.message);
      const quizzes = await getLocalQuizzes();
      quizzes.push(quiz);
      await saveLocalQuizzes(quizzes);
    }
  } else {
    const quizzes = await getLocalQuizzes();
    quizzes.push(quiz);
    await saveLocalQuizzes(quizzes);
  }

  return quiz;
}

/**
 * Get all quizzes for the current teacher
 * @returns {Array} - Array of quiz objects
 */
export async function getAllQuizzes() {
  const teacherId = await getDeviceTeacherId();

  if (isFirebaseConfigured()) {
    try {
      const q = query(collection(db, 'quizzes'), where('teacherId', '==', teacherId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('Firebase read failed, using local:', e.message);
      const local = await getLocalQuizzes();
      return local.filter(q => q.teacherId === teacherId);
    }
  }
  const local = await getLocalQuizzes();
  return local.filter(q => q.teacherId === teacherId);
}

/**
 * Get quiz by code
 * @param {string} code - 6-digit quiz code
 * @returns {Object|null} - Quiz object or null
 */
export async function getQuizByCode(code) {
  if (isFirebaseConfigured()) {
    try {
      const q = query(collection(db, 'quizzes'), where('code', '==', code));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docData = snapshot.docs[0];
        return { id: docData.id, ...docData.data() };
      }
      return null;
    } catch (e) {
      console.warn('Firebase query failed, using local:', e.message);
    }
  }

  const quizzes = await getLocalQuizzes();
  return quizzes.find((q) => q.code === code) || null;
}

/**
 * Get quiz by ID
 * @param {string} quizId - Quiz ID
 * @returns {Object|null}
 */
export async function getQuizById(quizId) {
  if (isFirebaseConfigured()) {
    try {
      const docSnap = await getDoc(doc(db, 'quizzes', quizId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (e) {
      console.warn('Firebase get failed, using local:', e.message);
    }
  }

  const quizzes = await getLocalQuizzes();
  return quizzes.find((q) => q.id === quizId) || null;
}

/**
 * Update quiz status
 * @param {string} quizId
 * @param {string} status
 */
export async function updateQuizStatus(quizId, status) {
  if (isFirebaseConfigured()) {
    try {
      await updateDoc(doc(db, 'quizzes', quizId), { status });
      return;
    } catch (e) {
      console.warn('Firebase update failed, using local:', e.message);
    }
  }

  const quizzes = await getLocalQuizzes();
  const idx = quizzes.findIndex((q) => q.id === quizId);
  if (idx !== -1) {
    quizzes[idx].status = status;
    await saveLocalQuizzes(quizzes);
  }
}

/**
 * Delete a quiz
 * @param {string} quizId
 */
export async function deleteQuiz(quizId) {
  if (isFirebaseConfigured()) {
    try {
      await deleteDoc(doc(db, 'quizzes', quizId));
      return;
    } catch (e) {
      console.warn('Firebase delete failed, using local:', e.message);
    }
  }

  const quizzes = await getLocalQuizzes();
  const filtered = quizzes.filter((q) => q.id !== quizId);
  await saveLocalQuizzes(filtered);
}

/**
 * Add a new result/session to a quiz
 * Uses a separate collection to avoid document size limits and concurrency issues
 */
export async function addSessionToQuiz(quizId, session) {
  if (isFirebaseConfigured()) {
    try {
      // Add to a top-level 'results' collection for high concurrency
      await setDoc(doc(db, 'results', session.id), {
        ...session,
        quizId,
        createdAt: serverTimestamp(),
      });
      return;
    } catch (e) {
      console.warn('Firebase result write failed:', e.message);
    }
  }

  const quizzes = await getLocalQuizzes();
  const idx = quizzes.findIndex((q) => q.id === quizId);
  if (idx !== -1) {
    if (!quizzes[idx].sessions) quizzes[idx].sessions = [];
    quizzes[idx].sessions.push(session);
    await saveLocalQuizzes(quizzes);
  }
}

/**
 * Update a specific session/result
 */
export async function updateSession(quizId, sessionId, sessionData) {
  if (isFirebaseConfigured()) {
    try {
      await updateDoc(doc(db, 'results', sessionId), {
        ...sessionData,
        updatedAt: serverTimestamp(),
      });
      return;
    } catch (e) {
      console.warn('Firebase result update failed:', e.message);
    }
  }

  const quizzes = await getLocalQuizzes();
  const idx = quizzes.findIndex((q) => q.id === quizId);
  if (idx !== -1) {
    quizzes[idx].sessions = (quizzes[idx].sessions || []).map((s) =>
      s.id === sessionId ? { ...s, ...sessionData } : s
    );
    await saveLocalQuizzes(quizzes);
  }
}

/**
 * Get all results for a specific quiz
 */
export async function getQuizResults(quizId) {
  if (isFirebaseConfigured()) {
    try {
      const q = query(collection(db, 'results'), where('quizId', '==', quizId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('Firebase results read failed:', e.message);
    }
  }
  
  const quizzes = await getLocalQuizzes();
  const quiz = quizzes.find(q => q.id === quizId);
  return quiz?.sessions || [];
}
