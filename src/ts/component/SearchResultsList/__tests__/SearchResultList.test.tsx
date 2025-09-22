import React from 'react'

import {
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import SearchResultsList from '../SearchResultsList'

const setup = (overrideProps = {}) => {
  const nextMock = vi.fn()
  const previousMock = vi.fn()

  const props = {
    collections: {
      count: 50348,
      items: [
        {
          meta: {
            'concept-id': 'C100-FAKE',
            'provider-id': 'MOCK PROVIDER'
          },
          umm: {
            EntryTitle: 'Fake Collection 0',
            Abstract: 'Fake Abstract 0'
          }
        },
        {
          meta: {
            'concept-id': 'C101-FAKE',
            'provider-id': 'MOCK PROVIDER'
          },
          umm: {
            EntryTitle: 'Fake Collection 1',
            Abstract: 'Fake Abstract 1'
          }
        }
      ]
    },
    currentPage: 1,
    currentPageSize: 10,
    currentSortKey: 'Relevance',
    setQueryPage: vi.fn(),
    setQueryPageSize: vi.fn(),
    setQuerySort: vi.fn(),
    setSidebarOpened: vi.fn(),
    filterCount: 0,
    ...overrideProps
  }

  const user = userEvent.setup()

  const { container } = render(
    <SearchResultsList {...props} />
  )

  return {
    container,
    nextMock,
    previousMock,
    props,
    user
  }
}

describe('SearchResultList', () => {
  test('renders the collections', () => {
    setup()

    expect(screen.getByText(/Showing 2 of 50,348 results/)).toBeInTheDocument()
  })

  test('renders no collections', () => {
    setup({
      collections: {
        count: 0,
        items: []
      }
    })

    expect(screen.getByText(/Showing 0 of 0 results/)).toBeInTheDocument()
  })

  test('renders no results when collections are undefined', () => {
    setup({
      collections: {
        count: 0,
        items: undefined
      }
    })

    expect(screen.getByText(/Showing 0 of 0 results/)).toBeInTheDocument()
  })

  describe('Pagination', () => {
    window.scrollTo = vi.fn()
    describe('when clicking on next page arrow', () => {
      test('should call setQueryPage with next page', async () => {
        const { props, user } = setup()
        const pagination = screen.getByRole('list', { name: /pagination/i })
        expect(pagination).toHaveClass('pagination')

        await user.click(screen.getByRole('button', { name: 'Next' }))

        expect(props.setQueryPage).toHaveBeenCalledTimes(1)
        expect(props.setQueryPage).toHaveBeenCalledWith(2)
      })

      test('renders disabled next arrow when on the last page', () => {
        setup({ currentPage: 5035 })

        const pagination = screen.getByRole('list', { name: /pagination/i })

        expect(within(pagination as HTMLElement).queryAllByRole('button')).toHaveLength(3)

        const paginationItems = within(pagination).getAllByRole('listitem')

        const nextItem = paginationItems.find((item) => item.classList.contains('pagination-next'))
        expect(nextItem).toHaveClass('disabled')
      })
    })

    describe('when clicking on a page', () => {
      test('calls setQueryPage with the page that was clicked', async () => {
        const { props, user } = setup()

        const pagination = screen.getByRole('list', { name: /pagination/i })

        expect(within(pagination as HTMLElement).queryAllByRole('button')).toHaveLength(6)

        await user.click(screen.getByRole('button', { name: '4' }))

        expect(props.setQueryPage).toHaveBeenCalledTimes(1)
        expect(props.setQueryPage).toHaveBeenCalledWith(4)
      })
    })

    describe('when clicking on a last page', () => {
      test('calls setQueryPage with the last page number', async () => {
        const { props, user } = setup()

        await user.click(screen.getByRole('button', { name: '5035' }))

        expect(props.setQueryPage).toHaveBeenCalledTimes(1)
        expect(props.setQueryPage).toHaveBeenCalledWith(5035)
      })
    })
  })

  describe('when clicking on previous page arrow', () => {
    test('calls setQueryPage with previous', async () => {
      const { props, user } = setup({ currentPage: 2 })

      const pagination = screen.getByRole('list', { name: /pagination/i })

      expect(within(pagination as HTMLElement).queryAllByRole('button')).toHaveLength(7)

      await user.click(screen.getByRole('button', { name: 'Previous' }))

      expect(props.setQueryPage).toHaveBeenCalledTimes(1)
      expect(props.setQueryPage).toHaveBeenCalledWith(1)
    })

    test('renders a disabled previous arrow when current page is 1', () => {
      setup()

      const pagination = screen.getByRole('list', { name: /pagination/i })

      expect(within(pagination as HTMLElement).queryAllByRole('button')).toHaveLength(6)

      const paginationItems = within(pagination).getAllByRole('listitem')

      const previousItem = paginationItems.find((item) => item.classList.contains('pagination-prev'))
      expect(previousItem).toHaveClass('disabled')
    })
  })

  describe('when item count is less than 10', () => {
    test('does not render the pagination component', () => {
      setup({
        collections: {
          count: 5,
          items: [
            {
              meta: {
                'concept-id': 'C100-FAKE'
              },
              umm: {
                EntryTitle: 'Fake Collection 0',
                Abstract: 'Fake Abstract 0'
              }
            },
            {
              meta: {
                'concept-id': 'C101-FAKE'
              },
              umm: {
                EntryTitle: 'Fake Collection 1',
                Abstract: 'Fake Abstract 1'
              }
            }
          ]
        }
      })

      const navigation = screen.queryByRole('navigation')
      expect(navigation).not.toBeInTheDocument()
    })
  })

  describe('Page size', () => {
    window.scrollTo = vi.fn()
    describe('when no page size is selected', () => {
      test('renders render the default page size of 10', () => {
        setup({
          collections: {
            count: 10,
            items: [
              {
                meta: {
                  'concept-id': 'C100-FAKE'
                },
                umm: {
                  EntryTitle: 'Fake Collection 0',
                  Abstract: 'Fake Abstract 0'
                }
              },
              {
                meta: {
                  'concept-id': 'C101-FAKE'
                },
                umm: {
                  EntryTitle: 'Fake Collection 1',
                  Abstract: 'Fake Abstract 1'
                }
              }
            ]
          }
        })

        expect(screen.getByText(/Showing 2 of 10 results/)).toBeInTheDocument()

        const button = screen.getByRole('button', { name: /ROWS/ })
        expect(within(button).getByText('ROWS')).toBeInTheDocument()
        expect(within(button).getByText('10')).toBeInTheDocument()
      })
    })

    describe('when selecting page size', () => {
      test('should call setQueryPageSize with page 20', async () => {
        const { props, user } = setup()

        await waitFor(async () => {
          await user.click(screen.getByRole('button', { name: /ROWS/ }))
          await user.click(screen.getByRole('button', { name: '20' }))
        })

        expect(props.setQueryPageSize).toHaveBeenCalledTimes(1)
        expect(props.setQueryPageSize).toHaveBeenCalledWith(20)
      })
    })
  })

  describe('Sort key', () => {
    describe('when selecting a sort key', () => {
      test('calls setQuerySort with -usage_score', async () => {
        const { props, user } = setup()

        await waitFor(async () => {
          await user.click(screen.getByRole('button', { name: /SORT:/ }))
          await user.click(screen.getByRole('button', { name: 'Usage' }))
        })

        expect(props.setQuerySort).toHaveBeenCalledTimes(1)
        expect(props.setQuerySort).toHaveBeenCalledWith('-usage_score')
      })

      test('calls setQuerySort with start_data', async () => {
        const { props, user } = setup()

        await waitFor(async () => {
          await user.click(screen.getByRole('button', { name: /SORT:/ }))
          await user.click(screen.getByRole('button', { name: 'Start Date' }))
        })

        expect(props.setQuerySort).toHaveBeenCalledTimes(1)
        expect(props.setQuerySort).toHaveBeenCalledWith('start_date')
      })

      test('calls setQuerySort with relevance', async () => {
        const { props, user } = setup()

        await waitFor(async () => {
          await user.click(screen.getByRole('button', { name: /SORT:/ }))
          await user.click(screen.getByRole('button', { name: 'Relevance' }))
        })

        expect(props.setQuerySort).toHaveBeenCalledTimes(1)
        expect(props.setQuerySort).toHaveBeenCalledWith('-score')
      })

      test('calls setQuerySort with -ongoing', async () => {
        const { props, user } = setup()

        await waitFor(async () => {
          await user.click(screen.getByRole('button', { name: /SORT:/ }))
          await user.click(screen.getByRole('button', { name: 'End Date' }))
        })

        expect(props.setQuerySort).toHaveBeenCalledTimes(1)
        expect(props.setQuerySort).toHaveBeenCalledWith('-ongoing')
      })
    })

    describe('when the sort key is usage_score', () => {
      test('displays usage as the current selected sort key', () => {
        setup({
          currentSortKey: '-usage_score'
        })

        const sortKeyDropdown = screen.getByRole('button', { name: /SORT: Usage/ })
        expect(sortKeyDropdown).toBeInTheDocument()
      })
    })
  })

  describe('Filter button', () => {
    test('calls setSidebarOpened when clicked', async () => {
      const { props, user } = setup()

      const filterButton = screen.getByRole('button', { name: /Filter/ })
      expect(filterButton).toBeInTheDocument()

      await user.click(filterButton)

      expect(props.setSidebarOpened).toHaveBeenCalledTimes(1)
      expect(props.setSidebarOpened).toHaveBeenCalledWith(true)
    })

    test('displays filter count when filters are applied', () => {
      setup({
        filterCount: 3
      })

      const filterButton = screen.getByRole('button', { name: /Filter \(3\)/ })
      expect(filterButton).toBeInTheDocument()
    })
  })
})
