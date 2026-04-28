// Firebase Service - Initialize and export Firestore
// Uses Firebase JS SDK (web) which works perfectly with Expo

import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-config';

// Initialize Firebase (prevent duplicate initialization)
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

// Check if Firebase is configured (not placeholder values)
export function isFirebaseConfigured() {
  return (
    firebaseConfig.apiKey !== 'YOUR_API_KEY_HERE' &&
    firebaseConfig.projectId !== 'YOUR_PROJECT_ID'
  );
}

export {
  db,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
};
