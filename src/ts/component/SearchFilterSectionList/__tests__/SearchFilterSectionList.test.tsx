import React from 'react'

import { render, screen } from '@testing-library/react'
import { useMediaQuery } from 'react-responsive'

import userEvent from '@testing-library/user-event'
import SearchFilterSectionList from '../SearchFilterSectionList'

// Mock the useMediaQuery hook
vi.mock('react-responsive', () => ({
  useMediaQuery: vi.fn()
}))

const mockedUseMediaQuery = useMediaQuery as ReturnType<typeof vi.fn>

const setup = ({ overrideUseMedia }: { overrideUseMedia?: boolean } = {}) => {
  const defaultProps = {
    children: <div>Test Child</div>,
    defaultActiveKey: ['mock-key'],
    setSidebarOpened: vi.fn()
  }

  const user = userEvent.setup()

  mockedUseMediaQuery.mockReturnValue(overrideUseMedia || false)

  render(
    <SearchFilterSectionList {...defaultProps} />
  )

  return {
    defaultProps,
    user
  }
}

describe('SearchFilterSectionList', () => {
  test('renders correctly for large screens', () => {
    setup({ overrideUseMedia: true })

    const filtersForm = screen.getByRole('search')
    expect(filtersForm).toHaveClass('hzn-filters')

    const accordion = screen.getByLabelText('Filters accordion')
    expect(accordion).toHaveClass('hzn-filters__accordion', 'accordion')

    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  test('renders correctly for small screens', () => {
    setup({})

    const filtersForm = screen.getByRole('search')
    expect(filtersForm).toHaveClass('offcanvas-body', 'hzn-offcanvas__body', 'hzn-filters')
    expect(screen.getByText('Test Child')).toBeInTheDocument()

    const applyButton = screen.getByRole('button', { name: 'Apply' })
    expect(applyButton).toHaveClass('hzn-offcanvas__apply', 'btn', 'btn-primary')
  })

  test('calls setSidebarOpened when Apply button is clicked on small screens', async () => {
    const { user, defaultProps } = setup({})
    await user.click(screen.getByText('Apply'))
    expect(defaultProps.setSidebarOpened).toHaveBeenCalledWith(false)
  })
})
