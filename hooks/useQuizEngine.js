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

  // Find the original question object to get original indices/answers
  const getOriginalQuestion = useCallback((qId) => {
    return quiz.questions.find(q => q.id === qId);
  }, [quiz.questions]);

  // Select an answer for current question
  const selectAnswer = useCallback(
    (shuffledIdx) => {
      if (isSubmitted || !currentQuestion) return;
      
      setAnswers((prev) => {
        const qId = currentQuestion.id;
        const type = currentQuestion.type || QUESTION_TYPES.SINGLE;
        
        let originalIdx;
        if (type === QUESTION_TYPES.TEXT) {
          originalIdx = shuffledIdx;
        } else {
          // Map shuffled selection back to original index
          const selectedText = currentQuestion.options[shuffledIdx];
          const origQ = getOriginalQuestion(qId);
          originalIdx = origQ.options.indexOf(selectedText);
        }

        let newAnswer;
        if (type === QUESTION_TYPES.MULTI) {
          const current = prev[qId] || [];
          if (current.includes(originalIdx)) {
            newAnswer = current.filter(i => i !== originalIdx).sort();
          } else {
            newAnswer = [...current, originalIdx].sort();
          }
        } else {
          newAnswer = originalIdx;
        }
        
        return { ...prev, [qId]: newAnswer };
      });
    },
    [isSubmitted, currentQuestion, getOriginalQuestion]
  );

  const calculateScore = useCallback(() => {
    let correct = 0;
    quiz.questions.forEach((q) => {
      const studentAns = answers[q.id];
      const correctAns = q.correctAnswer;
      const type = q.type || QUESTION_TYPES.SINGLE;

      if (type === QUESTION_TYPES.SINGLE) {
        if (studentAns === correctAns) correct++;
      } else if (type === QUESTION_TYPES.MULTI) {
        const s = Array.isArray(studentAns) ? [...studentAns].sort() : [];
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
    
    const origQ = getOriginalQuestion(currentQuestion.id);
    if (Array.isArray(origAns)) {
      return origAns.map(idx => {
        const text = origQ.options[idx];
        return currentQuestion.options.indexOf(text);
      }).filter(idx => idx !== -1);
    } else {
      const text = origQ.options[origAns];
      return currentQuestion.options.indexOf(text);
    }
  }, [answers, currentQuestion, getOriginalQuestion]);

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
