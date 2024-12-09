import React, { useState } from 'react'

import PropTypes from 'prop-types'
import { useMediaQuery } from 'react-responsive'

import FacetChecklistItem from '../FacetChecklistItem/FacetChecklistItem'

const MAX_FACETS = 5
const LARGE_MINIMUM = '1056px' // Smallest 'Large' width

export const FacetChecklist = ({
  facets,
  humanize,
  name,
  param,
  onChange
}) => {
  const [isExpanded, setExpanded] = useState(false)

  const isLargeScreen = useMediaQuery({ query: `(min-width: ${LARGE_MINIMUM})` })

  let displayedFacets = facets
  if (!isExpanded && isLargeScreen) {
    displayedFacets = facets.slice(0, MAX_FACETS)
  }

  let expandLink = null
  if (facets.length > MAX_FACETS && isLargeScreen) {
    expandLink = (
      <button className="hzn-filters__expand-facet" onClick={() => setExpanded(!isExpanded)} type="button">
        {isExpanded ? `Collapse ${name} list` : `Show all ${name}`}
      </button>
    )
  }

  return (
    <>
      <ul className="hzn-filters__facets">
        {
          displayedFacets.map((facet) => (
            <FacetChecklistItem
              facet={facet}
              humanize={humanize}
              key={`${param}=${facet.title}`}
              param={param}
              onChange={onChange}
            />
          ))
        }
      </ul>
      {expandLink}
    </>
  )
}

FacetChecklist.propTypes = {
  facets: PropTypes.arrayOf(PropTypes.shape(
    {
      applied: PropTypes.bool,
      count: PropTypes.number,
      hasChildren: PropTypes.bool,
      links: PropTypes.shape({ apply: PropTypes.string }),
      title: PropTypes.string,
      type: PropTypes.string
    }
  )).isRequired,
  humanize: PropTypes.func,
  name: PropTypes.string.isRequired,
  param: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}

FacetChecklist.defaultProps = {
  humanize: (e) => e
}

export default FacetChecklist
