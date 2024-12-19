import React from 'react'

import { render, screen } from '@testing-library/react'

import { useMediaQuery } from 'react-responsive'

import userEvent from '@testing-library/user-event'
import SearchFilterSection from '../SearchFilterSection'

// Mock the useMediaQuery hook
vi.mock('react-responsive', () => ({
  useMediaQuery: vi.fn()
}))

const mockedUseMediaQuery = useMediaQuery as ReturnType<typeof vi.fn>

const setup = ({ overrideUseMedia }: { overrideUseMedia?: boolean } = {}) => {
  const defaultProps = {
    title: 'Test Section',
    eventKey: 'testKey',
    setSidebarOpened: vi.fn(),
    children: <div>Test Child</div>
  }

  const user = userEvent.setup()

  mockedUseMediaQuery.mockReturnValue(overrideUseMedia || false)
  render(<SearchFilterSection {...defaultProps} />)

  return {
    defaultProps,
    user
  }
}

describe('SearchFilterSection', () => {
  test('renders correctly for large screens', () => {
    setup({ overrideUseMedia: true })
    expect(screen.getByText('Test Section')).toBeInTheDocument()
    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  test('renders correctly for small screens', () => {
    setup({})

    expect(screen.getByRole('button', { name: /Test Section/ })).toBeInTheDocument()
    expect(screen.getByTitle('Go')).toBeInTheDocument()
  })

  test('opens and closes the offcanvas on small screens', async () => {
    const { user } = setup({})

    // Open offcanvas
    await user.click(screen.getByRole('button', { name: /Test Section/ }))

    expect(screen.getByText('Test Child')).toBeInTheDocument()

    // Close offcanvas
    const backButton = screen.getByRole('button', { name: 'Back' })
    await user.click(backButton)
    expect(screen.queryByRole('complementary', { name: /offcanvas/i })).not.toBeInTheDocument()
  })

  test('calls setSidebarOpened when close button is clicked on small screens', async () => {
    const { defaultProps, user } = setup({})

    await user.click(screen.getByRole('button', { name: /Test Section/ }))

    const closeButton = screen.getByRole('button', { name: 'Close' })

    await user.click(closeButton)
    expect(defaultProps.setSidebarOpened).toHaveBeenCalledWith(false)
  })

  test('calls setSidebarOpened when Apply button is clicked on small screens', async () => {
    const { defaultProps, user } = setup({})

    // Open the offcanvas first
    await user.click(screen.getByRole('button', { name: /Test Section/ }))

    // Click the Apply button
    const applyButton = screen.getByRole('button', { name: 'Apply' })
    await user.click(applyButton)

    expect(defaultProps.setSidebarOpened).toHaveBeenCalledWith(false)
  })
})
