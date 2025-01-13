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
  console.log('🚀 ~ file: FacetChecklistItem.tsx:19 ~ param:', param)
  const { title, count, applied } = facet

  const onChangeHandler = () => {
    console.log('🚀 ~ file: FacetChecklistItem.tsx:25 ~ facet:', facet)
    console.log('🚀 ~ file: FacetChecklistItem.tsx:21 ~ title:', title)
    onChange(facet, !applied)
  }

  const id = `${param}=${title}`

  console.log('🚀 ~ file: FacetChecklistItem.tsx:30 ~ id:', id)

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
