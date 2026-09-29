import facetDefaultParams from '../../constants/facetDefaultParams'
import { stringifyCollectionsQuery } from '../stringifyCollectionsQuery'

describe('stringifyCollectionsQuery', () => {
  describe('basic parameter stringification', () => {
    test('should stringify simple parameters', () => {
      const params = {
        bounding_box: '',
        processing_level_id_h: [],
        science_keywords_h: [],
        temporal: 'mock temporal value',
        keyword: 'mock keyword'
      }
      const result = stringifyCollectionsQuery(params)
      expect(result).toBe('bounding_box=&keyword=mock%20keyword')
    })
  })

  test('should stringify additional filter parameters', () => {
    const result = stringifyCollectionsQuery({
      has_granules_or_cwic: true,
      include_non_operational: true
    })

    expect(result).toBe('has_granules_or_cwic=true&include_non_operational=true')
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
        bounding_box: '',
        processing_level_id_h: [],
        science_keywords_h: [],
        temporal: 'mock temporal value',
        keyword: 'mock keyword',
        extraParam: 'value'
      }
      const result = stringifyCollectionsQuery(params, true)
      expect(result).toBe('bounding_box=&keyword=mock%20keyword&extraParam=value')
    })
  })
})
