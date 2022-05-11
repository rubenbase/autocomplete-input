import React from 'react'
import SuggestionItem from './SuggestionItem'
import { SuggestionListProps } from './types'

function SuggestionList<T extends unknown>({
  id: customId,
  items,
  onSelect,
  itemToString,
  activeItem,
}: SuggestionListProps<T>) {
  return (
    <ul
      id={`${customId}-listbox`}
      role="listbox"
      aria-label="Location suggestion panel"
      tabIndex={-1}
    >
      {items.length > 0 &&
        items.map((item, i) => {
          const id = `${customId}-item-${i}`
          const active = i === activeItem
          const itemStr = itemToString(item)

          return (
            <SuggestionItem
              onSelect={onSelect}
              id={id}
              key={`${id}-${itemStr}`}
              item={itemStr}
              isActive={active}
            />
          )
        })}
    </ul>
  )
}

export default SuggestionList
