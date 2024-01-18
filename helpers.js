// function capitalizeFirstLetter(string) {
//   string = string.toLowerCase();
//   return string.charAt(0).toUpperCase() + string.slice(1);
// }

// module.exports = {
//   capitalizeFirstLetter,
// };

/**
 * Capitalizes the first letter of a given string.
 * @param {string} string - The input string.
 * @returns {string} - The string with the first letter capitalized.
 */
function capitalizeFirstLetter(string) {
  /**
   * Convert the string to lowercase.
   * @type {string}
   */
  string = string.toLowerCase();

  /**
   * Capitalize the first letter and concatenate the rest of the string.
   * @type {string}
   */
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Exports the capitalizeFirstLetter function.
 * @module
 */
module.exports = {
  capitalizeFirstLetter,
};
