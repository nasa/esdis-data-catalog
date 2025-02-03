/**
 * The default sort key used for sorting collections.
 */
export const defaultSortKey = 'relevance'

/**
 * An array of objects representing the available sort keys for collections.
 * Each object contains a `key` which is used for sorting and a `value` which is the display name.
 */
export const collectionSortKeys = [
  {
    key: 'relevance',
    value: 'Relevance'
  },
  {
    key: '-usage_score',
    value: 'Usage'
  },
  {
    key: 'start_date',
    value: 'Start Date'
  },
  {
    key: '-ongoing',
    value: 'End Date'
  }
]
