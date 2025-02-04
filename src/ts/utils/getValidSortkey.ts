import { collectionSortKeys } from '../constants/sortKeys'
/**
 * Query the list of valid collection sort keys and return the value for the key
 * @param {string} sortKey The sort key to check
 * @returns {string|null} The valid sort key or null
 */
export const getValidSortkey = (sortKey: string) => {
  const found = collectionSortKeys.find((validSortKey) => validSortKey.key === sortKey)

  return found ? found.value : null
}
