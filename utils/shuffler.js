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
 * Shuffle an array and return both the shuffled result and a permutation map.
 * shuffleMap[shuffledIndex] = originalIndex
 *
 * @param {Array} array - Array to shuffle
 * @returns {{ shuffled: Array, shuffleMap: number[] }}
 */
export function shuffleWithMap(array) {
  // Create index array [0, 1, 2, 3, ...]
  const indices = array.map((_, i) => i);

  // Shuffle the indices using Fisher-Yates
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  // Build the shuffled array following the index order
  const shuffled = indices.map(i => array[i]);

  // shuffleMap[shuffledPosition] = originalPosition
  return { shuffled, shuffleMap: indices };
}

/**
 * Shuffle questions and their options, tracking correct answer indices
 * Uses explicit permutation maps instead of fragile indexOf lookups
 * 
 * @param {Array} questions - Array of question objects
 * @returns {Array} - Shuffled questions with shuffled options and shuffleMaps
 */
export function shuffleQuiz(questions) {
  if (!questions) return [];
  
  // Shuffle question order
  const shuffledQuestions = shuffle(questions);

  // Shuffle options within each question
  return shuffledQuestions.map((q) => {
    // Skip if it's a text question or has no options
    if (!q.options || q.options.length === 0) return { ...q };

    // Shuffle options with a tracked permutation map
    const { shuffled: shuffledOptions, shuffleMap } = shuffleWithMap(q.options);

    // DON'T modify correctAnswer — leave it as the original index
    // The quiz engine will use shuffleMap to do all lookups
    return {
      ...q,
      options: shuffledOptions,
      // shuffleMap[shuffledIdx] = originalIdx (for reverse lookup)
      shuffleMap,
      // Keep original correctAnswer untouched for grading
      // (q.correctAnswer is already the original index from Firebase)
    };
  });
}
