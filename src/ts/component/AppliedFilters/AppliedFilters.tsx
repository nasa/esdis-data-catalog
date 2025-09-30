import React, { useEffect, useState } from 'react'

import { useFormikContext } from 'formik'

import { Button } from 'react-bootstrap'

import { omit } from 'lodash-es'

import { Facet } from '../../../types/global'
import { getValidSortkey } from '../../utils/getValidSortkey'

import getAppliedFacets from '../../utils/getAppliedFacets'

import './AppliedFilters.scss'

interface AppliedFilter {
  applied: boolean;
  count: number;
  hasChildren: boolean;
  type: string;
  title: string;
  children?: Facet[];
  links?: {
    apply?: string;
    remove?: string | (() => void);
  };
}

interface AppliedFiltersProps {
  facets: Facet;
  filterValues: {
    bounding_box?: string
    data_center_h?: string[]
    keyword?: string
    page_num?: number
    page_size?: number
    processing_level_id_h?: string[]
    latency?: string[]
    science_keywords_h?: string[]
    sort_key?: string
    temporal?: string[] | string
  };
  isLoading: boolean;
  setQueryString: (_value: string) => void;
}

const temporalToTitle = (temporal: string[] | string) => {
  if (!temporal || !temporal.length) return null
  const [start, end] = temporal
  if (!start && !end) return null
  if (start === end) return start
  if (!end) return `${start} to Present`
  if (!start) return `Up to ${end}`

  return `${start} to ${end}`
}

export const AppliedFilters: React.FC<AppliedFiltersProps> = ({
  facets,
  filterValues,
  isLoading,
  setQueryString
}) => {
  const { temporal, bounding_box: boundingBox, sort_key: sortKey } = filterValues
  const formik = useFormikContext()
  const [applied, setApplied] = useState<AppliedFilter[]>([])

  // This is fairly ugly how this has to work. Filter state of temporal / spatial
  // is managed by Formik and clears instantly. Filter state of facets is managed
  // by CMR facet results and updates when CMR results return. When clicking "Clear
  // all", we want the whole list to disappear at once. This effect synchronizes the
  // two clear rates, so the "Clear all" button becomes disabled and then everything
  // goes away all at once when the CMR returns
  useEffect(() => {
    if (isLoading || formik.dirty) return

    const nextApplied = getAppliedFacets(facets) as AppliedFilter[]

    if (temporal) {
      const title = temporalToTitle(temporal)

      if (title) {
        nextApplied.push({
          title,
          links: {
            remove: () => {
              formik.setFieldValue('temporal', null)
              formik.setFieldValue('page_num', null)
            }
          },
          applied: false,
          count: 0,
          hasChildren: false,
          type: ''
        })
      }
    }

    if (boundingBox) {
      nextApplied.push({
        title: boundingBox,
        links: {
          remove: () => {
            formik.setFieldValue('bounding_box', null)
            formik.setFieldValue('page_num', null)
          }
        },
        applied: false,
        count: 0,
        hasChildren: false,
        type: ''
      })
    }

    if (sortKey) {
      const validSortKey = getValidSortkey(sortKey)
      // Remove invalid sort keys to fallback to the default sort key
      if (!validSortKey) {
        formik.setFieldValue('sort_key', null)
      }
    }

    setApplied(nextApplied)
  }, [facets, temporal, boundingBox, isLoading, formik.dirty])

  const remove = (action: string | (() => void)) => {
    if (typeof action === 'string') {
      const [, queryString] = action.split('?')
      setQueryString(queryString)
    } else if (typeof action === 'function') {
      action()
    }
  }

  const clearAll = () => {
    // Long-term, it probably makes more sense to use `_.pick`, but right now the
    // list of things that shouldn't be filtered (page size, page num, sort order)
    // is growing faster than those that should
    formik.setValues(omit(filterValues, [
      'temporal',
      'bounding_box',
      'data_center_h',
      'science_keywords_h',
      'platforms_h',
      'horizontal_data_resolution_range',
      'granule_data_format_h',
      'latency',
      'processing_level_id_h',
      'page_num'
    ]))

    // This, combined with the effect above keeps the list stable until the query finishes
    setApplied(applied)
  }

  return (
    <ul className="hzn-applied-filters">
      {
        applied.map(({ title, links }) => (
          <li className="hzn-applied-filters__item" key={title}>
            <Button className="hzn-applied-filters__remove" onClick={() => (links?.remove ? remove(links.remove) : null)}>{title}</Button>
          </li>
        ))
      }
      <li hidden={applied.length === 0}>
        <Button
          onClick={clearAll}
          className="hzn-applied-filters__clear"
          disabled={isLoading}
          variant="link"
        >
          Clear all
        </Button>
      </li>
    </ul>
  )
}

export default AppliedFilters
