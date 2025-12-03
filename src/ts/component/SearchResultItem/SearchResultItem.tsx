import React from 'react'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import {
  get,
  template,
  uniq
} from 'lodash-es'
import { getConfig } from '../../utils/getConfig'
import TextIcon from '../TextIcon/TextIcon'

interface GeoPoint {
  Latitude: number;
  Longitude: number;
}

interface DOI {
  DOI?: string;
  Authority?: string
  Url?: string;
}

interface DoiLink extends DOI {
  link?: string;
  text?: string;
}

function toDateStr(dateTimeStr: string | null): string | null {
  if (dateTimeStr) return dateTimeStr.split('T')[0]

  return null
}

interface Meta {
  'concept-id': string;
  'provider-id': string;
}

interface FileDistributionInfo {
  FormatType: string;
  Format: string;
  // Add other properties if needed
}
interface Umm {
  DataCenters?: Array<{ Roles: string[], ShortName: string }>;
  ArchiveAndDistributionInformation?: {
    FileDistributionInformation?: FileDistributionInfo[];
  };
  Projects?: Array<{ ShortName: string }>;
  RelatedUrls?: Array<{ Type: string, URL: string }>;
  DataDates?: Array<{ Type: string, Date: string }>;
  EntryTitle: string;
  ShortName: string;
  Version: String;
  Abstract: string;
  DOI?: DoiLink;
}

export interface Metadata {
  meta: {
    'concept-id': string;
    'provider-id': string;
  };
  umm: {
    Abstract: string;
    EntryTitle: string;
    ShortName: string;
    Version: string;
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

interface SearchResultItemProps {
  metadata: Metadata;
}

function ummTemporalToHuman(umm: object): string | null {
  const singleDate = get(umm, ['TemporalExtents', 0, 'SingleDateTimes', 0])
  if (singleDate) return toDateStr(singleDate)

  const rangeDate = get(umm, ['TemporalExtents', 0, 'RangeDateTimes', 0])
  if (!rangeDate) return null

  const start = toDateStr(rangeDate.BeginningDateTime)
  const end = toDateStr(rangeDate.EndingDateTime)

  if (!start && !end) return null
  if (start === end) return start
  if (!end) return `${start} to Present`

  return `${start} to ${end}`
}

function ummSpatialToSummary(umm: object): string | null {
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

  const bboxToSummary = (west: number, east: number, south: number, north: number): string => {
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

  if (GPolygons && GPolygons[0] && CoordinateSystem === 'CARTESIAN') {
    const points = get(GPolygons, [0, 'Boundary', 'Points'], [])
    const lats = uniq(points.map((p: GeoPoint) => p.Latitude))
    const lons = uniq(points.map((p: GeoPoint) => p.Longitude))
    if (lats.length === 2 && lons.length === 2) {
      const west = Math.min(...lons as number[])
      const east = Math.max(...lons as number[])
      const south = Math.min(...lats as number[])
      const north = Math.max(...lats as number[])

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
function doiLink(doi: DOI) {
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
 * @param param The UMM-C metadata item with meta and umm fields
 * @returns an object summarizing the UMM-C JSON appropriate for display
 */
function ummToSummary({ meta, umm }: { meta: Meta, umm: Umm }) {
  const daac = (umm.DataCenters || []).find(({ Roles }) => Roles.indexOf('ARCHIVER') !== -1)

  const fileFormats = get(umm, ['ArchiveAndDistributionInformation', 'FileDistributionInformation'], [])
    .filter((f: FileDistributionInfo) => f.FormatType === 'Native').map((f: FileDistributionInfo) => f.Format).join(', ') || null

  const projects = (umm.Projects || []).map((p) => p.ShortName).join(', ') || null

  const configuredLandingPage = (umm.RelatedUrls || []).find(({ Type }) => Type === 'DATA SET LANDING PAGE')

  const dates = umm.DataDates
  const createDate = dates?.find((d) => d.Type === 'CREATE')
  const published = createDate && toDateStr(createDate.Date)

  return {
    conceptId: meta['concept-id'],
    title: umm.EntryTitle,
    shortname: umm.ShortName,
    version: umm.Version,
    summary: umm.Abstract,
    temporal: ummTemporalToHuman(umm),
    spatial: ummSpatialToSummary(umm),
    configuredLandingPage: configuredLandingPage && configuredLandingPage.URL,
    doi: umm.DOI ? doiLink(umm.DOI) : undefined,
    daac: daac && daac.ShortName.split('/').pop(),
    fileFormats,
    projects,
    published,
    providerId: meta['provider-id']
  }
}

export const SearchResultItem: React.FC<SearchResultItemProps> = ({ metadata }) => {
  const {
    conceptId,
    title,
    shortname,
    version,
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

  const collection = metadata

  const collectionPath = getConfig('collectionPath') || '/collections/<%= id %>'
  const cmrHost = getConfig('cmrHost')
  const providersWithLandingPages = getConfig('providersWithLandingPages')

  const compiledTemplate = template(collectionPath as string)

  // Create a new object with encoded umm values
  const encodedUmm: { [key: string]: string } = {}

  Object.entries(collection.umm).forEach(([key, value]) => {
    encodedUmm[key] = encodeURIComponent(String(value))
  })

  const fullPath = compiledTemplate({
    id: collection.meta['concept-id'],
    ProviderId: providerId,
    ...encodedUmm
  })

  const shortnameVersion = shortname && version ? `${shortname} v${version}` : null

  const titleLink = (): string => {
    // Render a clickable title link if:
    // 1. There's no list of providers with landing pages (all providers get links), or
    // 2. The current provider is in the list of providers that should have dataset landing pages
    if (!providersWithLandingPages || (providersWithLandingPages as string).includes(providerId)) {
      return fullPath.toLowerCase().replace(/_/g, '-')
    }

    // If a DOI is available and the provider is not in providersWithLandingPages,
    // render the title as a link to the DOI landing page
    if (doi) {
      return doi.link
    }

    // If there's a configured landing page in the CMR metadata
    if (configuredLandingPage) {
      return configuredLandingPage
    }

    // Otherwise fall back to using the CMR landing pages endpoint
    const defaultLandingPage = `${cmrHost}/concepts/${conceptId}`

    return (defaultLandingPage as string)
  }

  return (
    <div key={conceptId} className="hzn-search-result pb-2">
      <Row>
        <Col className="hzn-search-result__meta_metadata d-flex align-items-center">
          <span className="me-4">Data</span>
          <span className="me-2">
            Published
          </span>
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
      <div className="hzn-search-result__shortname-version-doi d-flex mb-2 mt-1">
        {shortnameVersion && (shortnameVersion)}
        {
          doi && (
            <a className="hzn-search-result__doi-link" href={doi.link}>{doi.text}</a>
          )
        }
      </div>
    </div>
  )
}

export default SearchResultItem
