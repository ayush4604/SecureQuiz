// useQuizEngine Hook - Quiz state machine for taking a quiz

import { useState, useCallback, useMemo } from 'react';
import { shuffleQuiz } from '../utils/shuffler';

import { QUESTION_TYPES } from '../utils/constants';

/**
 * Quiz engine hook - manages quiz taking state
 * @param {Object} quiz - Quiz object with questions
 * @returns {Object} - Quiz engine interface
 */
export function useQuizEngine(quiz) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Shuffle questions ONCE per quiz ID
  const questions = useMemo(() => {
    if (!quiz?.questions || quiz.questions.length === 0) return [];
    console.log('[QuizEngine] Shuffling questions for quiz:', quiz.id);
    return shuffleQuiz(quiz.questions);
    // Only re-shuffle if the quiz ID itself changes (new quiz)
  }, [quiz?.id]);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex] || null;

  // Select an answer for current question
  const selectAnswer = useCallback(
    (val) => {
      if (isSubmitted) return;
      
      setAnswers((prev) => {
        const type = currentQuestion?.type || QUESTION_TYPES.SINGLE;
        let newAnswer = val;

        if (type === QUESTION_TYPES.MULTI) {
          const current = prev[currentIndex] || [];
          if (current.includes(val)) {
            newAnswer = current.filter(i => i !== val);
          } else {
            newAnswer = [...current, val].sort();
          }
        }
        
        return {
          ...prev,
          [currentIndex]: newAnswer,
        };
      });
    },
    [currentIndex, isSubmitted, currentQuestion]
  );

  // Navigate to next question
  const nextQuestion = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, totalQuestions]);

  // Navigate to previous question
  const prevQuestion = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // Jump to specific question
  const goToQuestion = useCallback(
    (index) => {
      if (index >= 0 && index < totalQuestions) {
        setCurrentIndex(index);
      }
    },
    [totalQuestions]
  );

  // Calculate score
  const calculateScore = useCallback(() => {
    let correct = 0;
    questions.forEach((q, idx) => {
      const studentAns = answers[idx];
      const correctAns = q.correctAnswer;
      const type = q.type || QUESTION_TYPES.SINGLE;

      if (type === QUESTION_TYPES.SINGLE) {
        if (studentAns === correctAns) correct++;
      } else if (type === QUESTION_TYPES.MULTI) {
        // Must match exactly (all correct ones selected, no extras)
        const s = Array.isArray(studentAns) ? studentAns.sort() : [];
        const c = Array.isArray(correctAns) ? [...correctAns].sort() : [correctAns];
        if (JSON.stringify(s) === JSON.stringify(c)) correct++;
      } else if (type === QUESTION_TYPES.TEXT) {
        if (studentAns?.toString().trim().toLowerCase() === correctAns?.toString().trim().toLowerCase()) {
          correct++;
        }
      }
    });
    return {
      correct,
      total: totalQuestions,
      percentage: totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0,
      answers,
      questions,
    };
  }, [answers, questions, totalQuestions]);

  // Submit quiz
  const submitQuiz = useCallback(() => {
    setIsSubmitted(true);
    return calculateScore();
  }, [calculateScore]);

  // Count answered questions
  const answeredCount = Object.keys(answers).length;

  // Check if current question is answered
  const isCurrentAnswered = useMemo(() => {
    const ans = answers[currentIndex];
    const type = currentQuestion?.type || QUESTION_TYPES.SINGLE;
    
    if (type === QUESTION_TYPES.MULTI) {
      return Array.isArray(ans) && ans.length > 0;
    }
    if (type === QUESTION_TYPES.TEXT) {
      return typeof ans === 'string' && ans.trim().length > 0;
    }
    return ans !== undefined;
  }, [answers, currentIndex, currentQuestion]);

  return {
    // State
    currentIndex,
    currentQuestion,
    totalQuestions,
    answers,
    answeredCount,
    isCurrentAnswered,
    isSubmitted,
    questions,

    // Actions
    selectAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    submitQuiz,
    calculateScore,

    // Derived
    selectedAnswer: answers[currentIndex],
    isFirstQuestion: currentIndex === 0,
    isLastQuestion: currentIndex === totalQuestions - 1,
    progress: totalQuestions > 0 ? (currentIndex + 1) / totalQuestions : 0,
  };
}
