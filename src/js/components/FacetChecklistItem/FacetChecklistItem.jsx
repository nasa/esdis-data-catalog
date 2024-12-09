import React from 'react'
import PropTypes from 'prop-types'

const noop = (e) => e

export const FacetChecklistItem = ({
  facet,
  humanize,
  onChange,
  param
}) => {
  const { title, count, applied } = facet

  const onChangeHandler = () => {
    onChange(facet, !applied)
  }

  const id = `${param}=${title}`

  return (
    <li className="hzn-checklist-item">
      <input id={id} type="checkbox" name={param} value={title} checked={applied} onChange={onChangeHandler} />
      <label htmlFor={id}>
        {`${humanize(title)} (${count})`}
      </label>
    </li>
  )
}

FacetChecklistItem.propTypes = {
  facet: PropTypes.shape(
    {
      applied: PropTypes.bool,
      count: PropTypes.number,
      hasChildren: PropTypes.bool,
      links: PropTypes.shape({ apply: PropTypes.string }),
      title: PropTypes.string,
      type: PropTypes.string
    }
  ).isRequired,
  humanize: PropTypes.func,
  onChange: PropTypes.func.isRequired,
  param: PropTypes.string.isRequired
}

FacetChecklistItem.defaultProps = {
  humanize: noop
}

export default FacetChecklistItem
