/**
 * Money Helper Utility for handling currency calculations in Rupees and Paise.
 * 
 * Rules:
 * - All amounts in DB, backend logic, API responses, and UI are in Rupees with 2 decimal places.
 * - Razorpay API requires amounts in Paise (integer).
 * - Avoid floating point arithmetic issues (e.g. 0.1 + 0.2).
 */

/**
 * Convert Rupees (float/number) to Paise (integer)
 * e.g., 99.99 -> 9999, 100 -> 10000, 0.1 + 0.2 -> 30
 * @param {number|string} rupees 
 * @returns {number} Paise as an integer
 */
const toPaise = (rupees) => {
  const num = typeof rupees === 'number' ? rupees : parseFloat(rupees);
  if (isNaN(num) || num < 0) {
    throw new Error(`Invalid rupee amount for paise conversion: ${rupees}`);
  }
  // Math.round to mitigate floating point precision errors
  return Math.round(Math.round(num * 1000) / 10);
};

/**
 * Convert Paise (integer) to Rupees (float rounded to 2 decimal places)
 * e.g., 9999 -> 99.99
 * @param {number} paise 
 * @returns {number} Rupees as a 2-decimal number
 */
const fromPaise = (paise) => {
  const num = typeof paise === 'number' ? paise : parseInt(paise, 10);
  if (isNaN(num) || num < 0) {
    throw new Error(`Invalid paise amount for rupee conversion: ${paise}`);
  }
  return Number((num / 100).toFixed(2));
};

/**
 * Format a rupee amount to exactly 2 decimal places float
 * @param {number|string} amount 
 * @returns {number}
 */
const toRupees = (amount) => {
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(num)) return 0;
  return Number(num.toFixed(2));
};

module.exports = {
  toPaise,
  fromPaise,
  toRupees,
};
