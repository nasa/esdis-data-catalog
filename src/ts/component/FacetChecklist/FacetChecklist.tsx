import React, { useState } from 'react'
import { useMediaQuery } from 'react-responsive'

import FacetChecklistItem from '../FacetChecklistItem/FacetChecklistItem'
import { Facet } from '../../../types/global'

const MAX_FACETS = 5
const LARGE_MINIMUM = '1056px' // Smallest 'Large' width

interface FacetChecklistProps {
  facets: Facet[];
  humanize?: (_value: string) => string;
  name: string;
  param: string;
  onChange: (_facet: Facet, _isChecked: boolean) => void;
}

export const FacetChecklist: React.FC<FacetChecklistProps> = ({
  facets,
  humanize = (e) => e,
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

export default FacetChecklist
