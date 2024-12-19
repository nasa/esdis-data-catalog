import { stringify } from 'qs'
import { isEqual } from 'lodash'

import collectionDefaultParams from '../constants/collectionDefaultParams'
import facetDefaultParams from '../constants/facetDefaultParams'

interface Params {
  bounding_box?: string
  processing_level_id_h?: string[]
  science_keywords_h?: string[]
  temporal?: string[] | string
  keyword?: string
}

/**
 * Transforms the given CMR query parameters into a string representation appropriate
 * for use in a URL. If `removeDefaults` is `true`, it will remove parameters that
 * are explicitly set to their default value for a somewhat cleaner URL
 *
 * @param {object} params The parameters to stringify
 * @param {boolean} removeDefaults True if parameters with their default values should
 *   be omitted from the string representation
 * @returns {string} a query string representation of the parameters
 */
export const stringifyCollectionsQuery = (params: Params, removeDefaults = false) => {
  const toStringify: Params = { ...params }

  // Temporal is an array joined by comma. It may have empty-string values
  if (toStringify.temporal
    && Array.isArray(toStringify.temporal)
    && toStringify.temporal.filter((o) => o).length > 0) {
    toStringify.temporal = toStringify.temporal.join(',')
  } else {
    delete toStringify.temporal
  }

  // ...

  if (removeDefaults) {
    Object.entries(toStringify as Record<string, unknown>).forEach(([k, v]) => {
      if ((k in facetDefaultParams
        && isEqual(facetDefaultParams[k as keyof typeof facetDefaultParams], v))
        || (k in collectionDefaultParams
          && isEqual(collectionDefaultParams[k as keyof typeof collectionDefaultParams], v))) {
        delete (toStringify as Record<string, unknown>)[k]
      }
    })
  }

  const result = stringify(toStringify, { encodeValuesOnly: true })

  // Transform params like xyz[0]=abc to xyz[]=abc while preserving
  // xyz[0][pqr]=abc to deal with CMR's quirks
  return result.replace(/\[\d+\]=/g, '[]=')
}
