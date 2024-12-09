import { getAppliedFacets } from '../getAppliedFacets'

describe('getAppliedFacets', () => {
  describe('when basic root is provided', () => {
    test('should return an empty array', () => {
      const root = {
        applied: false,
        children: [{
          type: 'filter',
          applied: true
        }]
      }
      expect(getAppliedFacets(root)).toEqual([])
    })
  })

  describe('when root has no children', () => {
    test('should return an empty array if root is not a filter', () => {
      const root = { type: 'group' }
      expect(getAppliedFacets(root)).toEqual([])
    })
  })

  describe('when root has children', () => {
    it('should return applied filters from children', () => {
      const root = {
        type: 'group',
        children: [
          {
            type: 'filter',
            applied: true
          },
          {
            type: 'filter',
            applied: false
          },
          {
            type: 'filter',
            applied: true
          }
        ]
      }
      expect(getAppliedFacets(root)).toEqual([root.children[0], root.children[2]])
    })
  })
})
