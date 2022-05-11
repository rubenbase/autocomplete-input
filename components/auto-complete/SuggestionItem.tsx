import React from 'react'
import { SuggestionItemProps } from './types'

function SuggestionItem<T extends unknown>({
  id,
  item,
  onSelect,
  isActive,
}: SuggestionItemProps<T>) {
  const handleClick = () => onSelect(item)

  return (
    <li
      id={id}
      onClick={handleClick}
      role="option"
      tabIndex={0}
      aria-selected={isActive ? 'true' : 'false'}
      className={`p-2 w-full cursor-pointer ${isActive ? 'bg-white' : ''}`}
    >
      {item}
    </li>
  )
}

export default SuggestionItem
