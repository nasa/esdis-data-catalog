/**
 * Formats a number as a degree string with the degree symbol (°)
 * @param {number} value The numeric value to format
 * @returns {string} The formatted degree string (e.g., "45°" or "45.5°")
 */
export const getDegrees = (value: number) => {
  if (value % 1 !== 0) {
    return `${value.toString()}\xB0`
  }

  return `${value.toFixed(1)}\xB0`
}
