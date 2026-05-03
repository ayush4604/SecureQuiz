// useQuizEngine Hook - Quiz state machine for taking a quiz

import { useState, useCallback, useMemo } from 'react';
import { shuffleQuiz } from '../utils/shuffler';
import { QUESTION_TYPES } from '../utils/constants';

/**
 * Quiz engine hook - manages quiz taking state
 * Uses shuffleMap for O(1) answer mapping (no indexOf fragility)
 * @param {Object} quiz - Quiz object with questions
 * @returns {Object} - Quiz engine interface
 */
export function useQuizEngine(quiz) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // Stores ORIGINAL indices
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Shuffle questions ONCE per quiz ID
  const questions = useMemo(() => {
    if (!quiz?.questions || quiz.questions.length === 0) return [];
    console.log('[QuizEngine] Shuffling questions for quiz:', quiz.id);
    return shuffleQuiz(quiz.questions);
  }, [quiz?.id]);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex] || null;

  // Select an answer for current question
  const selectAnswer = useCallback(
    (shuffledIdx) => {
      if (isSubmitted || !currentQuestion) return;
      
      setAnswers((prev) => {
        const qId = currentQuestion.id;
        const type = currentQuestion.type || QUESTION_TYPES.SINGLE;
        
        let originalIdx;
        if (type === QUESTION_TYPES.TEXT) {
          // Text answers are stored as-is (string)
          originalIdx = shuffledIdx;
        } else {
          // Use shuffleMap for O(1) reverse lookup — no indexOf fragility
          const shuffleMap = currentQuestion.shuffleMap;
          if (shuffleMap) {
            originalIdx = shuffleMap[shuffledIdx];
          } else {
            // Fallback if no shuffleMap (shouldn't happen, but be safe)
            originalIdx = shuffledIdx;
          }
        }

        let newAnswer;
        if (type === QUESTION_TYPES.MULTI) {
          const current = prev[qId] || [];
          if (current.includes(originalIdx)) {
            newAnswer = current.filter(i => i !== originalIdx).sort((a, b) => a - b);
          } else {
            newAnswer = [...current, originalIdx].sort((a, b) => a - b);
          }
        } else {
          newAnswer = originalIdx;
        }
        
        return { ...prev, [qId]: newAnswer };
      });
    },
    [isSubmitted, currentQuestion]
  );

  const calculateScore = useCallback(() => {
    let correct = 0;
    quiz.questions.forEach((q) => {
      const studentAns = answers[q.id];
      const correctAns = q.correctAnswer;
      const type = q.type || QUESTION_TYPES.SINGLE;

      if (studentAns === undefined || studentAns === null) {
        // Unanswered — skip
        return;
      }

      if (type === QUESTION_TYPES.SINGLE) {
        // Normalize to number for comparison (Firestore may return different types)
        if (Number(studentAns) === Number(correctAns)) correct++;
      } else if (type === QUESTION_TYPES.MULTI) {
        const s = Array.isArray(studentAns) ? [...studentAns].map(Number).sort((a, b) => a - b) : [];
        const c = Array.isArray(correctAns) ? [...correctAns].map(Number).sort((a, b) => a - b) : [Number(correctAns)];
        if (JSON.stringify(s) === JSON.stringify(c)) correct++;
      } else if (type === QUESTION_TYPES.TEXT) {
        if (studentAns?.toString().trim().toLowerCase() === correctAns?.toString().trim().toLowerCase()) {
          correct++;
        }
      }
    });
    return {
      correct,
      total: quiz.questions.length,
      percentage: quiz.questions.length > 0 ? Math.round((correct / quiz.questions.length) * 100) : 0,
      answers,
      questions: quiz.questions,
    };
  }, [answers, quiz.questions]);

  const submitQuiz = useCallback(() => {
    setIsSubmitted(true);
    return calculateScore();
  }, [calculateScore]);

  const nextQuestion = useCallback(() => {
    if (currentIndex < totalQuestions - 1) setCurrentIndex(prev => prev + 1);
  }, [currentIndex, totalQuestions]);

  const prevQuestion = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  }, [currentIndex]);

  const goToQuestion = useCallback((index) => {
    if (index >= 0 && index < totalQuestions) setCurrentIndex(index);
  }, [totalQuestions]);

  const answeredCount = Object.keys(answers).length;

  const isCurrentAnswered = useMemo(() => {
    if (!currentQuestion) return false;
    const ans = answers[currentQuestion.id];
    const type = currentQuestion.type || QUESTION_TYPES.SINGLE;
    if (type === QUESTION_TYPES.MULTI) return Array.isArray(ans) && ans.length > 0;
    if (type === QUESTION_TYPES.TEXT) return typeof ans === 'string' && ans.trim().length > 0;
    return ans !== undefined;
  }, [answers, currentQuestion]);

  // For the UI: Map the saved ORIGINAL index back to the current SHUFFLED index
  const selectedAnswer = useMemo(() => {
    if (!currentQuestion) return undefined;
    const origAns = answers[currentQuestion.id];
    if (origAns === undefined) return undefined;
    
    if (currentQuestion.type === QUESTION_TYPES.TEXT) return origAns;
    
    const shuffleMap = currentQuestion.shuffleMap;
    if (!shuffleMap) return origAns;

    // Build reverse map: reverseMap[originalIdx] = shuffledIdx
    const reverseMap = {};
    shuffleMap.forEach((origIdx, shuffledIdx) => {
      reverseMap[origIdx] = shuffledIdx;
    });

    if (Array.isArray(origAns)) {
      return origAns.map(idx => reverseMap[idx]).filter(idx => idx !== undefined);
    } else {
      return reverseMap[origAns] !== undefined ? reverseMap[origAns] : origAns;
    }
  }, [answers, currentQuestion]);

  return {
    currentIndex,
    currentQuestion,
    totalQuestions,
    answers,
    answeredCount,
    isCurrentAnswered,
    isSubmitted,
    questions,
    selectedAnswer,
    isFirstQuestion: currentIndex === 0,
    isLastQuestion: currentIndex === totalQuestions - 1,
    progress: totalQuestions > 0 ? (currentIndex + 1) / totalQuestions : 0,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    submitQuiz,
    calculateScore,
  };
}
