import nock from 'nock'
import userEvent from '@testing-library/user-event'
import {
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import { MemoryRouter as Router } from 'react-router-dom'
import { useMediaQuery } from 'react-responsive'
import { filter, omit } from 'lodash-es'
import React from 'react'
import {
  defaultFacetsPath,
  defaultFacetsUrl,
  defaultSearchPath,
  makeMockResponse
} from '../../../__mocks__/mocks'
import DataCatalog from '../DataCatalog'

vi.mock('react-responsive', () => ({
  useMediaQuery: vi.fn(() => true)
}))

const mockedUseMediaQuery = useMediaQuery as ReturnType<typeof vi.fn>

function joinUrl(url :string, params: string) {
  // Split the URL into the base part and the query string
  const [baseUrl, queryString] = url.split('?')

  const urlParams: Record<string, string> = {}
  if (queryString) {
    queryString.split('&').forEach((pair) => {
      const [key, value] = pair.split('=')
      urlParams[key] = value
    })
  }

  if (params) {
    params.split('&').forEach((pair) => {
      const [key, value] = pair.split('=')
      urlParams[key] = value
    })
  }

  const updatedQueryString = Object.entries(urlParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  // Return the updated URL
  return `${baseUrl}?${updatedQueryString}`
}

function setupMockResponse(params = '', collectionCount = 20, hits = 2000, prefix = '', appliedFacets = {}) {
  const { searchResponse, facetsResponse } = makeMockResponse(
    joinUrl(defaultFacetsUrl, params),
    collectionCount,
    prefix,
    appliedFacets
  )

  nock(/cmr/).get(joinUrl(defaultSearchPath, params))
    .reply(200, searchResponse, { 'Cmr-Hits': hits.toString() })

  nock(/cmr/).get(joinUrl(defaultFacetsPath, params))
    .reply(200, facetsResponse, { 'Cmr-Hits': hits.toString() })
}

async function setupSidebarTest() {
  const user = userEvent.setup()
  setupMockResponse()
  const { container } = render(
    <Router>
      <DataCatalog />
    </Router>
  )
  await waitFor(async () => user.click(screen.getByRole('button', { name: 'Filter' })))

  return {
    container,
    user
  }
}

const setup = ({ params }: { params?: string } = {}) => {
  setupMockResponse()

  const user = userEvent.setup()

  const initialPath = params ? `?${params}` : '/'

  const { container } = render(
    <Router initialEntries={[initialPath]}>
      <DataCatalog />
    </Router>
  )

  return {
    container,
    user
  }
}

describe('DataCatalog', () => {
  beforeEach(() => nock.cleanAll())

  test('request new collections upon form submission', async () => {
    const { user } = setup({})

    expect(screen.getByTestId('loading-banner__spinner')).toBeTruthy()

    await waitFor(async () => {
      await user.type(screen.getByRole('searchbox'), 'C002-FAKE')
    })

    setupMockResponse('keyword=C002-FAKE', 1, 1, 'Found ')

    // Click the submit button
    await waitFor(async () => {
      await user.click(screen.getByLabelText('Submit'))
    })

    await waitFor(() => expect(nock.isDone()).toBe(true))

    expect(await screen.findByText('Found collection 1')).toBeTruthy()
  })

  test('request new facet after checking a facet', async () => {
    const { user } = setup({})
    expect(screen.getByTestId('loading-banner__spinner')).toBeTruthy()

    setupMockResponse('science_keywords_h%5B0%5D%5Btopic%5D=Keyw1', 1, 1, 'Found ', { keywords: [1] })

    await waitFor(async () => {
      await user.click(screen.getByLabelText('Keyw1 (20)'))
    })

    expect(await screen.findByText('Found collection 1')).toBeTruthy()

    expect((screen.getByLabelText('Found Keyw0 (10)') as HTMLInputElement).checked).toBe(false)
    expect((screen.getByLabelText('Found Keyw1 (20)') as HTMLInputElement).checked).toBe(true)

    expect(await screen.findByRole('button', { name: 'Found Keyw1' })).toBeTruthy()
  })

  describe('Loading a URL with keywords in it', () => {
    test('returns filtered results and populates the keyword search field', async () => {
      const key = 'keyword'
      const value = 'C002-FAKE'
      const params = `${key}=${value}`
      setupMockResponse(params, 1, 1, 'Found ')

      setup({ params })

      // It finds the single result
      expect(await screen.findByText('Found collection 1')).toBeTruthy()
      expect(screen.queryByRole('button', { name: value })).toBeNull()

      // It populates the keyword search field
      expect(screen.getByRole('searchbox')).toHaveValue(value)
    })
  })

  describe('Loading a URL with spatial in it', () => {
    test('returns filtered results, populates the bounding box spatial field, and shows a remove button', async () => {
      const key = 'bounding_box'
      const value = '-45,-45,45,45'
      const params = `${key}=${value}`
      setupMockResponse(params, 1, 1, 'Found ')

      setup({ params })

      expect(screen.getByTestId('loading-banner__spinner')).toBeTruthy()

      expect(await screen.findByText('Found collection 1')).toBeTruthy()
      expect(await screen.findByRole('button', { name: value })).toBeTruthy()

      expect(screen.getByLabelText('Bounding Box')).toHaveValue(value)
    })
  })

  describe('Loading a URL with spatial in it', () => {
    test('returns filtered results, populates the bounding box spatial field, and shows a remove button', async () => {
      const key = 'bounding_box'
      const value = '-45,-45,45,45'
      const params = `${key}=${value}`
      setupMockResponse(params, 1, 1, 'Found ')

      setup({ params })

      expect(screen.getByTestId('loading-banner__spinner')).toBeTruthy()

      expect(await screen.findByText('Found collection 1')).toBeTruthy()
      expect(await screen.findByRole('button', { name: value })).toBeTruthy()

      expect(screen.getByLabelText('Bounding Box')).toHaveValue(value)
    })
  })

  describe('Loading a URL with temporal in it', () => {
    test('returns filtered results, populates the start and end date fields, and shows a remove button', async () => {
      const key = 'temporal'
      const startDate = '2023-01-01'
      const endDate = '2024-02-02'
      const params = `${key}=${startDate},${endDate}`
      setupMockResponse(params, 1, 1, 'Found ')

      setup({ params })

      expect(screen.getByTestId('loading-banner__spinner')).toBeTruthy()

      expect(await screen.findByText('Found collection 1')).toBeTruthy()
      expect(await screen.findByRole('button', { name: '2023-01-01 to 2024-02-02' })).toBeTruthy()

      expect(screen.getByLabelText('Start Date')).toHaveValue(startDate)
      expect(screen.getByLabelText('End Date')).toHaveValue(endDate)
    })
  })

  describe('When URL contains both CMR and UTM parameters', () => {
    test('it uses CMR parameters for search and keeps UTM parameters in the URL', async () => {
      const cmrParam = 'keyword=test'
      const utmParams = 'utm_source=event&utm_medium=print&utm_campaign=table-tent'
      const params = `${cmrParam}&${utmParams}`

      setupMockResponse(cmrParam, 1, 1, 'Found ')

      setup({ params })

      expect(screen.getByTestId('loading-banner__spinner')).toBeTruthy()

      // Check that the search was performed with the CMR parameter
      expect(await screen.findByText('Found collection 1')).toBeTruthy()
    })
  })

  describe('When facets are saved in the URL', () => {
    test('returns filtered results, checks the filtered facet, and shows a remove button', async () => {
      const key = 'science_keywords_h%5B0%5D%5Btopic%5D'
      const value = 'Found Keyw1'
      const params = `${key}=${value}`
      setupMockResponse(params, 1, 1, 'Found ', { keywords: [1] })

      setup({ params })

      expect(screen.getByTestId('loading-banner__spinner')).toBeTruthy()

      expect(await screen.findByText('Found collection 1')).toBeTruthy()

      expect((screen.getByLabelText('Found Keyw0 (10)') as HTMLInputElement).checked).toBe(false)
      expect((screen.getByLabelText('Found Keyw1 (20)') as HTMLInputElement).checked).toBe(true)

      expect(await screen.findByRole('button', { name: 'Found Keyw1' })).toBeTruthy()
    })
  })

  describe('When a CMR JSON error is thrown', () => {
    test('it renders an error banner', async () => {
      nock(/cmr/).get(defaultSearchPath).reply(500, { errors: ['Example error'] })
      nock(/cmr/).get(defaultFacetsPath).reply(500, { errors: ['Example error'] })

      setup({})

      expect(screen.getByTestId('loading-banner__spinner')).toBeTruthy()

      expect(await screen.findByRole('alert')).toHaveTextContent('Example error')
    })
  })

  describe('When a non-JSON error is thrown', () => {
    test('it renders an error banner', async () => {
      nock(/cmr/).get(defaultSearchPath).reply(500, 'Failed')
      nock(/cmr/).get(defaultFacetsPath).reply(500, 'Failed')

      setup({})

      expect(screen.getByTestId('loading-banner__spinner')).toBeTruthy()

      expect(await screen.findByRole('alert')).toHaveTextContent('Sorry!Internal Server Error')
    })
  })

  // The applied filters buttons under the search field interact with everything else
  // on the page in complicated ways. Adding extra page-level tests to ensure it works
  describe('When filters have been applied', () => {
    // Factored out boilerplate for setting up filter tests that click a filter
    const doClickFilterTest = async (filterName: string, removedParamName: string) => {
      const filterParams = [
        'science_keywords_h[1][topic]=Found Keyw1',
        'platforms_h[1][basis]=Found Plat1',
        'bounding_box=-45,-45,45,45',
        'temporal=2023-01-01,2024-02-02'
      ]
      const appliedFacets = {
        keywords: [1],
        platforms: [1]
      }

      setupMockResponse(filterParams.join('&'), 1, 1, 'Found ', appliedFacets)

      const user = userEvent.setup()
      render(
        <Router initialEntries={[`?${filterParams.join('&')}`]}>
          <DataCatalog />
        </Router>
      )

      expect(screen.getByTestId('loading-banner__spinner')).toBeTruthy()

      if (filterName) {
        const newParams = filter(filterParams, (p) => p.indexOf(removedParamName) === -1).join('&')
        const newFacets = omit(appliedFacets, removedParamName)
        setupMockResponse(newParams, 1, 1, 'Found ', newFacets)

        await waitFor(async () => {
          await user.click(screen.getByRole('button', { name: filterName }))
        })

        // Screen needs to settle down
        await waitFor(async () => {
          expect(screen.queryByRole('button', { name: filterName })).toBeNull()
        })
      }
    }

    test('clicking to remove a temporal filter removes the temporal filter', async () => {
      await doClickFilterTest('2023-01-01 to 2024-02-02', 'temporal')
      expect(screen.getByLabelText('Bounding Box')).toHaveValue('-45,-45,45,45')
      expect(screen.getByLabelText('Start Date')).toHaveValue('')
      expect(screen.getByLabelText('End Date')).toHaveValue('')

      expect((screen.getByLabelText('Found Keyw1 (20)') as HTMLInputElement).checked).toBe(true)
      expect((screen.getByLabelText('Found Plat1 (20)') as HTMLInputElement).checked).toBe(true)
    })

    test('clicking to remove a spatial filter removes the spatial filter', async () => {
      await doClickFilterTest('-45,-45,45,45', 'bounding_box')
      expect(screen.getByLabelText('Bounding Box')).toHaveValue('')
      expect(screen.getByLabelText('Start Date')).toHaveValue('2023-01-01')
      expect(screen.getByLabelText('End Date')).toHaveValue('2024-02-02')

      expect((screen.getByLabelText('Found Keyw1 (20)') as HTMLInputElement).checked).toBe(true)
      expect((screen.getByLabelText('Found Plat1 (20)') as HTMLInputElement).checked).toBe(true)
    })

    test('clicking "Clear all" clears all the filters and hides the filter list', async () => {
      const params = 'bounding_box=-45,-45,45,45'
      setupMockResponse(params, 1, 1, 'Found ', {})
      const user = userEvent.setup()
      render(
        <Router initialEntries={[`?${params}`]}>
          <DataCatalog />
        </Router>
      )

      expect(screen.getByTestId('loading-banner__spinner')).toBeTruthy()

      await waitFor(async () => {
        expect(screen.queryByTestId('loading-banner__spinner')).toBeNull()
      })

      setupMockResponse('', 1, 1, 'Found ', {})
      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Clear all' }))
      })

      await waitFor(async () => {
        expect(screen.queryByRole('button', { name: 'Clear all' })).toBeNull()
      })

      expect(await screen.findByLabelText('Bounding Box')).toHaveValue('')
    })

    test('removing the final filter hides the filter list', async () => {
      const params = 'bounding_box=-45,-45,45,45'
      setupMockResponse(params, 1, 1, 'Found ', {})

      const user = userEvent.setup()
      render(
        <Router initialEntries={[`?${params}`]}>
          <DataCatalog />
        </Router>
      )

      expect(screen.getByTestId('loading-banner__spinner')).toBeTruthy()

      expect(await screen.findByRole('button', { name: 'Clear all' })).toBeTruthy()

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: '-45,-45,45,45' }))
      })

      await waitFor(async () => {
        expect(screen.queryByRole('button', { name: 'Clear all' })).toBeNull()
      })
    })
  })

  describe('when navigating to the next page', () => {
    window.scrollTo = vi.fn()

    test('should click the next button and page 2 should be active ', async () => {
      setupMockResponse()

      const user = userEvent.setup()
      setup({})

      expect(screen.getByTestId('loading-banner__spinner')).toBeTruthy()

      await waitFor(async () => {
        await user.type(screen.getByRole('searchbox'), 'C002-FAKE')
      })

      setupMockResponse('keyword=C002-FAKE', 1, 1, 'Found ')

      // Click the Next button
      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Next' }))
      })

      const activePageItem = screen.getByText('2').closest('li')

      expect(activePageItem).toHaveClass('page-item active')
    })
  })

  describe('when selecting number of row 10', () => {
    test('filters the results list and displays "10" as the selected number of collections', async () => {
      const params = 'page_size=20'
      const user = userEvent.setup()

      setupMockResponse(params, 1, 1, 'Found ')

      setup({})
      expect(await screen.findByText('Found collection 1')).toBeTruthy()
      const rowButton = screen.getByRole('button', { name: /ROWS/ })
      await waitFor(async () => {
        await user.click(rowButton)
        await user.click(screen.getByRole('button', { name: '10' }))
      })

      setupMockResponse('page_num=1&page_size=10')

      const rowElement = screen.getByRole('button', { name: /ROWS/ })
      expect(within(rowElement).getByText('ROWS')).toBeInTheDocument()
      expect(within(rowElement).getByText('10')).toBeInTheDocument()
    })
  })

  describe('when selecting a sort key', () => {
    test('clicking on usage as a sort key ', async () => {
      const params = 'page_size=20'
      const user = userEvent.setup()

      setupMockResponse(params, 1, 1, 'Found ')

      setup({ params })

      expect(await screen.findByText('Found collection 1')).toBeTruthy()

      setupMockResponse('page_num=1&sort_key=usage_score')

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: /SORT:/ }))
        await user.click(screen.getByRole('button', { name: 'Usage' }))
      })

      const rowElement = screen.getByRole('button', { name: /SORT: / })

      expect(within(rowElement).getByText('usage')).toBeInTheDocument()
    })
  })

  describe('when loading a URL containing a sort_key', () => {
    test('loads the page, using and displaying the appropriate sort key', async () => {
      const params = 'sort_key=usage_score'
      const user = userEvent.setup()

      setupMockResponse(params, 1, 1, 'Found ')

      setup({ params })

      expect(await screen.findByText('Found collection 1')).toBeTruthy()

      const rowElement = screen.getByRole('button', { name: /SORT: / })

      expect(within(rowElement).getByText('usage')).toBeInTheDocument()

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: /SORT:/ }))
        await user.click(screen.getByRole('button', { name: 'Relevance' }))
      })

      // Calls CMR with a default search params because relevance is a default search
      setupMockResponse()
      expect(screen.getByText(/Relevance/)).toBeInTheDocument()
    })
  })

  describe('responsive filters sidebar', () => {
    // Set react-responsive to report a narrow screen
    beforeEach(() => mockedUseMediaQuery.mockReturnValue(false))

    test('clicking the "Filter" button opens the filters sidebar', async () => {
      setupMockResponse()
      const user = userEvent.setup()
      setup({})

      // RTL is not super happy with media queries / CSS, so we use class names as a proxy
      expect((await screen.findByTestId('search-filters')).classList.contains('show')).toBe(false)
      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Filter' }))
      })

      expect((await screen.findByTestId('search-filters')).classList.contains('show')).toBe(true)
    })

    test('clicking the close button on the sidebar closes the sidebar', async () => {
      mockedUseMediaQuery.mockReturnValue(false)

      setupMockResponse()
      const user = userEvent.setup()
      const { container } = setup({})

      // RTL is not super happy with media queries / CSS, so we use class names as a proxy
      expect((await screen.findByTestId('search-filters')).classList.contains('show')).toBe(false)
      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Filter' }))
      })

      expect((await screen.findByTestId('search-filters')).classList.contains('show')).toBe(true)

      const filterHeader = container.querySelector('#search-filters > .offcanvas-header')
      await waitFor(async () => {
        await user.click(within(filterHeader as HTMLElement).getByLabelText('Close'))
      })

      expect((await screen.findByTestId('search-filters')).classList.contains('show')).toBe(false)
    })
  })

  test('clicking the "Apply" button on the sidebar closes the sidebar', async () => {
    mockedUseMediaQuery.mockReturnValue(false)

    setupMockResponse()
    const user = userEvent.setup()
    const { container } = setup({})

    // RTL is not super happy with media queries / CSS, so we use class names as a proxy
    expect((await screen.findByTestId('search-filters')).classList.contains('show')).toBe(false)
    await waitFor(async () => {
      await user.click(screen.getByRole('button', { name: 'Filter' }))
    })

    expect((await screen.findByTestId('search-filters')).classList.contains('show')).toBe(true)

    const filterHeader = container.querySelector('#search-filters')
    await waitFor(() => user.click(within(filterHeader as HTMLElement).getByRole('button', { name: 'Apply' })))

    expect((await screen.findByTestId('search-filters')).classList.contains('show')).toBe(false)
  })

  test('the filter count displays the number of filters in parens when there are filters', async () => {
    const filterParams = [
      'science_keywords_h[1][topic]=Found Keyw1',
      'platforms_h[1][basis]=Found Plat1',
      'bounding_box=-45,-45,45,45',
      'temporal=2023-01-01,2024-02-02'
    ]
    const appliedFacets = {
      keywords: [1],
      platforms: [1]
    }

    setupMockResponse(filterParams.join('&'), 1, 1, 'Found ', appliedFacets)

    setup({ params: filterParams.join('&') })

    expect(await screen.findByText('Filter (4)')).toBeInTheDocument()
  })

  describe('when clicking a filter group', () => {
    test('displays the filters in the selected group as a popover', async () => {
      const { user } = await setupSidebarTest()

      // Note: use *ByRole here because this is in the document but hidden
      expect(screen.queryByRole('checkbox', { name: 'Keyw0 (10)' })).toBeNull()

      await waitFor(() => user.click(screen.getByRole('button', { name: 'Topics' })))

      expect(await screen.findByRole('checkbox', { name: 'Keyw0 (10)' })).toBeInTheDocument()
    })

    test('does not display a show/hide button for expanding facet lists', async () => {
      const { user } = await setupSidebarTest()
      await waitFor(() => user.click(screen.getByRole('button', { name: 'Topics' })))
      expect(screen.queryByText('Show all topics')).toBeNull()
    })

    test('displays a close button that closes all sidebars', async () => {
      const { container, user } = await setupSidebarTest()
      await waitFor(() => user.click(screen.getByRole('button', { name: 'Topics' })))

      expect((await screen.findByTestId('search-filters')).classList.contains('show')).toBe(true)

      const sectionHeader = container.querySelector('.hzn-offcanvas__section-header')
      expect(within(sectionHeader as HTMLElement).getByLabelText('Close')).toBeInTheDocument()
      await waitFor(() => user.click(within(sectionHeader as HTMLElement).getByLabelText('Close')))

      expect((await screen.findByTestId('search-filters')).classList.contains('show')).toBe(false)
    })

    test('displays an "Apply" button that closes all sidebars', async () => {
      const { container, user } = await setupSidebarTest()
      await waitFor(() => user.click(screen.getByRole('button', { name: 'Topics' })))

      expect((await screen.findByTestId('search-filters')).classList.contains('show')).toBe(true)

      await waitFor(async () => {
        const sectionHeader = container.querySelector('.hzn-filters .show')
        await user.click(within(sectionHeader as HTMLElement).getByRole('button', { name: 'Apply' }))
      })

      expect((await screen.findByTestId('search-filters')).classList.contains('show')).toBe(false)
    })

    test('displays the title of the filter group as a clickable back button', async () => {
      const { user } = await setupSidebarTest()
      await waitFor(() => user.click(screen.getByRole('button', { name: 'Topics' })))

      expect(await screen.findByRole('checkbox', { name: 'Keyw0 (10)' })).toBeInTheDocument()
    })

    test('changing a filter in the group automatically applies the filter', async () => {
      const { user } = await setupSidebarTest()
      await waitFor(() => user.click(screen.getByRole('button', { name: 'Topics' })))
      setupMockResponse('science_keywords_h%5B0%5D%5Btopic%5D=Keyw1', 1, 1, 'Found ', { keywords: [1] })

      await waitFor(async () => {
        await user.click(screen.getByLabelText('Keyw1 (20)'))
      })

      expect(await screen.findByText('Found collection 1')).toBeTruthy()
      expect((screen.getByLabelText('Found Keyw0 (10)') as HTMLInputElement).checked).toBe(false)
      expect((screen.getByLabelText('Found Keyw1 (20)') as HTMLInputElement).checked).toBe(true)
    })
  })
})
