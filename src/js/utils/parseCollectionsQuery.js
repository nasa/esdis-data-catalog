import { parse } from 'qs'
import facetDefaultParams from './facetDefaultParams'

/**
 * Parses a CMR collections query into a key/value object in a way that
 * `stringifyCollectionsQuery` will reverse. Notably transforms temporal
 * into an array of [start,end]. Does not parse strings into non-string
 * objects.
 *
 * @param {string} str The query string to parse
 * @returns {object} Key/value mappings of query param to value
 */
export const parseCollectionsQuery = (str) => {
  const result = parse(str, {
    allowSparse: true,
    ignoreQueryPrefix: true,
    duplicates: 'combine'
  })

  // Parse temporal as an array joined by comma
  if (result.temporal) {
    result.temporal = result.temporal.split(',')
  }

  // Remove default facet query params
  Object.entries(result).forEach(([k, v]) => {
    if (facetDefaultParams[k] === v) {
      delete result[k]
    }
  })

  return result
}
