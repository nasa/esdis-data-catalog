import userEvent from '@testing-library/user-event'

import { MemoryRouter as Router } from 'react-router-dom'

import { render, screen } from '@testing-library/react'

import FacetChecklistItem from '../FacetChecklistItem'

const setup = (props = {}) => {
  const defaultProps = {
    facet: {
      title: 'facet0',
      count: 10,
      applied: false,
      hasChildren: false,
      type: 'test_type'
    },
    param: 'test_vs',
    onChange: vi.fn(),
    hasChildren: false,

    ...props
  }

  const user = userEvent.setup()

  render(
    <Router>
      <FacetChecklistItem {...defaultProps} />
    </Router>
  )

  return {
    user,
    ...defaultProps
  }
}

describe('FacetChecklistItem', () => {
  describe('when facet title and count as present', () => {
    test('renders the facet title and count', () => {
      setup()
      expect(screen.getByText('facet0 (10)')).toBeInTheDocument()
    })
  })

  describe('when clicking on checkbox', () => {
    test('calls onChange when checkbox is clicked', async () => {
      const { user, onChange, facet } = setup()
      await user.click(screen.getByRole('checkbox'))
      expect(onChange).toHaveBeenCalledWith(facet, true)
    })
  })

  describe('when checkbox is clicked', () => {
    test('renders checkbox as checked when facet is applied', () => {
      setup({
        facet: {
          title: 'facet0',
          count: 10,
          applied: true
        }
      })

      expect(screen.getByRole('checkbox')).toBeChecked()
    })
  })
})