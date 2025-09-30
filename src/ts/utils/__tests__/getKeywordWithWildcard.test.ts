import { getKeywordWithWildcard } from '../getKeywordWithWildcard'

describe('getKeywordWithWildcard', () => {
  test('should return exact phrase when enclosed in double quotes', () => {
    expect(getKeywordWithWildcard('"exact phrase"')).toBe('"exact phrase"')
  })

  test('should add wildcard to a single word', () => {
    expect(getKeywordWithWildcard('apple')).toBe('apple*')
  })

  test('should add wildcards after each word for multiple words', () => {
    expect(getKeywordWithWildcard('red apple')).toBe('red* apple*')
  })

  test('should handle multiple spaces between words', () => {
    expect(getKeywordWithWildcard('red  apple  pie')).toBe('red* apple* pie*')
  })

  test('should return an empty string for empty string input', () => {
    expect(getKeywordWithWildcard('')).toBe('')
  })

  test('should return an empty string for undefined input', () => {
    expect(getKeywordWithWildcard(undefined)).toBe('')
  })

  test('should return an empty string for null input', () => {
    expect(getKeywordWithWildcard(null)).toBe('')
  })
})
