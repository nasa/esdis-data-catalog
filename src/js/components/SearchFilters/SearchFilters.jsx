import React from 'react'
import PropTypes from 'prop-types'
import Accordion from 'react-bootstrap/Accordion'
import Form from 'react-bootstrap/Form'

import './SearchFilters.scss'
import FacetChecklist from '../FacetChecklist/FacetChecklist'
import SearchFilterSection, {
  SearchFilterSectionList
} from '../SearchFilterSection/SearchFilterSection'

const findFacet = (facets, title) => {
  if (!facets || !facets.children) return null

  return facets.children.find((c) => c.title === title)
}

const findChildFacets = (facets, title) => {
  const facet = findFacet(facets, title)
  if (!facet || !facet.children) return []

  return facet.children
}

const ickyValues = ['-Na-', 'Not Provided', 'Other (Ames)']

const namesToParams = {
  Keywords: 'science_keywords_h',
  Platforms: 'platforms_h',
  'Horizontal Data Resolution': 'horizontal_data_resolution_range',
  'Data Format': 'granule_data_format_h',
  'Processing Levels': 'processing_level_id'
}

export const SearchFilters = ({
  facets,
  filterValues,
  handleChange,
  handleBlur,
  setQueryString,
  setSidebarOpened
}) => {
  const onChange = (facet, isChecked) => {
    const { apply, remove } = facet.links
    if (isChecked && apply) {
      setQueryString(apply.split('?')[1])
    }

    if (!isChecked && remove) {
      setQueryString(remove.split('?')[1])
    }
  }

  const getFacets = (t) => findChildFacets(facets, t)
    .filter(({ title }) => !ickyValues.includes(title))

  return (
    <SearchFilterSectionList
      defaultActiveKey={['1']}
      setSidebarOpened={setSidebarOpened}
    >
      {/* Unimplemented. In Data Catalog comps but not site search comps. TBD if needed.
      <Accordion.Item eventKey="0">
        <Accordion.Header>Filter By Text</Accordion.Header>
        <Accordion.Body />
      </Accordion.Item> */}
      {
        getFacets('Keywords').length > 0 && (
          <SearchFilterSection title="Topics" eventKey="1" setSidebarOpened={setSidebarOpened}>
            <FacetChecklist
              name="topics"
              param={namesToParams.Keywords}
              facets={getFacets('Keywords')}
              onChange={onChange}
            />
          </SearchFilterSection>
        )
      }
      {/* Commented out until section is implemented
      <Accordion.Item eventKey="2">
        <Accordion.Header>Data Features</Accordion.Header>
        <Accordion.Body>
          {
            // CUSTOM FIELDS HERE
            // "Cloud Enabled"
            // "Continuity Product"
          }
        </Accordion.Body>
      </Accordion.Item> */}
      {
        getFacets('Platforms').length > 0 && (
          <SearchFilterSection title="Observation Method" eventKey="3" setSidebarOpened={setSidebarOpened}>
            <FacetChecklist
              name="observation methods"
              facets={getFacets('Platforms')}
              param={namesToParams.Platforms}
              onChange={onChange}
              humanize={(name) => name.replace(' Platforms', '')}
            />
          </SearchFilterSection>
        )
      }
      <SearchFilterSection title="Temporal" eventKey="4" setSidebarOpened={setSidebarOpened}>
        <Accordion alwaysOpen className="hzn-filters__accordion_sub" defaultActiveKey={['4.0', '4.1']}>
          <Accordion.Item eventKey="4.0">
            <Accordion.Header>Coverage Date Range</Accordion.Header>
            <Accordion.Body>
              <Form.Group controlId="temporal[0]">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  size="sm"
                  name="temporal[0]"
                  placeholder="MM/DD/YYYY"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={(filterValues.temporal && filterValues.temporal[0]) || ''}
                  aria-label="Start Date"
                />
              </Form.Group>

              <Form.Group controlId="temporal[1]">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  size="sm"
                  name="temporal[1]"
                  placeholder="MM/DD/YYYY"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={(filterValues.temporal && filterValues.temporal[1]) || ''}
                  aria-label="End Date"
                />
              </Form.Group>
            </Accordion.Body>
          </Accordion.Item>
          { /* Accordion.Item "Resolution" (No equivalent CMR facet. Requested in CMR-9871) */ }
        </Accordion>
      </SearchFilterSection>
      <SearchFilterSection title="Spatial" eventKey="5" setSidebarOpened={setSidebarOpened}>
        <Accordion alwaysOpen className="hzn-filters__accordion_sub" defaultActiveKey={['5.0', '5.1', '5.2']}>
          { /* Accordion.Item "Geographic Region" (No equivalent CMR facet. Requested in CMR-9872) */ }
          <Accordion.Item eventKey="5.1">
            <Accordion.Header>Coverage</Accordion.Header>
            <Accordion.Body>
              <Form.Group controlId="bounding_box">
                <Form.Control
                  type="text"
                  size="sm"
                  name="bounding_box"
                  placeholder="-180,-90,180,90 (W,S,E,N)"
                  onChange={handleChange}
                  aria-label="Bounding Box"
                  onBlur={handleBlur}
                  value={filterValues.bounding_box || ''}
                />
              </Form.Group>
            </Accordion.Body>
          </Accordion.Item>
          {
            getFacets('Horizontal Data Resolution').length > 0 && (
              <Accordion.Item eventKey="5.2">
                <Accordion.Header>Resolution</Accordion.Header>
                <Accordion.Body>
                  <FacetChecklist
                    name="spatial resolutions"
                    facets={getFacets('Horizontal Data Resolution')}
                    param={namesToParams['Horizontal Data Resolution']}
                    onChange={onChange}
                  />
                </Accordion.Body>
              </Accordion.Item>
            )
          }
        </Accordion>
      </SearchFilterSection>
      {
        getFacets('Data Format').length > 0 && (
          <SearchFilterSection title="Data Format" eventKey="6" setSidebarOpened={setSidebarOpened}>
            <FacetChecklist
              name="data formats"
              facets={getFacets('Data Format')}
              param={namesToParams['Data Format']}
              onChange={onChange}
            />
          </SearchFilterSection>
        )
      }
      {
        getFacets('Processing Levels').length > 0 && (
          <SearchFilterSection title="Data Processing Level" eventKey="7" setSidebarOpened={setSidebarOpened}>
            <FacetChecklist
              name="processing levels"
              facets={getFacets('Processing Levels')}
              param={namesToParams['Processing Levels']}
              onChange={onChange}
            />
          </SearchFilterSection>
        )
      }
      { /* Accordion.Item "Center" (No equivalent CMR field/facet. Requested CMR-9874) */ }
      { /* Accordion.Item "Date" (No equivalent. Probably won't do.) */ }
    </SearchFilterSectionList>
  )
}

SearchFilters.propTypes = {
  facets: PropTypes.shape(
    {}
  ).isRequired,
  filterValues: PropTypes.shape({
    start_time: PropTypes.string,
    end_time: PropTypes.string,
    bounding_box: PropTypes.string,
    temporal: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
  handleBlur: PropTypes.func.isRequired,
  setQueryString: PropTypes.func.isRequired,
  setSidebarOpened: PropTypes.func.isRequired
}

export default SearchFilters
