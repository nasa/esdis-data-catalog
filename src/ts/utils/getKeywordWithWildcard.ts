/**
 * Transforms a keyword string by adding wildcards or preserving exact phrases.
 *
 * This function processes the input keyword in two ways:
 * 1. If the keyword is an exact phrase (enclosed in double quotes), it's returned as-is.
 * 2. If the keyword is not an exact phrase, wildcards (*) are added after each word.
 *
 * @param keyword - The input keyword string to process.
 * @returns The processed keyword string with wildcards, or undefined if the input is falsy.
 *
 * @example
 * // Exact phrase - returns the same string
 * getKeywordWithWildcard('"exact phrase"') // Returns: '"exact phrase"'
 *
 * @example
 * // Single word - adds wildcard at the end
 * getKeywordWithWildcard('apple') // Returns: 'apple*'
 *
 * @example
 * // Multiple words - adds wildcard after each word
 * getKeywordWithWildcard('red apple') // Returns: 'red* apple*'
 *
 * @example
 * // Empty string or undefined - returns undefined
 * getKeywordWithWildcard('') // Returns: undefined
 * getKeywordWithWildcard(undefined) // Returns: undefined
 */
export const getKeywordWithWildcard = (keyword: string) => {
  let keywordWithWildcard
  if (keyword && keyword.match(/(".*")/)) {
    keywordWithWildcard = keyword
  } else if (keyword) {
    keywordWithWildcard = `${keyword.replace(/\s+/g, '* ')}*`
  }

  return keywordWithWildcard
}
