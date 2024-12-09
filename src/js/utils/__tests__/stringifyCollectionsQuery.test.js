import facetDefaultParams from '../facetDefaultParams'
import { stringifyCollectionsQuery } from '../stringifyCollectionsQuery'

describe('stringifyCollectionsQuery', () => {
  describe('basic parameter stringification', () => {
    test('should stringify simple parameters', () => {
      const params = {
        param1: 'value1',
        param2: 'value2'
      }
      const result = stringifyCollectionsQuery(params)
      expect(result).toBe('param1=value1&param2=value2')
    })
  })

  describe('handling temporal parameter', () => {
    test('should join temporal array with comma', () => {
      const params = { temporal: ['2000-01-01', '2001-01-01'] }
      const result = stringifyCollectionsQuery(params)
      expect(result).toBe('temporal=2000-01-01%2C2001-01-01')
    })

    test('should remove temporal if all values are empty', () => {
      const params = { temporal: ['', ''] }
      const result = stringifyCollectionsQuery(params)
      expect(result).toBe('')
    })
  })

  describe('removing default parameters', () => {
    test('should remove default facet params when removeDefaults is true', () => {
      const params = {
        ...facetDefaultParams,
        extraParam: 'value'
      }
      const result = stringifyCollectionsQuery(params, true)
      expect(result).toBe('extraParam=value')
    })
  })
})
