import { getValidSortkey } from '../getValidSortkey'

describe('getCollectionSortKeys returns valid sort key configuration', () => {
  test('should return the correct value for a valid sort key', () => {
    expect(getValidSortkey('relevance')).toBe('Relevance')
    expect(getValidSortkey('-usage_score')).toBe('Usage')
    expect(getValidSortkey('start_date')).toBe('Start Date')
    expect(getValidSortkey('-ongoing')).toBe('End Date')
  })

  test('should return null for an invalid sort key', () => {
    expect(getValidSortkey('invalid_key')).toBeNull()
  })
})
