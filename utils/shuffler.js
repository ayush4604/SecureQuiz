// Fisher-Yates shuffle for randomizing questions and answers

/**
 * Shuffle an array in place using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array (same reference)
 */
export function shuffle(array) {
  const arr = [...array]; // Create copy
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Shuffle questions and their options, tracking correct answer indices
 * @param {Array} questions - Array of question objects
 * @returns {Array} - Shuffled questions with shuffled options
 */
export function shuffleQuiz(questions) {
  if (!questions) return [];
  
  // Shuffle question order
  const shuffledQuestions = shuffle(questions);

  // Shuffle options within each question
  return shuffledQuestions.map((q) => {
    // Skip if it's a text question or has no options
    if (!q.options || q.options.length === 0) return q;

    // 1. Get the actual text of the correct answer(s)
    let correctText;
    if (Array.isArray(q.correctAnswer)) {
      correctText = q.correctAnswer.map(index => q.options[index]);
    } else {
      correctText = q.options[q.correctAnswer];
    }

    // 2. Shuffle the options
    const shuffledOptions = shuffle(q.options);

    // 3. Find the new index/indices of the correct answer(s)
    let newCorrectAnswer;
    if (Array.isArray(q.correctAnswer)) {
      newCorrectAnswer = correctText.map(text => shuffledOptions.indexOf(text)).sort((a, b) => a - b);
    } else {
      newCorrectAnswer = shuffledOptions.indexOf(correctText);
    }

    return {
      ...q,
      options: shuffledOptions,
      correctAnswer: newCorrectAnswer,
      originalOptions: q.options, // Keep reference to original order
    };
  });
}
