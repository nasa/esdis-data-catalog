import '../../css/horizon/index.scss'

import React, { useEffect, useState } from 'react'

import PropTypes from 'prop-types'

import { useLocation, useNavigate } from 'react-router-dom'

import { Formik, useFormikContext } from 'formik'

import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'

import pickBy from 'lodash-es/pickBy'
import debounce from 'lodash-es/debounce'
import identity from 'lodash-es/identity'

import { toNumber } from 'lodash-es'
import { parseCollectionsQuery } from '../../utils/parseCollectionsQuery'
import { getConfig } from '../../utils/getConfig'
import { queryFacetedCollections } from '../../utils/queryFacetedCollections'
import { getAppliedFacets } from '../../utils/getAppliedFacets'
import { stringifyCollectionsQuery } from '../../utils/stringifyCollectionsQuery'
import AppliedFilters from '../../components/AppliedFilters/AppliedFilters'
import SearchFilters from '../../components/SearchFilters/SearchFilters'
import ErrorBanner from '../../components/ErrorBanner/ErrorBanner'
import LoadingBanner from '../../components/LoadingBanner/LoadingBanner'
import SearchResultsList from '../../components/SearchResultsList/SearchResultsList'

// Amount of time to delay submission and wait for more input
const SUBMIT_DELAY_MS = 300

// Auto-save Formik form. See https://github.com/jaredpalmer/formik/issues/1218
const AutoSaveFormik = ({ isLoading }) => {
  const formik = useFormikContext()
  const debouncedSubmit = React.useCallback(
    debounce(() => formik.submitForm(), SUBMIT_DELAY_MS),
    [formik.submitForm]
  )

  React.useEffect(() => {
    if (!isLoading && formik.dirty) debouncedSubmit()
  }, [isLoading, debouncedSubmit, formik.values])

  return null
}

AutoSaveFormik.propTypes = { isLoading: PropTypes.bool.isRequired }

const countFilters = (facets, params) => {
  let result = getAppliedFacets(facets).length
  if (params.temporal && params.temporal.filter((p) => p).length > 0) result += 1
  if (params.bounding_box) result += 1

  return result
}

export const DataCatalog = () => {
  // Get the browser history
  const navigate = useNavigate()

  // Grab the search portion of the url which contains the query parameters
  const { search } = useLocation()

  // Parse out the query string to populate the form fields
  const parsedQueryString = parseCollectionsQuery(search)

  const {
    page_num: currentPage = 1,
    page_size: currentPageSize = getConfig('defaultPageSize'),
    sort_key: currentSortKey = 'Relevance'
  } = parsedQueryString

  const [collectionSearchParams, setCollectionSearchParams] = useState(parsedQueryString)

  const [data, setData] = useState({})
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [called, setCalled] = useState(false)

  // Whether or not the sidebar is open on smaller screens (always open on larger)
  const [isSidebarOpened, setSidebarOpened] = useState(false)
  const [filterCount, setFilterCount] = useState(0)

  useEffect(() => {
    async function submitQuery() {
      try {
        setCalled(true)
        setLoading(true)
        const response = await queryFacetedCollections(collectionSearchParams)
        const { facets } = response.facetData.feed
        setData({
          facets,
          collections: {
            items: response.data.items,
            count: parseInt(response.headers.get('cmr-hits'), 10)
          }
        })

        setFilterCount(countFilters(facets, collectionSearchParams))
        setError(false)
      } catch (e) {
        setError(true)
        setFilterCount(countFilters({}, collectionSearchParams))
        const { response } = e
        if (response && response.data && response.data.errors) {
          setErrorMessage(response.data.errors.join('. '))
        } else {
          setErrorMessage(e.message)
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
  const updateSearchParams = (searchParams) => {
    setCollectionSearchParams(searchParams)

    navigate({
      search: `?${stringifyCollectionsQuery(searchParams, true)}`
    })
  }

  const setQueryString = (str) => {
    updateSearchParams(parseCollectionsQuery(str.replace(/(page_num=)\d+/, '$11')))
  }

  /**
   * Submit the values provided in the form
   * @param {Object} values Form field values being submitted
   * @param {Object} param1 Formik provided callbacks
   */
  const handleSubmit = (values, { setSubmitting }) => {
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

  const setQueryPage = (pageNumber) => {
    // Combines current search params and selected page number
    const updatedSearchParam = {
      ...collectionSearchParams,
      page_num: pageNumber
    }

    const query = stringifyCollectionsQuery(updatedSearchParam)

    updateSearchParams(parseCollectionsQuery(query))
  }

  const setQueryPageSize = (pageSize) => {
    // Combines current search params and selected page size
    const updatedSearchParam = {
      ...collectionSearchParams,
      page_num: 1,
      page_size: pageSize
    }

    const query = stringifyCollectionsQuery(updatedSearchParam)

    updateSearchParams(parseCollectionsQuery(query))
  }

  const setQuerySort = (sortKey) => {
    let updatedSearchParam = null

    if (sortKey === 'relevance') {
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
                        value={values.keyword || ''}
                        data-testid="collection-search__keyword"
                        role="searchbox"
                      />
                      <Button
                        onClick={formHandleSubmit}
                        className="hzn-search__button"
                        aria-label="Submit"
                      />
                    </div>
                  </Form>
                  <AppliedFilters
                    facets={facets}
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
                            currentSortKey={currentSortKey}
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
