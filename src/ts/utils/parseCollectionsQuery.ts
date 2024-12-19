import { parse } from 'qs'
import facetDefaultParams, { FacetDefaultParams } from '../constants/facetDefaultParams'
import { Params } from '../../types/global'

/**
 * Parses a CMR collections query into a key/value object in a way that
 * `stringifyCollectionsQuery` will reverse. Notably transforms temporal
 * into an array of [start,end]. Does not parse strings into non-string
 * objects.
 *
 * @param {string} str The query string to parse
 * @returns {object} Key/value mappings of query param to value
 */
export const parseCollectionsQuery = (query: string) => {
  const result: Params = parse(query, {
    allowSparse: true,
    ignoreQueryPrefix: true,
    duplicates: 'combine'
  })

  // Parse temporal as an array joined by comma
  if (typeof result.temporal === 'string') {
    result.temporal = result.temporal.split(',')
  }

  // Remove default facet query params
  Object.entries(result).forEach(([k, v]) => {
    if (k in facetDefaultParams && facetDefaultParams[k as keyof FacetDefaultParams] === v) {
      delete (result as { [key: string]: string })[k]
    }
  })

  return result
}
