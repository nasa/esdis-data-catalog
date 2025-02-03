import '../../css/horizon/index.scss'

import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import {
  debounce,
  identity,
  pickBy,
  toNumber
} from 'lodash-es'
import {
  Formik,
  FormikHelpers,
  useFormikContext
} from 'formik'
import {
  Button,
  Col,
  Container,
  Form,
  Row
} from 'react-bootstrap'

import { parseCollectionsQuery } from '../../utils/parseCollectionsQuery'
import { getConfig } from '../../utils/getConfig'
import getAppliedFacets from '../../utils/getAppliedFacets'
import { queryFacetedCollections } from '../../utils/queryFacetedCollections'
import { stringifyCollectionsQuery } from '../../utils/stringifyCollectionsQuery'
import { getValidSortkey } from '../../utils/getValidSortkey'

import LoadingBanner from '../../component/LoadingBanner/LoadingBanner'
import ErrorBanner from '../../component/ErrorBanner/ErrorBanner'
import AppliedFilters from '../../component/AppliedFilters/AppliedFilters'
import SearchFilters from '../../component/SearchFilters/SearchFilters'
import SearchResultsList from '../../component/SearchResultsList/SearchResultsList'

import { defaultSortKey } from '../../constants/sortKeys'

import {
  Facet,
  Params,
  QueryResult
} from '../../../types/global'

// Amount of time to delay submission and wait for more input
const SUBMIT_DELAY_MS = 300

interface AutoSaveFormikProps {
  isLoading: boolean;
}

const AutoSaveFormik: React.FC<AutoSaveFormikProps> = ({ isLoading }) => {
  const formik = useFormikContext()
  const debouncedSubmit = React.useCallback(() => {
    const submit = debounce(() => formik.submitForm(), SUBMIT_DELAY_MS)
    submit()
  }, [formik])

  React.useEffect(() => {
    if (!isLoading && formik.dirty) debouncedSubmit()
  }, [isLoading, debouncedSubmit, formik.values])

  return null
}

interface ErrorWithResponse {
  response?: {
    data?: {
      errors?: string[];
    };
  };
}

function isErrorWithResponse(error: unknown): error is ErrorWithResponse {
  return typeof error === 'object' && error !== null && 'response' in error
}

interface DataState {
  facets?: object;
  collections: {
    items?: [];
    count: number | 0;
  };
}

const countFilters = (facets: Facet, params: Params) => {
  let result = getAppliedFacets(facets).length
  if (params.temporal) {
    if (Array.isArray(params.temporal)) {
      if (params.temporal.filter((p) => p).length > 0) result += 1
    }
  }

  if (params.bounding_box) result += 1

  return result
}

const DataCatalog: React.FC = () => {
  // Get the browser history
  const navigate = useNavigate()

  // Grab the search portion of the url which contains the query parameters
  const { search } = useLocation()

  // Parse out the query string to populate the form fields
  const parsedQueryString = parseCollectionsQuery(search)

  const {
    page_num: currentPage = 1,
    page_size: currentPageSize = getConfig('defaultPageSize'),
    sort_key: currentSortKey = defaultSortKey
  } = parsedQueryString

  const [collectionSearchParams, setCollectionSearchParams] = useState(parsedQueryString)

  const [data, setData] = useState<DataState>({
    facets: Object,
    collections: {
      items: [],
      count: 0
    }
  })

  const [error, setError] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [called, setCalled] = useState<boolean>(false)

  // Whether or not the sidebar is open on smaller screens (always open on larger)
  const [isSidebarOpened, setSidebarOpened] = useState(false)
  const [filterCount, setFilterCount] = useState(0)

  useEffect(() => {
    async function submitQuery() {
      try {
        setCalled(true)
        setLoading(true)

        const response: QueryResult = await
        queryFacetedCollections(collectionSearchParams as Params)
        const { facetData, data: responseData } = response

        const items = responseData?.items

        const facets = facetData?.feed?.facets

        setData({
          facets,
          collections: {
            items,
            count: parseInt((response.headers as Headers).get('cmr-hits') || '0', 10)
          }
        })

        setFilterCount(countFilters(facets as unknown as Facet, collectionSearchParams as Params))
        setError(false)
      } catch (e) {
        setError(true)
        setFilterCount(countFilters({} as Facet, collectionSearchParams as Params))

        if (isErrorWithResponse(e) && e.response?.data?.errors) {
          setErrorMessage(e.response.data.errors.join('. '))
        } else {
          setErrorMessage((e as Error).message)
        }
      } finally {
        setLoading(false)
      }
    }

    submitQuery()
  }, [collectionSearchParams])

  /**
   * Updates the search parameters in the state
   * @param {Object} newParams New search parameters to be saved in the state
   */
  const updateSearchParams = (searchParams: Params) => {
    setCollectionSearchParams(searchParams)

    navigate({
      search: `?${stringifyCollectionsQuery(searchParams, true)}`
    })
  }

  const setQueryString = (str: string) => {
    updateSearchParams(parseCollectionsQuery(str.replace(/(page_num=)\d+/, '$11')))
  }

  /**
   * Submit the values provided in the form
   * @param {Object} values Form field values being submitted
   * @param {Object} param1 Formik provided callbacks
   */
  const handleSubmit = (values: Params, { setSubmitting }: FormikHelpers<Params>) => {
    const searchParams = pickBy(values, identity)
    setSubmitting(false)

    delete searchParams.page_num

    updateSearchParams(searchParams)
  }

  const { collections } = data

  const facets = data.facets || {
    title: 'Browse Collections',
    type: 'group',
    hasChildren: false
  }

  const setQueryPage = (pageNumber: number) => {
    // Combines current search params and selected page number
    const updatedSearchParam = {
      ...collectionSearchParams,
      page_num: pageNumber
    }

    const query = stringifyCollectionsQuery(updatedSearchParam)

    updateSearchParams(parseCollectionsQuery(query))
  }

  const setQueryPageSize = (pageSize: number) => {
    // Combines current search params and selected page size
    const updatedSearchParam = {
      ...collectionSearchParams,
      page_num: 1,
      page_size: pageSize
    }

    const query = stringifyCollectionsQuery(updatedSearchParam)

    updateSearchParams(parseCollectionsQuery(query))
  }

  const setQuerySort = (sortKey: string) => {
    let updatedSearchParam = null

    if (!getValidSortkey(sortKey) || sortKey === defaultSortKey) {
      delete collectionSearchParams.sort_key
      updatedSearchParam = collectionSearchParams
    } else {
      updatedSearchParam = {
        ...collectionSearchParams,
        page_num: 1,
        sort_key: sortKey
      }
    }

    const query = stringifyCollectionsQuery(updatedSearchParam)

    updateSearchParams(parseCollectionsQuery(query))
  }

  return (
    <div className="data-catalog-wrapper">
      <Formik
        initialValues={collectionSearchParams}
        onSubmit={handleSubmit}
        className="hzn"
        enableReinitialize
      >
        {
          ({
            values,
            handleChange,
            handleBlur,
            handleSubmit: formHandleSubmit
          }) => (
            <>
              <header className="hzn-main-header">
                <Container className="pt-4">
                  <h1>Data Catalog</h1>
                  <Form onSubmit={formHandleSubmit}>
                    <div className="hzn-search hzn-global-header">
                      <Form.Control
                        type="text"
                        name="keyword"
                        placeholder="Search using keywords, platform, dataset name, and more&hellip;"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.keyword as string || ''}
                        data-testid="collection-search__keyword"
                        role="searchbox"
                      />
                      <Button
                        onClick={
                          (e: React.MouseEvent<HTMLButtonElement>) => {
                            e.preventDefault()
                            formHandleSubmit()
                          }
                        }
                        className="hzn-search__button"
                        aria-label="Submit"
                      />
                    </div>
                  </Form>
                  <AppliedFilters
                    facets={facets as Facet}
                    filterValues={values}
                    isLoading={loading}
                    setQueryString={setQueryString}
                  />
                </Container>
              </header>
              <div className="hzn-body">
                <Container>
                  <Row className="justify-content-between">
                    <Col
                      id="search-filters"
                      aria-hidden={!isSidebarOpened}
                      className={`offcanvas-lg offcanvas-start hzn-sidebar hzn-offcanvas hzn-column${isSidebarOpened ? ' show' : ''}`}
                      data-testid="search-filters"
                    >
                      {/* Header on narrow screens */}
                      <header className="offcanvas-header hzn-offcanvas__header">
                        <h1>Filters</h1>
                        <button type="button" className="btn-close" onClick={() => setSidebarOpened(false)} aria-label="Close" />
                      </header>
                      {/* Header on wider screens */}
                      <header className="offcanvas-lg">
                        <h1>Filters</h1>
                      </header>
                      <SearchFilters
                        facets={facets}
                        filterValues={values}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        setQueryString={setQueryString}
                        setSidebarOpened={setSidebarOpened}
                      />
                    </Col>
                    <Col className="hzn-content hzn-column" aria-busy={called && loading} role="main">
                      {
                        (called && error && errorMessage) && (
                          <ErrorBanner role="alert" message={errorMessage} />
                        )
                      }

                      {
                        (called && loading) && (
                          <LoadingBanner />
                        )
                      }

                      {
                        !loading && (
                          <SearchResultsList
                            collections={
                              collections || {
                                count: 0,
                                items: []
                              }
                            }
                            currentPage={toNumber(currentPage)}
                            currentPageSize={toNumber(currentPageSize)}
                            setQueryPage={setQueryPage}
                            setQueryPageSize={setQueryPageSize}
                            filterCount={filterCount}
                            setSidebarOpened={setSidebarOpened}
                            currentSortKey={currentSortKey as string}
                            setQuerySort={setQuerySort}
                          />
                        )
                      }
                    </Col>
                  </Row>
                </Container>
              </div>
              <AutoSaveFormik isLoading={loading} />
            </>
          )
        }
      </Formik>
    </div>
  )
}

export default DataCatalog
