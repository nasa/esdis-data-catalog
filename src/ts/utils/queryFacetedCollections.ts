import fetch from 'cross-fetch'

import { pick } from 'lodash-es'

import { getConfig } from './getConfig'
import { stringifyCollectionsQuery } from './stringifyCollectionsQuery'
import collectionDefaultParams from '../constants/collectionDefaultParams'
import facetDefaultParams from '../constants/facetDefaultParams'
import { Params, QueryResult } from '../../types/global'
import { getKeywordWithWildcard } from './getKeywordWithWildcard'

const validParameters = [
  'bounding_box',
  'data_center_h',
  'granule_data_format_h',
  'horizontal_data_resolution_range',
  'keyword',
  'page_num',
  'page_size',
  'platforms_h',
  'latency',
  'processing_level_id_h',
  'science_keywords_h',
  'sort_key',
  'temporal'
] as const

type CustomError = Error & { response?: QueryResult };

/**
 * Merges default parameters with provided parameters, handling 'sort_key' specially.
 *
 * This function creates a new object based on the defaults and overrides them with
 * values from the params object. For the 'sort_key' parameter, if it exists in both
 * objects and the default value is an array, it replaces only the first element of
 * the array, preserving any additional default sort keys.
 *
 * @param {object} defaults - The default parameters object.
 * @param {object} params - The provided parameters object to merge with defaults.
 * @returns {object} A new object with merged parameters.
 *
 * @example
 * const defaults = {
 *   page_size: 20,
 *   sort_key: ['-score', '-create-data-date'],
 *   consortium: 'EOSDIS'
 * };
 *
 * const params = {
 *   page_size: 50,
 *   sort_key: 'start_date'
 * };
 *
 * const result = customMergeParams(defaults, params);
 * console.log(result);
 * // Output:
 * // {
 * //   page_size: 50,
 * //   sort_key: ['start_date', '-create-data-date'],
 * //   consortium: 'EOSDIS'
 * // }
 */
const customMergeParams = (defaults: any, params: any) => {
  const result = { ...defaults }

  Object.keys(params).forEach((key) => {
    if (key === 'sort_key' && Array.isArray(result[key])) {
      // If sort_key exists in params, replace the first element of the default array
      if (params[key]) {
        result[key] = [params[key], ...result[key].slice(1)]
      }
    } else {
      // For all other keys, simply override the default value
      result[key] = params[key]
    }
  })

  return result
}

/**
 * Queries collections with facets in UMM-C format
 * @param {object} queryParams The query params in CMR's format
 * @returns {Promise<Response>} The response from the CMR
 */
export const queryFacetedCollections = async (params: Params): Promise<QueryResult> => {
  // Problem:
  //   1. GraphQL has the fields of UMM but can't use URLs supplied by facets
  //   2. UMM-JSON has the fields of UMM and can use URLs from facets but can't return facets
  //   3. Atom+JSON can use URLs from facets and return facets but doesn't have all the fields of UMM
  //
  // CMR issues filed. Workaround: We need to fire two queries and combine them, one to get facets
  // from Atom+JSON and one to get collection results from UMM-JSON

  const cmrParams = pick(params, validParameters)

  const cmrHost = getConfig('cmrHost')

  // Process keyword parameter with wildcards
  const { keyword = '' } = cmrParams
  const keywordWithWildcard = getKeywordWithWildcard(keyword)

  // Create a new object with the updated keyword
  const updatedCmrParams = {
    ...cmrParams,
    ...(keywordWithWildcard ? { keyword: keywordWithWildcard } : {})
  }

  const facetsQuery = stringifyCollectionsQuery({
    ...facetDefaultParams,
    ...updatedCmrParams
  }, false)

  const collectionsQuery = stringifyCollectionsQuery(
    customMergeParams(collectionDefaultParams, updatedCmrParams),
    false
  )
  const facetsUrl = `${cmrHost}/search/collections.json?${facetsQuery}`
  const collectionsUrl = `${cmrHost}/search/collections.umm_json?${collectionsQuery}`

  const [facets, collections] = await Promise.all([fetch(facetsUrl), fetch(collectionsUrl)])

  // Provide status / message / headers from the facets query unless collections failed
  const response = !collections.ok ? collections : facets

  const result: QueryResult = {
    status: response.status,
    message: response.statusText,
    headers: response.headers,
    query: collectionsQuery
  }
  try {
    // Clone required because fetch only allowed reading body once
    result.data = await collections.clone().json()
    result.facetData = await facets.clone().json()
  } catch (e) {
    console.warn('Unable to parse JSON', e)
  }

  if (!response.ok) {
    const error: CustomError = new Error(response.statusText)
    error.response = result
    throw error
  }

  return result
}
