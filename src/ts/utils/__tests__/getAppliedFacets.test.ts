import { Facet } from '../../../types/global'
import { getAppliedFacets } from '../getAppliedFacets'

describe('getAppliedFacets', () => {
  describe('when basic root is provided', () => {
    test('should return an empty array', () => {
      const root: Facet = {
        type: 'root',
        applied: false,
        count: 0,
        hasChildren: true,
        title: 'Root',
        children: [{
          type: 'child',
          applied: true,
          count: 1,
          hasChildren: false,
          title: 'Child'
        }]
      }
      expect(getAppliedFacets(root)).toEqual([])
    })
  })

  describe('when root has no children', () => {
    test('should return an empty array if root is not a filter', () => {
      const root: Facet = {
        type: 'group',
        applied: false,
        count: 0,
        hasChildren: false,
        title: 'Group'
      }
      expect(getAppliedFacets(root)).toEqual([])
    })
  })

  describe('when root has children', () => {
    it('should return applied filters from children', () => {
      const root: Facet = {
        type: 'group',
        applied: true,
        count: 0,
        hasChildren: true,
        title: 'Root',
        children: [
          {
            type: 'filter',
            applied: true,
            count: 0,
            hasChildren: false,
            title: 'Group'
          },
          {
            type: 'filter',
            applied: false,
            count: 0,
            hasChildren: false,
            title: 'Group'
          },
          {
            type: 'filter',
            applied: true,
            count: 0,
            hasChildren: false,
            title: 'Group'
          }
        ]
      }
      expect(getAppliedFacets(root)).toEqual([
        ...(root.children?.[0] ? [root.children[0]] : []),
        ...(root.children?.[2] ? [root.children[2]] : [])
      ])
    })
  })
})
