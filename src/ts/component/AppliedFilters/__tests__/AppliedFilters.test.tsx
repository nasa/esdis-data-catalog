import { render, screen } from '@testing-library/react'
import { useFormikContext } from 'formik'

import userEvent from '@testing-library/user-event'
import AppliedFilters from '../AppliedFilters'
import getAppliedFacets from '../../../utils/getAppliedFacets'

// Mock the dependencies
vi.mock('formik', () => ({
  useFormikContext: vi.fn()
}))

vi.mock('../../../utils/getAppliedFacets')

// Create typed versions of the mocked functions
const mockedUseFormikContext = useFormikContext as ReturnType<typeof vi.fn>

const setup = ({ overrideProps = {} }) => {
  vi.mocked(getAppliedFacets).mockReturnValue([
    {
      title: 'Facet 1',
      links: { remove: 'remove-url-1' },
      applied: false,
      count: 0,
      hasChildren: false,
      type: ''
    },
    {
      title: 'Facet 2',
      links: { remove: 'remove-url-2' },
      applied: false,
      count: 0,
      hasChildren: false,
      type: ''
    }
  ])

  const props = {
    facets: {
      applied: false,
      count: 0,
      hasChildren: false,
      type: 'group',
      title: 'Root Facet'
    },
    filterValues: {},
    isLoading: false,
    setQueryString: vi.fn(),
    ...overrideProps
  }

  const mockFormik = {
    setFieldValue: vi.fn(),
    setValues: vi.fn(),
    dirty: false
  }

  mockedUseFormikContext.mockReturnValue(mockFormik)

  const user = userEvent.setup()

  const { container } = render(
    <AppliedFilters {...props} />
  )

  return {
    container,
    mockFormik,
    props,
    user
  }
}

describe('AppliedFilters', () => {
  describe('when showing applied facets', () => {
    test('renders facets', () => {
      setup({})

      expect(screen.getByText('Facet 1')).toBeInTheDocument()
      expect(screen.getByText('Facet 2')).toBeInTheDocument()
    })
  })

  describe('when temporal filter select', () => {
    test('renders the temporal range', () => {
      setup({
        overrideProps: {
          filterValues: {
            temporal: ['2020-01-01', '2021-01-01']
          }
        }
      })

      expect(screen.getByText('2020-01-01 to 2021-01-01')).toBeInTheDocument()
    })
  })

  describe('when bounding box is select', () => {
    test('render the bounding box value', () => {
      setup({
        overrideProps: {
          filterValues: {
            bounding_box: '-180,-90,180,90'
          }
        }
      })

      expect(screen.queryAllByText('-180,-90,180,90')[0]).toBeInTheDocument()
    })
  })

  describe('when removing bounding box filter', () => {
    test('calls setFieldValue to remove bounding_box and reset page_num', async () => {
      const { mockFormik, user } = setup({
        overrideProps: {
          filterValues: {
            bounding_box: '-180,-90,180,90',
            temporal: null
          }
        }
      })

      await user.click(screen.getByText('-180,-90,180,90'))

      expect(mockFormik.setFieldValue).toHaveBeenCalledWith('bounding_box', null)
      expect(mockFormik.setFieldValue).toHaveBeenCalledWith('page_num', null)
    })
  })

  describe('when removing temporal filter', () => {
    test('calls setFieldValue to remove temporal and reset page_num', async () => {
      const { mockFormik, user } = setup({
        overrideProps: {
          filterValues: {
            temporal: ['2020-01-01', '2021-01-01']
          }
        }
      })

      await user.click(screen.getByText('2020-01-01 to 2021-01-01'))

      expect(mockFormik.setFieldValue).toHaveBeenCalledWith('temporal', null)
      expect(mockFormik.setFieldValue).toHaveBeenCalledWith('page_num', null)
    })
  })

  describe('when clearing all filters', () => {
    test('calls setValues to clear all filters', async () => {
      const { mockFormik, user } = setup({
        overrideProps: {
          filterValues: {
            temporal: ['2020-01-01', '2021-01-01'],
            bounding_box: '-180,-90,180,90',
            science_keywords_h: ['Earth Science'],
            platforms_h: ['Platform1'],
            horizontal_data_resolution_range: ['1 km - < 10 km'],
            granule_data_format_h: ['NetCDF-4'],
            processing_level_id_h: ['Level 1B']
          }
        }
      })

      await user.click(screen.getByText('Clear all'))

      expect(mockFormik.setValues).toHaveBeenCalledTimes(1)
    })
  })

  describe('when temporal filter has only start date', () => {
    test('renders the correct temporal text', () => {
      setup({
        overrideProps: {
          filterValues: {
            temporal: ['2020-01-01', null]
          }
        }
      })

      expect(screen.getByText('2020-01-01 ongoing')).toBeInTheDocument()
    })
  })

  describe('when temporal filter has only end date', () => {
    test('renders the correct temporal text', () => {
      setup({
        overrideProps: {
          filterValues: {
            temporal: [null, '2021-01-01']
          }
        }
      })

      expect(screen.getByText('Up to 2021-01-01')).toBeInTheDocument()
    })
  })

  describe('when temporal filter has same start and end date', () => {
    test('renders the single date', () => {
      setup({
        overrideProps: {
          filterValues: {
            temporal: ['2020-01-01', '2020-01-01']
          }
        }
      })

      expect(screen.getByText('2020-01-01')).toBeInTheDocument()
    })
  })

  describe('when removing a filter', () => {
    test('should remove the selected filter', async () => {
      const { user, props } = setup({})

      await user.click(screen.getByText('Facet 1'))

      expect(props.setQueryString).toHaveBeenCalledTimes(1)
    })
  })

  describe('when clicking on Clear all', () => {
    test('clears all selected filter', async () => {
      const { mockFormik, user } = setup({})

      await user.click(screen.getByText('Clear all'))

      expect(mockFormik.setValues).toHaveBeenCalledTimes(1)
    })
  })
})
