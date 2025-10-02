/**
 * The delay in milliseconds before submitting a search query.
 *
 * This constant is used to implement a debounce mechanism for search inputs.
 * It helps reduce the number of API calls made while the user is still typing,
 * by waiting for a brief pause in input before submitting the query.
 *
 * @constant
 * @type {number}
 * @default 600
 */
export const SUBMIT_DELAY_MS = 600
