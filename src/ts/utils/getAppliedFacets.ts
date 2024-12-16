import { Facet } from '../../types/global'

/**
 * Takes a parsed list of facets returned from CMR and returns a flat list
 * of all the facet filters that are applied
 *
 * @param {object} root The root of the facet tree
 * @returns {Array<object>} A list of applied facets of type "filter" in the tree
 */
export const getAppliedFacets = (root: Facet): Facet[] => {
  // Applied set explicitly `false` (not `undefined`) won't have applied descendents
  if (root.applied === false) return []

  // Recurse on all children that aren't marked as unapplied
  const result = (root.children || [])
    .filter((child) => (child.applied !== false))
    .flatMap(getAppliedFacets)

  // Add self to the front of the list if it's applied
  if (root.type === 'filter') result.unshift(root)

  return result
}

export default getAppliedFacets
