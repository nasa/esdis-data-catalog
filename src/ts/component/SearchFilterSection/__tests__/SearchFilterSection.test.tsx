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
  const { container } = render(<SearchFilterSection {...defaultProps} />)

  return {
    container,
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
    const { container } = setup({})

    expect(container.querySelector('.hzn-offcanvas__section-select')).toBeInTheDocument()
    expect(container.querySelector('.hzn-icon-right')).toBeInTheDocument()
  })

  test('opens and closes the offcanvas on small screens', async () => {
    const { container, user } = setup({})

    // Open offcanvas
    await user.click(container.querySelector('.hzn-offcanvas__section-select')!)
    expect(container.querySelector('.offcanvas.show')).toBeInTheDocument()
    expect(screen.getByText('Test Child')).toBeInTheDocument()

    // Close offcanvas
    await user.click(container.querySelector('.hzn-offcanvas__header-button')!)
    expect(container.querySelector('.offcanvas.show')).not.toBeInTheDocument()
  })

  test('calls setSidebarOpened when close button is clicked on small screens', async () => {
    const { container, defaultProps, user } = setup({})
    await user.click(container.querySelector('.hzn-offcanvas__section-select')!)
    await user.click(container.querySelector('.btn-close')!)
    expect(defaultProps.setSidebarOpened).toHaveBeenCalledWith(false)
  })

  test('calls setSidebarOpened when Apply button is clicked on small screens', async () => {
    const { container, defaultProps, user } = setup({})

    // Open the offcanvas first
    await user.click(container.querySelector('.hzn-offcanvas__section-select')!)

    // Click the Apply button
    await user.click(container.querySelector('.hzn-offcanvas__apply')!)

    expect(defaultProps.setSidebarOpened).toHaveBeenCalledWith(false)
  })
})
