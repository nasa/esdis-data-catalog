import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Button from 'react-bootstrap/Button'
import { useFormikContext } from 'formik'
import { omit } from 'lodash-es'
import { getAppliedFacets } from '../../utils/getAppliedFacets'

import './AppliedFilters.scss'

const temporalToTitle = ([start, end]) => {
  if (!start && !end) return null
  if (start === end) return start
  if (!end) return `${start} ongoing`
  if (!start) return `Up to ${end}`

  return `${start} to ${end}`
}

export const AppliedFilters = ({
  facets,
  filterValues,
  isLoading,
  setQueryString
}) => {
  const { temporal, bounding_box: boundingBox } = filterValues

  const formik = useFormikContext()
  const [applied, setApplied] = useState([])

  // This is fairly ugly how this has to work. Filter state of temporal / spatial
  // is managed by Formik and clears instantly. Filter state of facets is managed
  // by CMR facet results and updates when CMR results return. When clicking "Clear
  // all", we want the whole list to disappear at once. This effect synchronizes the
  // two clear rates, so the "Clear all" button becomes disabled and then everything
  // goes away all at once when the CMR returns
  useEffect(() => {
    if (isLoading || formik.dirty) return

    const nextApplied = getAppliedFacets(facets)

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
          }
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
        }
      })
    }

    setApplied(nextApplied)
  }, [facets, temporal, boundingBox, isLoading, formik.dirty])

  const remove = (action) => {
    if (action && typeof action === 'string') {
      // Action is a URL
      const searchParam = action.replace(/(page_num=)\d+/, '$11')
      setQueryString(searchParam.split('?')[1])
    } else {
      // Action is a function
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
      'science_keywords_h',
      'platforms_h',
      'horizontal_data_resolution_range',
      'granule_data_format_h',
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
            <Button className="hzn-applied-filters__remove" onClick={() => remove(links.remove)}>{title}</Button>
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

AppliedFilters.propTypes = {
  facets: PropTypes.shape(
    {}
  ).isRequired,
  filterValues: PropTypes.shape({
    bounding_box: PropTypes.string,
    temporal: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  isLoading: PropTypes.bool.isRequired,
  setQueryString: PropTypes.func.isRequired
}

export default AppliedFilters
