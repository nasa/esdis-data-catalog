import { range } from 'lodash-es'
import { getConfig } from '../utils/getConfig'
import { Facet } from '../../types/global'

export const host = getConfig('cmrHost')
interface Collection {
  meta: {
    'concept-id': string;
  };
  umm: {
    EntryTitle: string;
    Abstract: string;
  };
}

function groupFacet(title: string, children: Facet[]): Facet {
  return {
    title,
    type: 'group',
    hasChildren: true,
    children,
    applied: children.some((child) => child.applied),
    count: children.reduce((sum, child) => sum + child.count, 0)
  }
}

function mockFacetGroup(prefix: string, url: string, name: string, param: string, appliedIndexes: number[] = [], childCount = 6): Facet {
  const childPrefix = prefix + name.substring(0, 4)
  const children: Facet[] = []
  for (let i = 0; i < childCount; i += 1) {
    const title = `${childPrefix}${i}`
    const applied = appliedIndexes.includes(i)
    children.push({
      title,
      type: 'filter',
      applied,
      count: 10 * (1 + i),
      hasChildren: false,
      children: [],
      links: applied ? { remove: `${url}&${encodeURIComponent(param.replace('0', `${appliedIndexes.length}`))}=${title}` }
        : { apply: `${url}&${encodeURIComponent(param.replace('0', `${appliedIndexes.length}`))}=${title}` }
    })
  }

  return groupFacet(name, children)
}

function mockCollection(prefix: string, mockIndex: number, overrides: Partial<Collection['umm']> = {}): Collection {
  return {
    meta: { 'concept-id': `C00${mockIndex}-FAKE` },
    umm: {
      EntryTitle: `${prefix} collection ${mockIndex}`,
      Abstract: `${prefix} summary ${mockIndex}`,
      ...overrides
    }
  }
}

interface AppliedFacets {
  keywords?: number[];
  platforms?: number[];
  dataFormat?: number[];
  processingLevels?: number[];
  Latency?: number[];
  horizontalResolution?: number[];
}

interface MockResponse {
  searchResponse: {
    items: Collection[];
  };
  facetsResponse: {
    feed: {
      entry: Collection[];
      facets: Facet;
    };
  };
}

export const makeMockResponse = (url: string, collectionCount: number, prefix = '', appliedFacets: AppliedFacets = {}): MockResponse => ({
  searchResponse: {
    items: range(1, collectionCount + 1).map((i) => mockCollection(prefix, i))
  },
  facetsResponse: {
    feed: {
      entry: range(1, collectionCount + 1).map((i) => mockCollection(prefix, i)),
      facets: groupFacet('Browse Collections', [
        mockFacetGroup(prefix, url, 'Keywords', 'science_keywords_h[0][topic]', appliedFacets.keywords),
        mockFacetGroup(prefix, url, 'Platforms', 'platforms_h[0][basis]', appliedFacets.platforms),
        mockFacetGroup(prefix, url, 'Data Format', 'granule_data_format_h[]', appliedFacets.dataFormat),
        mockFacetGroup(prefix, url, 'Processing Levels', 'processing_level_id_h[]', appliedFacets.processingLevels),
        mockFacetGroup(prefix, url, 'Latency', 'science_keywords_h[]', appliedFacets.Latency),
        mockFacetGroup(prefix, url, 'Horizontal Data Resolution', 'horizontal_data_resolution_range[]', appliedFacets.horizontalResolution)
      ])
    }
  }
})

export const baseFacetsUrl = `${host}/search/collections.json`
export const baseSearchUrl = `${host}/search/collections.umm_json`

export const defaultFacetsParams = 'include_facets=v2&page_size=0&consortium=EOSDIS'
export const defaultSearchParams = 'page_num=1&page_size=20&consortium=EOSDIS'

export const defaultFacetsUrl = `${baseFacetsUrl}?${defaultFacetsParams}`
export const defaultSearchUrl = `${baseSearchUrl}?${defaultSearchParams}`

export const baseFacetsPath = '/search/collections.json'
export const baseSearchPath = '/search/collections.umm_json'

export const defaultFacetsPath = `${baseFacetsPath}?${defaultFacetsParams}`
export const defaultSearchPath = `${baseSearchPath}?${defaultSearchParams}`
