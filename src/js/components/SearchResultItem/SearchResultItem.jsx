import React from 'react'
import PropTypes from 'prop-types'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import {
  get,
  template,
  uniq
} from 'lodash-es'
import { getConfig } from '../../utils/getConfig'

// Various helpers meant to get from UMM-C JSON to something a human can read on a screen

/**
 * @param {string?} dateTimeStr An ISO date/time string
 * @returns {string?} the date portion the input string, if it exists
 */
function toDateStr(dateTimeStr) {
  if (dateTimeStr) return dateTimeStr.split('T')[0]

  return null
}

/**
 * Translates the temporal portion of UMM to a human-readable string
 * @param {*} umm UMM-C metadata
 * @returns {string} a human-readable temporal string
 */
function ummTemporalToHuman(umm) {
  const singleDate = get(umm, ['TemporalExtents', 0, 'SingleDateTimes', 0])
  if (singleDate) return toDateStr(singleDate)

  const rangeDate = get(umm, ['TemporalExtents', 0, 'RangeDateTimes', 0])
  if (!rangeDate) return null

  const start = toDateStr(rangeDate.BeginningDateTime)
  const end = toDateStr(rangeDate.EndingDateTime)

  if (!start && !end) return null
  if (start === end) return start
  if (!end) return `${start} ongoing`

  return `${start} to ${end}`
}

/**
 * Translates the spatial portion of UMM to a human-readable string
 * @param {*} umm UMM-C metadata
 * @returns {string} a human-readable temporal string
 */
function ummSpatialToSummary(umm) {
  const geometry = get(umm, ['SpatialExtent', 'HorizontalSpatialDomain', 'Geometry'])

  if (!geometry) return null

  const {
    Points,
    BoundingRectangles,
    GPolygons,
    CoordinateSystem
  } = geometry

  if (Points && Points[0]) {
    let result = `(${Points[0].Latitude}, ${Points[0].Longitude})`
    if (Points.length > 1) result += '...'

    return result
  }

  const bboxToSummary = (west, east, south, north) => {
    if (west === -180 && east === 180 && south === -90 && north === 90) return 'Global'

    return `Latitudes ${south} to ${north}, Longitudes ${west} to ${east}`
  }

  if (BoundingRectangles && BoundingRectangles[0]) {
    if (BoundingRectangles.length > 1) return 'Multiple bounding rectangles'

    const {
      WestBoundingCoordinate: west,
      EastBoundingCoordinate: east,
      NorthBoundingCoordinate: north,
      SouthBoundingCoordinate: south
    } = BoundingRectangles[0]

    return bboxToSummary(west, east, south, north)
  }

  // Polygons that are effectively bounding boxes need handling :(. See C2748088093-LPCLOUD
  if (GPolygons && GPolygons[0] && CoordinateSystem === 'CARTESIAN') {
    const points = get(GPolygons, [0, 'Boundary', 'Points'], [])
    const lats = uniq(points.map((p) => p.Latitude))
    const lons = uniq(points.map((p) => p.Longitude))
    if (lats.length === 2 && lons.length === 2) {
      const west = Math.min(...lons)
      const east = Math.max(...lons)
      const south = Math.min(...lats)
      const north = Math.max(...lats)

      return bboxToSummary(west, east, south, north)
    }
  }

  return null
}

/**
 * Extracts a link URL and text from a UMM DOI
 * @param {*} doi UMM-C DOI metadata
 * @returns {object} a link object with keys for 'link' (href) and 'title' text
 */
function doiLink(doi) {
  if (!doi || !doi.DOI) return null

  let link = doi.Authority || 'https://doi.org/'
  if (!link.endsWith('/')) link += '/'
  // Mandatory DOI encoding rules.
  // See https://www.doi.org/the-identifier/resources/factsheets/doi-resolution-documentation#2-encoding-dois-for-use-in-uris
  link += doi.DOI
    .replaceAll('%', '%25')
    .replaceAll('"', '%22')
    .replaceAll('#', '%23')
    .replaceAll(' ', '%20')
    .replaceAll('?', '%3F')

  return {
    link,
    text: doi.DOI
  }
}

/**
 * Parses a human-readable summary from UMM-C JSON metadata
 * @param {*} param The UMM-C metadata item with meta and umm fields
 * @returns {object} an object summarizing the UMM-C JSON appropriate for display
 */
function ummToSummary({ meta, umm }) {
  const daac = (umm.DataCenters || []).find(({ Roles }) => Roles.indexOf('ARCHIVER') !== -1)

  const fileFormats = get(umm, ['ArchiveAndDistributionInformation', 'FileDistributionInformation'], [])
    .filter((f) => f.FormatType === 'Native').map((f) => f.Format).join(', ') || null

  const projects = (umm.Projects || []).map((p) => p.ShortName).join(', ') || null

  const configuredLandingPage = (umm.RelatedUrls || []).find(({ Type }) => Type === 'DATA SET LANDING PAGE')

  const dates = umm.DataDates
  const published = dates && dates.length > 0 && toDateStr(dates[dates.length - 1].Date)

  return {
    conceptId: meta['concept-id'],
    title: umm.EntryTitle,
    summary: umm.Abstract,
    temporal: ummTemporalToHuman(umm),
    spatial: ummSpatialToSummary(umm),
    configuredLandingPage: configuredLandingPage && configuredLandingPage.URL,
    doi: doiLink(umm.DOI),
    daac: daac && daac.ShortName.split('/').pop(),
    fileFormats,
    projects,
    published,
    providerId: meta['provider-id']
  }
}

/**
 * Small helper to display text with an icon
 */
const TextIcon = ({
  className,
  field,
  iconName,
  title
}) => field && (
  <div className={`hzn-text-icon ${className}`}>
    <i className={`hzn-icon hzn-icon-${iconName} hzn-text-icon__icon`} title={title} />
    <span className="hzn-text-icon__field">{field}</span>
  </div>
)
TextIcon.propTypes = {
  field: PropTypes.string,
  iconName: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  className: PropTypes.string
}

TextIcon.defaultProps = {
  className: '',
  field: undefined
}

export const SearchResultItem = ({ metadata }) => {
  const {
    conceptId,
    title,
    summary,
    temporal,
    spatial,
    daac,
    configuredLandingPage,
    doi,
    fileFormats,
    projects,
    published,
    providerId
  } = ummToSummary(metadata)

  const collection = (metadata)

  const collectionPath = getConfig('collectionPath') || '/collections/<%= id %>'
  const providersWithLandingPages = getConfig('providersWithLandingPages')

  const landingPageNotFound = getConfig('landingPageNotFound')

  const compiledTemplate = template(collectionPath)

  // Create a new object with encoded umm values
  const encodedUmm = {}

  // Iterate over the collection.umm object
  Object.keys(collection.umm).forEach((key) => {
  // Encode each value and assign it to the new object
    encodedUmm[key] = encodeURIComponent(collection.umm[key])
  })

  const fullPath = compiledTemplate({
    id: collection.meta['concept-id'],
    ProviderId: providerId,
    ...encodedUmm
  })

  const titleLink = () => {
    // Render a clickable title link if:
    // 1. There's no list of providers with landing pages (all providers get links), or
    // 2. The current provider is in the list of providers that should have dataset landing pages
    if (!providersWithLandingPages || providersWithLandingPages.includes(providerId)) {
      return fullPath.toLowerCase().replace(/_/g, '-')
    }

    // If a DOI is available and the provider is not in providersWithLandingPages,
    // render the title as a link to the DOI landing page
    if (doi) {
      return doi.link
    }

    // If there's a configured landing page in the CMR
    if (configuredLandingPage) {
      return configuredLandingPage
    }

    return landingPageNotFound || '/404'
  }

  return (
    <div key={conceptId} className="hzn-search-result pb-2">
      <Row>
        <Col className="hzn-search-result__meta_metadata">
          Data&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Published&nbsp;
          {published}
        </Col>
      </Row>
      <Row>
        <Col lg={9}>
          <h1>
            <a href={titleLink()}>{title}</a>
          </h1>
          <p
            className="hzn-search-result__abstract mb-3"
            data-testid="collection-search-result__abstract"
          >
            {summary}
          </p>
          {
            temporal && (
              <p
                className="hzn-search-result__temporal mb-2"
                data-testid="collection-search-result__temporal"
              >
                <strong>Temporal Coverage: </strong>
                {' '}
                {temporal}
              </p>
            )
          }
          {
            spatial && (
              <p
                className="hzn-search-result__spatial mb-2"
                data-testid="collection-search-result__spatial"
              >
                <strong>Spatial Coverage: </strong>
                {' '}
                {spatial}
              </p>
            )
          }
        </Col>
        <Col lg={3}>
          <Row>
            <TextIcon className="col-md-auto col-lg-12 mb-2" iconName="doc" title="File Format" field={fileFormats} />
            <TextIcon className="col-md-auto col-lg-12 mb-2" iconName="globe" title="Mission / Project" field={projects} />
            <TextIcon className="col-md-auto col-lg-12 mb-2" iconName="location" title="Archive Center" field={daac} />
          </Row>
        </Col>
      </Row>
      {
        doi && (
          <div className="hzn-search-result__doi mb-2 mt-1">
            <a className="hzn-search-result__doi-link" href={doi.link}>{doi.text}</a>
          </div>
        )
      }
    </div>
  )
}

SearchResultItem.propTypes = {
  metadata: PropTypes.shape({
    meta: PropTypes.shape({
      'concept-id': PropTypes.string.isRequired
    }).isRequired,
    umm: PropTypes.shape({
      Abstract: PropTypes.string,
      TemporalExtents: PropTypes.arrayOf(PropTypes.shape({})),
      EntryTitle: PropTypes.string
    }).isRequired
  }).isRequired
}

export default SearchResultItem
