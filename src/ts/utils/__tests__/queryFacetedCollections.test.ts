import nock from 'nock'
import { getConfig } from '../getConfig'
import { stringifyCollectionsQuery } from '../stringifyCollectionsQuery'
import { queryFacetedCollections } from '../queryFacetedCollections'
import collectionDefaultParams from '../../constants/collectionDefaultParams'

vi.mock('../getConfig')
vi.mock('../stringifyCollectionsQuery')

const mockedGetConfig = getConfig as ReturnType<typeof vi.fn>
const mockedStringifyCollectionsQuery = stringifyCollectionsQuery as ReturnType<typeof vi.fn>

describe('queryFacetedCollections', () => {
  const cmrHost = 'https://cmr.example.com'

  beforeEach(() => {
    mockedGetConfig.mockReturnValue(cmrHost)
    mockedStringifyCollectionsQuery.mockReturnValue('mocked_query_string')
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

  describe('sort_key handling', () => {
    test('should always include -create-data-date as a sort key', async () => {
      nock(cmrHost)
        .get(/\/search\/collections\.json.*/)
        .reply(200, { facets: 'mock facets data' })
        .persist()

      nock(cmrHost)
        .get(/\/search\/collections\.umm_json.*/)
        .reply(200, { items: 'mock collections data' })
        .persist()

      // Test with no sort_key provided
      await queryFacetedCollections({ keyword: 'test' })
      expect(mockedStringifyCollectionsQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          sort_key: expect.arrayContaining(['-create-data-date'])
        }),
        false
      )

      // Test with a custom sort_key provided
      await queryFacetedCollections({ keyword: 'test', sort_key: 'start_date' })
      expect(mockedStringifyCollectionsQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          sort_key: ['start_date', '-create-data-date']
        }),
        false
      )

      // Verify that the default sort_key is preserved
      expect(collectionDefaultParams.sort_key).toEqual(['-score', '-create-data-date'])
    })
  })
})
