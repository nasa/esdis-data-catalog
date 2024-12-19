import React, { useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import Accordion from 'react-bootstrap/Accordion'
import Button from 'react-bootstrap/Button'

const LARGE_MINIMUM = '992px'

interface SearchFilterSectionProps {
  title: string;
  eventKey: string;
  children: React.ReactNode;
  setSidebarOpened: (_isOpened: boolean) => void;
}

const SearchFilterSection: React.FC<SearchFilterSectionProps> = ({
  children,
  eventKey,
  setSidebarOpened,
  title
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

export default SearchFilterSection
