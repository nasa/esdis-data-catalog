import React from 'react'

import { MemoryRouter as Router } from 'react-router-dom'
import {
  render,
  screen,
  waitFor
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { FacetChecklist } from '../FacetChecklist'

vi.mock('react-responsive', () => ({
  useMediaQuery: vi.fn(() => true)
}))

const setup = (facetCount) => {
  const facets = []
  for (let i = 0; i < facetCount; i += 1) {
    facets.push({
      title: `facet${i}`,
      count: 10
    })
  }

  const user = userEvent.setup()

  render(
    <Router>
      <FacetChecklist
        facets={facets}
        name="test facets"
        param="test_vs"
        onChange={vi.fn()}
      />
    </Router>
  )

  return user
}

describe('FacetChecklist component', () => {
  describe('when there are more than five facets', () => {
    test('displays only the first five facets by default, with a button to show all', () => {
      setup(10)

      expect(screen.queryByText('Show all test facets')).toBeInTheDocument()
      expect(screen.queryByText('facet0 (10)')).toBeInTheDocument()
      expect(screen.queryByText('facet4 (10)')).toBeInTheDocument()
      expect(screen.queryByText('facet5 (10)')).not.toBeInTheDocument()
      expect(screen.queryByText('facet9 (10)')).not.toBeInTheDocument()
      expect(screen.queryByText('Collapse test facets list')).not.toBeInTheDocument()
    })

    test('displays all facets with a button to show less when "Show all" is clicked', async () => {
      const user = setup(10)

      await waitFor(() => user.click(screen.getByText('Show all test facets')))

      expect(screen.queryByText('Collapse test facets list')).toBeInTheDocument()
      expect(screen.queryByText('facet0 (10)')).toBeInTheDocument()
      expect(screen.queryByText('facet4 (10)')).toBeInTheDocument()
      expect(screen.queryByText('facet5 (10)')).toBeInTheDocument()
      expect(screen.queryByText('facet9 (10)')).toBeInTheDocument()
      expect(screen.queryByText('Show all test facets')).not.toBeInTheDocument()
    })

    test('shows only the first five facets when "Collapse" is clicked after expanding', async () => {
      const user = setup(10)

      await waitFor(() => user.click(screen.getByText('Show all test facets')))
      await waitFor(() => user.click(screen.getByText('Collapse test facets list')))

      expect(screen.queryByText('Show all test facets')).toBeInTheDocument()
      expect(screen.queryByText('facet0 (10)')).toBeInTheDocument()
      expect(screen.queryByText('facet4 (10)')).toBeInTheDocument()
      expect(screen.queryByText('facet5 (10)')).not.toBeInTheDocument()
      expect(screen.queryByText('facet9 (10)')).not.toBeInTheDocument()
      expect(screen.queryByText('Collapse test facets list')).not.toBeInTheDocument()
    })
  })

  describe('when there are five or fewer facets', () => {
    test('displays all facets without any expand/collapse buttons', () => {
      setup(5)
      expect(screen.queryByText('facet0 (10)')).toBeInTheDocument()
      expect(screen.queryByText('facet4 (10)')).toBeInTheDocument()
      expect(screen.queryByText('Show all test facets')).not.toBeInTheDocument()
      expect(screen.queryByText('Collapse test facets list')).not.toBeInTheDocument()
    })
  })
})
