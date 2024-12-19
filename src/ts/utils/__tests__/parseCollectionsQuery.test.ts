import { parseCollectionsQuery } from '../parseCollectionsQuery'

describe('parseCollectionsQuery', () => {
  describe('when parsing basic query', () => {
    test('returns params', () => {
      const queryString = 'param1=value1&param2=value2'

      const result = parseCollectionsQuery(queryString)

      expect(result).toEqual({
        param1: 'value1',
        param2: 'value2'
      })
    })
  })

  describe('when query string is empty', () => {
    test('returns an empty object', () => {
      const result = parseCollectionsQuery('')
      expect(result).toEqual({})
    })
  })

  describe('when parsing temporal parameters', () => {
    test('returns parse temporal as an array', () => {
      const queryString = 'temporal=2000-01-01,2001-01-01'

      const result = parseCollectionsQuery(queryString)

      expect(result).toEqual({
        temporal: ['2000-01-01', '2001-01-01']
      })
    })
  })

  describe('when parsing facet params', () => {
    test('should remove default facet params', () => {
      const queryString = 'param=value&include_facets=v2&page_size=0&consortium=EOSDIS'
      const result = parseCollectionsQuery(queryString)
      expect(result).toEqual({
        param: 'value'
      })
    })
  })
})
