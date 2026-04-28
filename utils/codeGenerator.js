// Generate unique quiz codes

import { QUIZ_CODE_LENGTH } from './constants';

/**
 * Generate a random numeric code of specified length
 * @param {number} length - Code length (default 6)
 * @returns {string} - Random numeric code
 */
export function generateQuizCode(length = QUIZ_CODE_LENGTH) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  // Ensure first digit is not 0
  if (code[0] === '0') {
    code = (Math.floor(Math.random() * 9) + 1).toString() + code.slice(1);
  }
  return code;
}

/**
 * Generate a unique ID
 * @returns {string} - Unique ID string
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}
