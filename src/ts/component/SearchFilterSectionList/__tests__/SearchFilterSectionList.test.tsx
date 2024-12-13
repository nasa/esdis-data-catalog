import {
  render,
  screen
} from '@testing-library/react'
import { useMediaQuery } from 'react-responsive'

import SearchFilterSectionList from '../SearchFilterSectionList'
import userEvent from '@testing-library/user-event'

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

  const { container } = render(<SearchFilterSectionList {...defaultProps} />)

  return{
    container,
    defaultProps,
    screen,
    user
  }
}

describe('SearchFilterSectionList', () => {
  test('renders correctly for large screens', () => {

    const { container, screen } = setup({overrideUseMedia: true})
    expect(container.querySelector('.hzn-filters')).toBeInTheDocument()
    expect(container.querySelector('.hzn-filters__accordion')).toBeInTheDocument()
    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  test('renders correctly for small screens', () => {
    const { container } = setup({})  
    expect(container.querySelector('.hzn-offcanvas__body')).toBeInTheDocument()
    expect(container.querySelector('.hzn-offcanvas__apply')).toBeInTheDocument()
    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  test('calls setSidebarOpened when Apply button is clicked on small screens', async () => {
    const { user, defaultProps } = setup({})
    await user.click(screen.getByText('Apply'))
    expect(defaultProps.setSidebarOpened).toHaveBeenCalledWith(false)
  })
})