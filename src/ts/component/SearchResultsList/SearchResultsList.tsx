import React from 'react'
import { commafy } from 'commafy-anything'
import pluralize from 'pluralize'

import './SearchResultsList.scss'

import {
  Button,
  Col,
  Container,
  Dropdown,
  Nav,
  Pagination,
  Row
} from 'react-bootstrap'
import SearchResultItem from '../SearchResultItem/SearchResultItem'

import {
  collectionSortKeys,
  defaultSortKey,
  getValidSortkey
} from '../../utils/getCollectionSortKeys'

interface DOI {
  DOI?: string;
  Authority?: string
}

interface DoiLink extends DOI {
  link: string;
  text: string;
}

interface CollectionItems {
  meta: {
    'concept-id': string;
    'provider-id': string;
  };
  umm: {
    Abstract: string;
    EntryTitle: string;
    DOI?: DoiLink;
    Projects?: Array<{ ShortName: string }>;
    ArchiveAndDistributionInformation?: {
      FileDistributionInformation: Array<{
        Format: string
        FormatType: string;
        FormatDescription: string;
        AverageFileSize: number;
        AverageFileSizeUnit: string;
        TotalCollectionFileSize: number;
        TotalCollectionFileSizeUnit: string
        Description: string

      }>;
    };
    DataCenters?: Array<{ Roles: string[]; ShortName: string }>;
    TemporalExtents?: object
    SpatialExtent?:{
      HorizontalSpatialDomain:object
    }
  };
}

interface Collections {
  count: number;
  items?: CollectionItems[];
}

interface SearchResultsListProps {
  collections: Collections;
  currentPage: number;
  currentPageSize: number;
  currentSortKey?: string;
  filterCount: number;
  setQueryPage: (page: number) => void;
  setQueryPageSize: (size: number) => void;
  setQuerySort: (key: string) => void;
  setSidebarOpened: (isOpened: boolean) => void;
}

export const SearchResultsList: React.FC<SearchResultsListProps> = ({
  collections,
  currentPage,
  currentPageSize,
  currentSortKey,
  filterCount,
  setQueryPage,
  setQueryPageSize,
  setQuerySort,
  setSidebarOpened
}) => {
  const { count: collectionCount, items } = collections

  const rows = [10, 20, 50, 100]

  const totalPages = Math.ceil(collectionCount / currentPageSize)

  const handleScroll = () => {
    setTimeout(() => {
      window.scrollTo({
        top: 0
      })
    }, 100)
  }

  const handleNextPage = () => {
    handleScroll()
    if (currentPage < totalPages) {
      setQueryPage(currentPage + 1)
    }
  }

  const handlePreviousPage = () => {
    handleScroll()
    if (currentPage > 1) {
      setQueryPage(currentPage - 1)
    }
  }

  const renderPageNumbers = () => {
    const paginationItems: React.JSX.Element[] = []

    const pageNumbers = Array.from(
      { length: (totalPages < 5 ? totalPages : 5) },
      (_, index) => index + Math.max(1, currentPage - 2)
    )

    paginationItems.push(
      <Pagination.Prev
        className="pagination-prev"
        disabled={currentPage === 1}
        key="previous"
        onClick={handlePreviousPage}
      >
        <svg width="15" height="18" viewBox="0 0 6 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path className="svg-icon" fillRule="evenodd" clipRule="evenodd" d="M2.145 4L5.4 7.233 4.627 8 .6 4l4.027-4L5.4.767 2.145 4z" />
        </svg>
      </Pagination.Prev>
    )

    if (pageNumbers[0] > 1) {
      paginationItems.push(
        <Pagination.Ellipsis
          disabled
          key="start-ellipsis"
        />
      )
    }

    pageNumbers.forEach((number) => {
      if (number <= totalPages - 1 && number >= 1) {
        paginationItems.push(
          <Pagination.Item
            active={number === (currentPage)}
            key={number}
            onClick={
              () => {
                handleScroll()
                setQueryPage(number)
              }
            }
          >
            {number}
          </Pagination.Item>
        )
      }
    })

    if (pageNumbers[pageNumbers.length - 1] < totalPages) {
      paginationItems.push(
        <Pagination.Ellipsis
          className="pagination-ellipsis"
          disabled
          key="end-ellipsis"
        />
      )
    }

    paginationItems.push(
      <Pagination.Item
        active={currentPage === totalPages}
        key="last"
        onClick={
          () => {
            handleScroll()
            setQueryPage(totalPages)
          }
        }
      >
        {totalPages}
      </Pagination.Item>
    )

    paginationItems.push(
      <Pagination.Next
        className="pagination-next"
        disabled={currentPage === totalPages}
        key="next"
        onClick={handleNextPage}
      >
        <svg width="15" height="18" viewBox="0 0 6 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path className="svg-icon" fillRule="evenodd" clipRule="evenodd" d="M3.855 4L.6.767 1.373 0 5.4 4 1.373 8 .6 7.233 3.855 4z" />
        </svg>
      </Pagination.Next>
    )

    return paginationItems
  }

  return (
    <>
      <header className="hzn-search-results-header">
        <Row>
          <Col className="search-results-header__summary">
            <div
              className="d-none d-md-block mb-md-3 mb-lg-0"
            >
              {'Showing '}
              {items ? items.length : 0}
              {' of '}
              {commafy(collectionCount || 0, { thousandsComma: true })}
              {' '}
              {pluralize('result', collectionCount)}
            </div>
            <div className="hzn-sidebar-control hzn-filter-summary">
              <Button className="hzn-filter-summary__button" variant="link" onClick={() => setSidebarOpened(true)} aria-controls="search-filters">
                Filter
                {filterCount ? ` (${filterCount}) ` : ' '}
                <span className="hzn-filter-summary__icon">
                  <i className="hzn-icon hzn-icon-list" />
                </span>
              </Button>
            </div>
          </Col>
          <Col className="search-result-sort__row">
            <Dropdown className="search-result-sort__dropdown">
              <Dropdown.Toggle variant="none">
                <span className="search-result-sort__label">SORT:</span>
                <span className="search-result-sort__value">{currentSortKey ? getValidSortkey(currentSortKey) : defaultSortKey}</span>
                <svg className="search-result-sort__svg-icon" width="10" height="10" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M4 3.855L7.233.6 8 1.372 4 5.4 0 1.372.767.6 4 3.855z" fill="black" />
                </svg>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {
                  collectionSortKeys.map((sortKey) => {
                    const { key, value } = sortKey

                    return (
                      <Dropdown.Item
                        key={key}
                        onClick={
                          () => {
                            handleScroll()
                            setQuerySort(key)
                          }
                        }
                      >
                        {value}
                      </Dropdown.Item>
                    )
                  })
                }
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>
      </header>
      {
        items !== null && items !== undefined && items.map((metadata) => (
          <SearchResultItem
            key={`collection-${metadata.meta['concept-id']}`}
            metadata={metadata}
          />
        ))
      }
      <Nav className="d-none d-md-block mt-3 mb-3" />
      <Container className="search-result-navigation">
        <Row>
          <Col>
            {
              totalPages > 1 && (
                <Pagination className="d-none d-md-flex" aria-label="pagination">
                  {renderPageNumbers()}
                </Pagination>
              )
            }
          </Col>
          <Col className="search-result-navigation__row">
            <Dropdown className="search-result-navigation__dropdown">
              <Dropdown.Toggle variant="none">
                <span className="search-result-navigation__label">ROWS</span>
                <span className="search-result-navigation__page-size">{currentPageSize}</span>
                <svg className="search-result-navigation__svg-icon" width="10" height="10" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M4 3.855L7.233.6 8 1.372 4 5.4 0 1.372.767.6 4 3.855z" fill="black" />
                </svg>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {
                  rows.map((row) => (
                    <Dropdown.Item
                      key={row}
                      onClick={
                        () => {
                          handleScroll()
                          setQueryPageSize(row)
                        }
                      }
                    >
                      {row}
                    </Dropdown.Item>
                  ))
                }
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>
      </Container>
    </>

  )
}

export default SearchResultsList
