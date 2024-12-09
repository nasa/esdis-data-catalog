import React, { useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import PropTypes from 'prop-types'
import {
  Accordion,
  Button,
  Form
} from 'react-bootstrap'

const LARGE_MINIMUM = '1056px' // Smallest 'Large' width

export const SearchFilterSectionList = ({
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
            <Accordion alwaysOpen className="hzn-filters__accordion" defaultActiveKey={defaultActiveKey}>
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

SearchFilterSectionList.propTypes = {
  defaultActiveKey: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSidebarOpened: PropTypes.func.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired
}

export const SearchFilterSection = ({
  title,
  eventKey,
  children,
  setSidebarOpened
}) => {
  const isLargeScreen = useMediaQuery({ query: `(min-width: ${LARGE_MINIMUM})` })
  const [isOpened, setOpened] = useState(false)

  return (
    <>
      {
        isLargeScreen && (
          <Accordion.Item eventKey={eventKey}>
            <Accordion.Header>{title}</Accordion.Header>
            <Accordion.Body>
              {children}
            </Accordion.Body>
          </Accordion.Item>
        )
      }
      {
        !isLargeScreen && (
          <div>
            <Button className="hzn-offcanvas__section-select" variant="link" onClick={() => setOpened(true)}>
              <span>{title}</span>
              {/* Note: We almost certainly want to indicate how many filters are applied here, but
                  it's not in the comps, and it's not at all trivial to figure out with the way
                  filters / facets work, so this can be a post-MVP ticket.
                  Future author (I'm sorry): You'll need to get all of the applied filters, which
                  are facets, spatial, temporal, and possibly other things, figure out how many fall
                  under this section, which will be one or more of the above, and count them. For
                  facets, that may be filtering the applied facet list by parameter name, which we
                  aren't passing. See AppliedFilters.jsx for a start of how this could be done.
                  */}
              <i className="hzn-icon hzn-icon-right" title="Go" />
            </Button>
            <div aria-hidden={!isOpened} className={`offcanvas offcanvas-start${isOpened ? ' show' : ''} hzn-offcanvas`}>
              <header className="offcanvas-header hzn-offcanvas__header hzn-offcanvas__section-header">
                <Button variant="link" className="hzn-offcanvas__header-button" type="button" onClick={() => setOpened(false)} aria-label="Back">
                  <i className="hzn-icon hzn-icon-left" title="Back" />
                  <span>{title}</span>
                </Button>
                <Button type="button" className="btn-close" onClick={() => setSidebarOpened(false)} aria-label="Close" />
              </header>
              <div className="offcanvas-body hzn-offcanvas__body hzn-offcanvas__section-body">
                {children}
              </div>
              {/* Placebo button. Everything is automatically applied. */}
              <Button className="hzn-offcanvas__apply" onClick={() => setSidebarOpened(false)}>Apply</Button>
            </div>
          </div>
        )
      }
    </>
  )
}

SearchFilterSection.propTypes = {
  title: PropTypes.string.isRequired,
  eventKey: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired,
  setSidebarOpened: PropTypes.func.isRequired
}

export default SearchFilterSection
