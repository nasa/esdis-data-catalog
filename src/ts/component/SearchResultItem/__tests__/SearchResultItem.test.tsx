import React from 'react'

import { MemoryRouter as Router } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import cloneDeep from 'lodash-es/cloneDeep'

import { Metadata, SearchResultItem } from '../SearchResultItem'
import { getConfig } from '../../../utils/getConfig'

// Mock the getConfig module
vi.mock('../../../utils/getConfig', () => ({
  getConfig: vi.fn()
}))

// Define the type for getConfig
type GetConfigFunction = (_key: string) => string | string[] | number;

// Create a typed version of the mocked getConfig
const mockedGetConfig = vi.mocked(getConfig as GetConfigFunction)

const providersWithLandingPages = {
  providersWithLandingPages: ['TEST_PROVIDER']
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockUmm = (): any => cloneDeep({
  meta: {
    'concept-id': 'C100-FAKE',
    'provider-id': 'TEST_PROVIDER'
  },
  umm: {
    EntryTitle: 'Fake Collection',
    Abstract: 'Fake Abstract',
    ArchiveAndDistributionInformation: {
      FileDistributionInformation: [
        {
          FormatType: 'Native',
          Format: 'NetCDF4'
        },
        {
          FormatType: 'Native',
          Format: 'GeoJSON'
        }
      ]
    },
    DataCenters: [
      {
        Roles: ['UNKNOWN'],
        ShortName: 'THIS IS A BUG'
      },
      {
        Roles: ['SOMETHING', 'ARCHIVER'],
        ShortName: 'SOME/PREFIX/FOO.DAAC'
      }
    ],
    DataDates: [
      { Date: '2020-01-01T00:00:00.000Z' },
      { Date: '2020-01-02T00:00:00.000Z' }
    ],
    DOI: {
      Authority: 'https://doi.org/',
      DOI: 'ab:cd.ef'
    },
    RelatedUrls: [
      {
        Type: 'SOME TYPE',
        URL: 'https://example.com/spurious/url'
      },
      {
        Type: 'DATA SET LANDING PAGE',
        URL: 'https://example.com/landing/page'
      }
    ],
    SpatialExtent: {
      HorizontalSpatialDomain: {
        Geometry: {
          BoundingRectangles: [{
            WestBoundingCoordinate: -1,
            EastBoundingCoordinate: 2,
            SouthBoundingCoordinate: -3,
            NorthBoundingCoordinate: 4
          }]
        }
      }
    },
    TemporalExtents: [
      {
        RangeDateTimes: [{
          BeginningDateTime: '2021-01-01T00:00:00.000Z',
          EndingDateTime: '2021-01-02T00:00:00.000Z'
        }]
      },
      {
        SingleDateTimes: ['2021-01-03T00:00:00.000Z']
      }
    ],
    Projects: [
      { ShortName: 'Project 1' },
      { ShortName: 'Project 2' }
    ]
  }
})

const renderMetadata = (metadata: Metadata) => render(
  <Router>
    <SearchResultItem metadata={metadata} />
  </Router>
)

describe('DataCatalog SearchResultItem component', () => {
  test('renders the collection', () => {
    renderMetadata(mockUmm())

    // Assert things are on the screen that we may assert aren't present after manipulating
    // metadata in other tests.
    expect(screen.getByText('Fake Collection')).toBeInTheDocument()
    expect(screen.getByText('Fake Abstract')).toBeInTheDocument()
    expect(screen.getByText('Data Published 2020-01-02')).toBeInTheDocument()
    expect(screen.getByText('Latitudes -3 to 4, Longitudes -1 to 2')).toBeInTheDocument()
    expect(screen.getByText('2021-01-01 to 2021-01-02')).toBeInTheDocument()
    expect(screen.getByTitle('File Format')).toBeInTheDocument()
    expect(screen.getByText('NetCDF4, GeoJSON')).toBeInTheDocument()
    expect(screen.getByTitle('Mission / Project')).toBeInTheDocument()
    expect(screen.getByText('Project 1, Project 2')).toBeInTheDocument()
    expect(screen.getByTitle('Archive Center')).toBeInTheDocument()
    expect(screen.getByText('FOO.DAAC')).toBeInTheDocument()
    expect(screen.getByText('ab:cd.ef')).toHaveAttribute('href', 'https://doi.org/ab:cd.ef')
    expect(screen.getByText('Spatial Coverage:')).toBeInTheDocument()
    expect(screen.getByText('Temporal Coverage:')).toBeInTheDocument()
  })

  test('renders single date times', () => {
    const metadata = mockUmm()
    metadata.umm.TemporalExtents.shift()
    renderMetadata(metadata)

    expect(screen.getByText('2021-01-03')).toBeInTheDocument()
  })

  test('renders forward-processing collection temporal as "ongoing"', () => {
    const metadata = mockUmm()
    delete metadata.umm.TemporalExtents[0].RangeDateTimes[0].EndingDateTime
    renderMetadata(metadata)

    expect(screen.getByText('2021-01-01 ongoing')).toBeInTheDocument()
  })

  test('renders temporal with start == end as a single date', () => {
    const metadata = mockUmm()
    metadata.umm.TemporalExtents = [{
      RangeDateTimes: [{
        BeginningDateTime: '2021-01-01T00:00:00',
        EndingDateTime: '2021-01-01T00:00:00'
      }]
    }]

    renderMetadata(metadata)
    expect(screen.getByText('2021-01-01')).toBeInTheDocument()
    expect(screen.queryByText('2021-01-01 to 2021-01-01')).not.toBeInTheDocument()
  })

  test('does not render temporal with no start or end', () => {
    const metadata = mockUmm()
    metadata.umm.TemporalExtents = [{ RangeDateTimes: [{}] }]
    renderMetadata(metadata)
    expect(screen.queryByText('Temporal Coverage:')).not.toBeInTheDocument()
  })

  test('does not render missing temporal', () => {
    const metadata = mockUmm()
    delete metadata.umm.TemporalExtents
    renderMetadata(metadata)
    expect(screen.queryByText('Temporal Coverage:')).not.toBeInTheDocument()
  })

  test('renders spatial covering all latitudes and longitudes as "Global"', () => {
    const metadata = mockUmm()
    metadata.umm.SpatialExtent.HorizontalSpatialDomain.Geometry.BoundingRectangles = [{
      WestBoundingCoordinate: -180,
      EastBoundingCoordinate: 180,
      SouthBoundingCoordinate: -90,
      NorthBoundingCoordinate: 90
    }]

    renderMetadata(metadata)
    expect(screen.getByText('Global')).toBeInTheDocument()
  })

  test('indicates multiple bounding box spatial', () => {
    const metadata = mockUmm()
    metadata.umm.SpatialExtent.HorizontalSpatialDomain.Geometry.BoundingRectangles.push({
      WestBoundingCoordinate: -5,
      EastBoundingCoordinate: 6,
      SouthBoundingCoordinate: -7,
      NorthBoundingCoordinate: 8
    })

    renderMetadata(metadata)
    expect(screen.getByText('Multiple bounding rectangles')).toBeInTheDocument()
  })

  test('renders point spatial', () => {
    const metadata = mockUmm()
    metadata.umm.SpatialExtent.HorizontalSpatialDomain.Geometry = {
      Points: [
        {
          Latitude: 1,
          Longitude: 2
        }
      ]
    }

    renderMetadata(metadata)
    expect(screen.getByText('(1, 2)')).toBeInTheDocument()
  })

  test('indicates multiple point spatial', () => {
    const metadata = mockUmm()
    metadata.umm.SpatialExtent.HorizontalSpatialDomain.Geometry = {
      Points: [
        {
          Latitude: 1,
          Longitude: 2
        },
        {
          Latitude: 3,
          Longitude: 4
        }
      ]
    }

    renderMetadata(metadata)
    expect(screen.getByText('(1, 2)...')).toBeInTheDocument()
  })

  test('renders bounding boxes defined as polygons as though they were bounding boxes', () => {
    const metadata = mockUmm()
    metadata.umm.SpatialExtent.HorizontalSpatialDomain.Geometry = {
      CoordinateSystem: 'CARTESIAN',
      GPolygons: [
        {
          Boundary: {
            Points: [
              {
                Latitude: -1,
                Longitude: -2
              },
              {
                Latitude: 3,
                Longitude: -2
              },
              {
                Latitude: 3,
                Longitude: 4
              },
              {
                Latitude: -1,
                Longitude: 4
              },
              {
                Latitude: -1,
                Longitude: -2
              }
            ]
          }
        }
      ]
    }

    renderMetadata(metadata)
    expect(screen.getByText('Latitudes -1 to 3, Longitudes -2 to 4')).toBeInTheDocument()
  })

  test('does not render non-cartesian rectangular', () => {
    const metadata = mockUmm()
    metadata.umm.SpatialExtent.HorizontalSpatialDomain.Geometry = {
      CoordinateSystem: 'GEODETIC',
      GPolygons: [
        {
          Boundary: {
            Points: [
              {
                Latitude: -1,
                Longitude: -2
              },
              {
                Latitude: 3,
                Longitude: -2
              },
              {
                Latitude: 3,
                Longitude: 4
              },
              {
                Latitude: -1,
                Longitude: 4
              },
              {
                Latitude: -1,
                Longitude: -2
              }
            ]
          }
        }
      ]
    }

    renderMetadata(metadata)
    expect(screen.queryByText('Spatial Coverage:')).not.toBeInTheDocument()
  })

  test('does not render non-rectangular polygons', () => {
    const metadata = mockUmm()
    metadata.umm.SpatialExtent.HorizontalSpatialDomain.Geometry = {
      CoordinateSystem: 'CARTESIAN',
      GPolygons: [
        {
          Boundary: {
            Points: [
              {
                Latitude: -1,
                Longitude: -2
              },
              {
                Latitude: 6,
                Longitude: -2
              },
              {
                Latitude: 3,
                Longitude: 4
              },
              {
                Latitude: -1,
                Longitude: 4
              },
              {
                Latitude: -1,
                Longitude: -2
              }
            ]
          }
        }
      ]
    }

    renderMetadata(metadata)
    expect(screen.queryByText('Spatial Coverage:')).not.toBeInTheDocument()
  })

  test('does not render missing spatial', () => {
    const metadata = mockUmm()
    delete metadata.umm.SpatialExtent
    renderMetadata(metadata)
    expect(screen.queryByText('Spatial Coverage:')).not.toBeInTheDocument()
  })

  test('renders link to fullPath when provider is not in providersWithLandingPages', () => {
    const metadata = mockUmm()
    delete metadata.umm.DOI
    renderMetadata(metadata)
    expect(screen.queryByText('ab:cd.ef')).not.toBeInTheDocument()
    expect(screen.getByText('Fake Collection')).toHaveAttribute('href', '/collections/c100-fake')
  })

  test('renders link to fullPath when provider is in providersWithLandingPages', () => {
    mockedGetConfig.mockImplementation(
      (
        configName: string
      ) => providersWithLandingPages[configName as keyof typeof providersWithLandingPages]
    )

    const metadata = mockUmm()
    // Delete metadata.umm.DOI
    renderMetadata(metadata)
    expect(screen.getByText('Fake Collection')).toHaveAttribute('href', '/collections/c100-fake')
  })

  test('renders link to DOI when provider is not in providersWithLandingPages', () => {
    type Providers = {
      providersWithLandingPages: string[];
      [key: string]: string[] | string | number; // Allow other string keys with various value types
    };

    const providers: Providers = {
      providersWithLandingPages: ['ANOTHER_PROVIDER']
    }

    mockedGetConfig.mockImplementation((configName: keyof Providers) => providers[configName])

    const metadata = mockUmm()
    const { getByText } = renderMetadata(metadata)
    expect(getByText('Fake Collection')).toHaveAttribute('href', 'https://doi.org/ab:cd.ef')
  })

  test('renders link to the landing page RelatedUrl when no DOI and provider not in providersWithLandingPages', () => {
    type Providers = {
      providersWithLandingPages: string[]
    };

    const providers: Providers = {
      providersWithLandingPages: ['ANOTHER_PROVIDER']
    }

    mockedGetConfig.mockImplementation(
      (configName: string) => providers[configName as keyof Providers]
    )

    const metadata = mockUmm()
    delete metadata.umm.DOI
    const { getByText } = renderMetadata(metadata)
    expect(getByText('Fake Collection')).toHaveAttribute('href', 'https://example.com/landing/page')
    expect(getConfig).toHaveBeenCalledWith('providersWithLandingPages')
  })

  test('renders link to 404 when no other link is available', () => {
    type Providers = {
      providersWithLandingPages: string[];
      [key: string]: string[] | string | number
    }

    const providers: Providers = {
      providersWithLandingPages: ['ANOTHER_PROVIDER']
    }

    mockedGetConfig.mockImplementation(
      (configName: string) => providers[configName as keyof Providers]
    )

    const metadata = mockUmm()
    delete metadata.umm.DOI
    metadata.umm.RelatedUrls.pop()
    const { getByText } = renderMetadata(metadata)
    expect(getByText('Fake Collection')).toHaveAttribute('href', '/404')
    expect(getConfig).toHaveBeenCalledWith('providersWithLandingPages')
  })

  test('does not link to a DOI when the UMM-C decides to replace the DOI link with an entirely different object making it seem like it\'s there, but it\'s definitely not, grrrrrr', () => {
    mockedGetConfig.mockImplementation(
      (
        configName: string
      ) => providersWithLandingPages[configName as keyof typeof providersWithLandingPages]
    )

    const metadata = mockUmm()
    metadata.umm.DOI = { // Real-world example. ARGH. Just give me null.
      MissingReason: 'Unknown',
      Explanation: 'It is unknown if this record has a DOI.'
    }

    renderMetadata(metadata)
    expect(screen.queryByText('ab:cd.ef')).not.toBeInTheDocument()
    expect(screen.getByText('Fake Collection')).toHaveAttribute('href', '/collections/c100-fake')
  })

  test('sets the default DOI authority when the DOI authority is missing', () => {
    type Providers = {
      providersWithLandingPages: string[]
      [key: string]: string[] | string | number
    }

    const providers: Providers = {
      providersWithLandingPages: ['ANOTHER_PROVIDER']
    }

    mockedGetConfig.mockImplementation(
      (configName: string) => providers[configName as keyof Providers]
    )

    const metadata = mockUmm()
    metadata.umm.DOI = { DOI: 'ab:cd.ef' }
    renderMetadata(metadata)
    expect(screen.getByText('ab:cd.ef')).toHaveAttribute('href', 'https://doi.org/ab:cd.ef')
    expect(screen.getByText('Fake Collection')).toHaveAttribute('href', 'https://doi.org/ab:cd.ef')
  })

  test('fixes missing trailing slashes on DOI authorities', () => {
    type Providers = {
      providersWithLandingPages: string[]
      [key: string]: string[] | string | number
    }

    const providers: Providers = {
      providersWithLandingPages: ['ANOTHER_PROVIDER']
    }

    mockedGetConfig.mockImplementation(
      (configName: string) => providers[configName as keyof Providers]
    )

    // I'm not aware of any DOI authority other than the default, why do we allow this?!
    const metadata = mockUmm()
    metadata.umm.DOI = {
      DOI: 'ab:cd.ef',
      Authority: 'http://example.com'
    }

    renderMetadata(metadata)
    expect(screen.getByText('ab:cd.ef')).toHaveAttribute('href', 'http://example.com/ab:cd.ef')
    expect(screen.getByText('Fake Collection')).toHaveAttribute('href', 'http://example.com/ab:cd.ef')
  })

  test('does not render Archive Center information when no "ARCHIVER" role is provided', () => {
    const metadata = mockUmm()
    metadata.umm.DataCenters.pop()
    renderMetadata(metadata)

    expect(screen.queryByTitle('Archive Center')).not.toBeInTheDocument()
  })

  test('does not render Archive Center information when no DataCenters are provided', () => {
    const metadata = mockUmm()
    delete metadata.umm.DataCenters
    renderMetadata(metadata)

    expect(screen.queryByTitle('Archive Center')).not.toBeInTheDocument()
  })

  test('does not render File Format information when no FileDistributionInformation are provided', () => {
    const metadata = mockUmm()
    delete metadata.umm.ArchiveAndDistributionInformation.FileDistributionInformation
    renderMetadata(metadata)

    expect(screen.queryByTitle('File Format')).not.toBeInTheDocument()
  })

  test('does not render Project information when no Projects are provided', () => {
    const metadata = mockUmm()
    delete metadata.umm.Projects
    renderMetadata(metadata)

    expect(screen.queryByTitle('Project')).not.toBeInTheDocument()
  })

  test('does not render Related URLs', () => {
    const metadata = mockUmm()
    delete metadata.umm.RelatedUrls
    delete metadata.umm.DOI
    renderMetadata(metadata)

    // Without RelatedUrls and DOI, it should fall back to the collection detail page
    expect(screen.getByText('Fake Collection')).not.toHaveAttribute('href', '/collections/c100-fake')
  })
})
