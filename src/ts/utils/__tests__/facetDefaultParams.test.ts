import facetDefaultParams from '../facetDefaultParams'

describe('facetDefaultParams', () => {
  test('returns default values', () => {
    const expectedResult = {
      include_facets: 'v2',
      page_size: '0',
      consortium: 'EOSDIS'
    }

    const result = facetDefaultParams

    expect(result).toEqual(expectedResult)
  })
})
