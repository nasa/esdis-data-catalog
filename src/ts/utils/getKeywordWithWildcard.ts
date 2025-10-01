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
 * Exact phrase - returns the same string
 * getKeywordWithWildcard('"exact phrase"') // Returns: '"exact phrase"'
 *
 * @example
 * Single word - adds wildcard at the end
 * getKeywordWithWildcard('apple') // Returns: 'apple*'
 *
 * @example
 * Multiple words - adds wildcard after each word
 * getKeywordWithWildcard('red apple') // Returns: 'red* apple*'
 *
 * @example
 * Empty string, undefined, or null - returns undefined
 * getKeywordWithWildcard('') // Returns: undefined
 * getKeywordWithWildcard(undefined) // Returns: undefined
 * getKeywordWithWildcard(null) // Returns: undefined
 */
export const getKeywordWithWildcard = (keyword?: string | null): string | undefined => {
  if (!keyword) return undefined

  if (keyword.match(/^".*"$/)) {
    return keyword
  }

  return `${keyword.replace(/\s+/g, '* ')}*`
}
