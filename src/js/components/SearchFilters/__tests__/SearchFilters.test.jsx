import React from 'react'

import { MemoryRouter as Router } from 'react-router-dom'
import {
  render,
  screen,
  waitFor
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { makeMockResponse } from './__mocks__/SearchFiltersMock'

import { SearchFilters } from '../SearchFilters'

vi.mock('react-responsive', () => ({
  useMediaQuery: vi.fn(() => true)
}))

const setup = (overrideProps = {}) => {
  const handleBlur = vi.fn()
  const handleChange = vi.fn()
  const setQueryString = vi.fn()
  const setSidebarOpened = vi.fn()

  const props = {
    facets: makeMockResponse('https://example.com', 0, '', {}).facetsResponse.feed.facets,
    filterValues: {},
    handleBlur,
    handleChange,
    setQueryString,
    setSidebarOpened,
    ...overrideProps
  }
  const { container } = render(
    <Router>
      <SearchFilters {...props} />
    </Router>
  )

  return {
    container,
    handleBlur,
    handleChange,
    setQueryString,
    setSidebarOpened
  }
}

describe('DataCatalog SearchFilters component and facets', () => {
  test('renders the filters list with all facets and fields', () => {
    setup()

    expect(screen.getByText('Topics')).toBeInTheDocument()
    expect(screen.getByLabelText('Keyw0 (10)')).toBeInTheDocument()

    expect(screen.getByText('Observation Method')).toBeInTheDocument()
    expect(screen.getByLabelText('Plat0 (10)')).toBeInTheDocument()

    expect(screen.getByText('Temporal')).toBeInTheDocument()

    expect(screen.getByText('Coverage Date Range')).toBeInTheDocument()
    expect(screen.getByLabelText('Start Date')).toBeInTheDocument()
    expect(screen.getByLabelText('End Date')).toBeInTheDocument()

    expect(screen.getByText('Spatial')).toBeInTheDocument()
    expect(screen.getByText('Coverage')).toBeInTheDocument()
    expect(screen.getByLabelText('Bounding Box')).toBeInTheDocument()
    expect(screen.getByText('Resolution')).toBeInTheDocument()
    expect(screen.getByLabelText('Hori0 (10)')).toBeInTheDocument()

    expect(screen.getByText('Data Format')).toBeInTheDocument()
    expect(screen.getByLabelText('Data0 (10)')).toBeInTheDocument()

    expect(screen.getByText('Data Processing Level')).toBeInTheDocument()
    expect(screen.getByLabelText('Proc0 (10)')).toBeInTheDocument()
  })

  test('populates filters with applied values', () => {
    setup({
      filterValues: {
        temporal: ['2023-01-01', '2024-02-02'],
        bounding_box: '0,0,10,10'
      }
    })

    expect(screen.getByLabelText('Bounding Box').value).toEqual('0,0,10,10')
    expect(screen.getByLabelText('Start Date').value).toEqual('2023-01-01')
    expect(screen.getByLabelText('End Date').value).toEqual('2024-02-02')
  })

  test('checks boxes of applied facets', () => {
    setup({
      facets: makeMockResponse('https://example.com', 0, '', { keywords: [0] }).facetsResponse.feed.facets
    })

    expect(screen.getByLabelText('Keyw0 (10)').checked).toEqual(true)
    expect(screen.getByLabelText('Keyw1 (20)').checked).toEqual(false)
  })

  test('calls handleChange on change', async () => {
    const user = userEvent.setup()
    const { handleChange } = setup()

    await waitFor(() => user.type(screen.getByLabelText('Bounding Box'), '0,1,2,3'))

    expect(handleChange.mock.calls).toHaveLength('0,1,2,3'.length)
  })

  test('calls handleBlur on blur', async () => {
    const user = userEvent.setup()
    const { handleBlur } = setup()

    await waitFor(() => user.type(screen.getByLabelText('Bounding Box'), '0,1,2,3'))
    await waitFor(() => user.click(screen.getByLabelText('Keyw0 (10)')))

    expect(handleBlur.mock.calls).toHaveLength(1)
  })

  test('calls setQueryString when a facet alters the query string', async () => {
    const user = userEvent.setup()
    const { setQueryString } = setup({
      facets: makeMockResponse('https://example.com?default=true', 0, '', { keywords: [0] }).facetsResponse.feed.facets
    })

    await waitFor(() => user.click(screen.getByLabelText('Keyw0 (10)')))
    await waitFor(() => user.click(screen.getByLabelText('Keyw1 (20)')))

    expect(setQueryString.mock.calls).toHaveLength(2)
    expect(setQueryString.mock.calls[0][0]).toEqual('default=true&science_keywords_h%5B1%5D%5Btopic%5D=Keyw0')
    expect(setQueryString.mock.calls[1][0]).toEqual('default=true&science_keywords_h%5B1%5D%5Btopic%5D=Keyw1')
  })

  describe('when number of facets are empty', () => {
    test('renders the component without facet sections', () => {
      setup({
        facets: {}
      })

      // Check that the main filter sections are not rendered
      expect(screen.queryByText('Topics')).not.toBeInTheDocument()
      expect(screen.queryByText('Observation Method')).not.toBeInTheDocument()
      expect(screen.queryByText('Data Format')).not.toBeInTheDocument()
      expect(screen.queryByText('Data Processing Level')).not.toBeInTheDocument()

      // Check that the Temporal and Spatial sections are still rendered
      // as they don't depend on facets
      expect(screen.getByText('Temporal')).toBeInTheDocument()
      expect(screen.getByText('Spatial')).toBeInTheDocument()

      // Check that the date inputs and bounding box input are still present
      expect(screen.getByLabelText('Start Date')).toBeInTheDocument()
      expect(screen.getByLabelText('End Date')).toBeInTheDocument()
      expect(screen.getByLabelText('Bounding Box')).toBeInTheDocument()

      // Verify that no checkboxes are rendered
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    })
  })
})
