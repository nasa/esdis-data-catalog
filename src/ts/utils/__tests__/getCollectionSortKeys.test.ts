import {
  defaultSortKey,
  collectionSortKeys,
  getValidSortkey
} from '../getCollectionSortKeys'

describe('getCollectionSortKeys returns valid sort key configuration', () => {
  test('should have a default sort key', () => {
    expect(defaultSortKey).toBe('relevance')
  })

  test('should have a list of collection sort keys', () => {
    expect(collectionSortKeys).toEqual([
      {
        key: 'relevance',
        value: 'Relevance'
      },
      {
        key: '-usage_score',
        value: 'Usage'
      },
      {
        key: 'start_date',
        value: 'Start Date'
      },
      {
        key: '-ongoing',
        value: 'End Date'
      }
    ])
  })

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
