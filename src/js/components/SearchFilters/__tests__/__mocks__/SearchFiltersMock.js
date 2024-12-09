import { range } from 'lodash-es'

function groupFacet(title, children) {
  return {
    title,
    type: 'group',
    has_children: true,
    children
  }
}

function filterFacet(title, count, applied, url) {
  return {
    title,
    type: 'filter',
    applied,
    count,
    has_children: false,
    links: applied ? { remove: url } : { apply: url }
  }
}

function mockFacetGroup(prefix, url, name, param, appliedIndexes = [], childCount = 6) {
  const childPrefix = prefix + name.substring(0, 4)
  const children = []
  for (let i = 0; i < childCount; i += 1) {
    const title = `${childPrefix}${i}`
    children.push(filterFacet(
      title,
      10 * (1 + i),
      appliedIndexes.includes(i),
      `${url}&${encodeURIComponent(param.replace('0', `${appliedIndexes.length}`))}=${title}`
    ))
  }

  return groupFacet(name, children)
}

function mockCollection(prefix, mockIndex, overrides = {}) {
  return {
    meta: { 'concept-id': `C00${mockIndex}-FAKE` },
    umm: {
      EntryTitle: `${prefix} collection ${mockIndex}`,
      Abstract: `${prefix} summary ${mockIndex}`,
      ...overrides
    }
  }
}

export const makeMockResponse = (url, collectionCount, prefix = '', appliedFacets = {}) => ({
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
