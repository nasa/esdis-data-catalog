import nock from 'nock'
import { getConfig } from '../getConfig'
import { stringifyCollectionsQuery } from '../stringifyCollectionsQuery'
import { queryFacetedCollections } from '../queryFacetedCollections'

vi.mock('../getConfig')
vi.mock('../stringifyCollectionsQuery')

describe('queryFacetedCollections', () => {
  const cmrHost = 'https://cmr.example.com'

  beforeEach(() => {
    // Mock getConfig
    getConfig.mockReturnValue(cmrHost)

    // Mock stringifyCollectionsQuery
    stringifyCollectionsQuery.mockReturnValue('mocked_query_string')
  })

  afterEach(() => {
    vi.clearAllMocks()
    nock.cleanAll()
    nock.enableNetConnect()
  })

  describe('when both facet and collections requests are successful', () => {
    test('should return combined data from both requests', async () => {
      nock('https://cmr.example.com')
        .get('/search/collections.json?mocked_query_string')

        .reply(200, { facets: 'mock facets data' })

      nock(cmrHost)
        .get('/search/collections.umm_json?mocked_query_string')
        .reply(200, { items: 'mock collections data' })

      const result = await queryFacetedCollections({ keyword: 'test' })

      expect(result).toEqual({
        status: 200,
        message: 'OK',
        headers: expect.any(Object),
        query: 'mocked_query_string',
        data: { items: 'mock collections data' },
        facetData: { facets: 'mock facets data' }
      })
    })
  })

  describe('when collections request fails', () => {
    test('should throw an error with the collections response', async () => {
      nock(cmrHost)
        .get('/search/collections.json?mocked_query_string')
        .reply(200, { facets: 'mock facets data' })

      nock(cmrHost)
        .get('/search/collections.umm_json?mocked_query_string')
        .reply(500, 'Internal Server Error')

      await expect(queryFacetedCollections({ keyword: 'test' })).rejects.toThrow('Internal Server Error')
    })
  })
})
