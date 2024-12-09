import React from 'react'
import {
  render,
  screen,
  fireEvent
} from '@testing-library/react'
import { useMediaQuery } from 'react-responsive'
import SearchFilterSection, { SearchFilterSectionList } from '../SearchFilterSection'

// Mock the useMediaQuery hook
vi.mock('react-responsive', () => ({
  useMediaQuery: vi.fn()
}))

describe('SearchFilterSectionList', () => {
  const defaultProps = {
    defaultActiveKey: ['key1'],
    setSidebarOpened: vi.fn(),
    children: <div>Test Child</div>
  }

  test('renders correctly for large screens', () => {
    useMediaQuery.mockReturnValue(true)
    const { container } = render(<SearchFilterSectionList {...defaultProps} />)
    expect(container.querySelector('.hzn-filters')).toBeInTheDocument()
    expect(container.querySelector('.hzn-filters__accordion')).toBeInTheDocument()
    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  test('renders correctly for small screens', () => {
    useMediaQuery.mockReturnValue(false)
    const { container } = render(<SearchFilterSectionList {...defaultProps} />)
    expect(container.querySelector('.hzn-offcanvas__body')).toBeInTheDocument()
    expect(container.querySelector('.hzn-offcanvas__apply')).toBeInTheDocument()
    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  test('calls setSidebarOpened when Apply button is clicked on small screens', () => {
    useMediaQuery.mockReturnValue(false)
    render(<SearchFilterSectionList {...defaultProps} />)
    fireEvent.click(screen.getByText('Apply'))
    expect(defaultProps.setSidebarOpened).toHaveBeenCalledWith(false)
  })
})

describe('SearchFilterSection', () => {
  const defaultProps = {
    title: 'Test Section',
    eventKey: 'testKey',
    setSidebarOpened: vi.fn(),
    children: <div>Test Child</div>
  }

  test('renders correctly for large screens', () => {
    useMediaQuery.mockReturnValue(true)
    render(<SearchFilterSection {...defaultProps} />)
    expect(screen.getByText('Test Section')).toBeInTheDocument()
    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  test('renders correctly for small screens', () => {
    useMediaQuery.mockReturnValue(false)
    const { container } = render(<SearchFilterSection {...defaultProps} />)
    expect(container.querySelector('.hzn-offcanvas__section-select')).toBeInTheDocument()
    expect(container.querySelector('.hzn-icon-right')).toBeInTheDocument()
  })

  test('opens and closes the offcanvas on small screens', () => {
    useMediaQuery.mockReturnValue(false)
    const { container } = render(<SearchFilterSection {...defaultProps} />)

    // Open offcanvas
    fireEvent.click(container.querySelector('.hzn-offcanvas__section-select'))
    expect(container.querySelector('.offcanvas.show')).toBeInTheDocument()
    expect(screen.getByText('Test Child')).toBeInTheDocument()

    // Close offcanvas
    fireEvent.click(container.querySelector('.hzn-offcanvas__header-button'))
    expect(container.querySelector('.offcanvas.show')).not.toBeInTheDocument()
  })

  test('calls setSidebarOpened when close button is clicked on small screens', () => {
    useMediaQuery.mockReturnValue(false)
    const { container } = render(<SearchFilterSection {...defaultProps} />)
    fireEvent.click(container.querySelector('.hzn-offcanvas__section-select'))
    fireEvent.click(container.querySelector('.btn-close'))
    expect(defaultProps.setSidebarOpened).toHaveBeenCalledWith(false)
  })

  test('calls setSidebarOpened when Apply button is clicked on small screens', () => {
    useMediaQuery.mockReturnValue(false)
    const { container } = render(<SearchFilterSection {...defaultProps} />)

    // Open the offcanvas first
    fireEvent.click(container.querySelector('.hzn-offcanvas__section-select'))

    // Click the Apply button
    fireEvent.click(container.querySelector('.hzn-offcanvas__apply'))

    expect(defaultProps.setSidebarOpened).toHaveBeenCalledWith(false)
  })
})
