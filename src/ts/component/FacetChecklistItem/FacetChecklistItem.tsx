import React from 'react'
import { Facet } from '../../../types/global'

const noop = (e: string): string => e

interface FacetChecklistItemProps {
  facet: Facet;
  humanize?: (value: string) => string;
  onChange: (facet: Facet, isChecked: boolean) => void;
  param: string;
}

export const FacetChecklistItem: React.FC<FacetChecklistItemProps> = ({
  facet,
  humanize = noop,
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
      <input
        id={id}
        type="checkbox"
        name={param}
        value={title}
        checked={applied}
        onChange={onChangeHandler}
      />
      <label htmlFor={id}>
        {`${humanize(title)} (${count})`}
      </label>
    </li>
  )
}

export default FacetChecklistItem
