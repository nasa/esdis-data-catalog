import React from 'react'
import { useMediaQuery } from 'react-responsive'
import Form from 'react-bootstrap/Form'
import Accordion from 'react-bootstrap/Accordion'
import Button from 'react-bootstrap/Button'

const LARGE_MINIMUM = '1056px'

interface SearchFilterSectionListProps {
  children: React.ReactNode;
  defaultActiveKey: string[];
  setSidebarOpened: (_isOpened: boolean) => void;
}

export const SearchFilterSectionList: React.FC<SearchFilterSectionListProps> = ({
  defaultActiveKey,
  setSidebarOpened,
  children
}) => {
  const isLargeScreen = useMediaQuery({ query: `(min-width: ${LARGE_MINIMUM})` })

  return (
    <>
      {
        isLargeScreen && (
          <Form className="hzn-filters" role="search">
            <Accordion alwaysOpen className="hzn-filters__accordion" defaultActiveKey={defaultActiveKey} aria-label="Filters accordion">
              {children}
            </Accordion>
          </Form>
        )
      }
      {
        !isLargeScreen && (
          <>
            <Form className="offcanvas-body hzn-offcanvas__body hzn-filters" role="search">
              {children}
            </Form>
            {/* Placebo button. Everything is automatically applied. */}
            <Button className="hzn-offcanvas__apply" onClick={() => setSidebarOpened(false)}>Apply</Button>
          </>
        )
      }
    </>
  )
}

export default SearchFilterSectionList
