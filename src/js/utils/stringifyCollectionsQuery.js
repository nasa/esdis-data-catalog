import { stringify } from 'qs'

import collectionDefaultParams from './collectionDefaultParams'
import facetDefaultParams from './facetDefaultParams'

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
export const stringifyCollectionsQuery = (params, removeDefaults = false) => {
  const toStringify = { ...params }

  // Temporal is an array joined by comma. It may have empty-string values
  if (toStringify.temporal && toStringify.temporal.filter((o) => o).length > 0) {
    toStringify.temporal = toStringify.temporal.join(',')
  } else {
    delete toStringify.temporal
  }

  if (removeDefaults) {
    Object.entries(toStringify).forEach(([k, v]) => {
      if (facetDefaultParams[k] === v || collectionDefaultParams[k] === v) {
        delete toStringify[k]
      }
    })
  }

  const result = stringify(toStringify, { encodeValuesOnly: true })

  // Transform params like xyz[0]=abc to xyz[]=abc while preserving
  // xyz[0][pqr]=abc to deal with CMR's quirks
  return result.replace(/\[\d+\]=/g, '[]=')
}
