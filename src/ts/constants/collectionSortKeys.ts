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

export const defaultSortKey = 'Relevance'

export const getValidSortkey = (x: string) => {
  if (!x) return 'Relevance'
  const found = collectionSortKeys.find((obj) => obj.key === x)

  return found ? found.value : null
}
