export const defaultSortKey = 'relevance'

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

export const getValidSortkey = (sortKey: string) => {
  const found = collectionSortKeys.find((validSortKey) => validSortKey.key === sortKey)

  return found ? found.value : null
}
