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

  test('should return undefined for empty string', () => {
    expect(getKeywordWithWildcard('')).toBeUndefined()
  })

  test('should return undefined for undefined input', () => {
    // @ts-ignore
    expect(getKeywordWithWildcard(undefined)).toBeUndefined()
  })
})
