import { ReactNode } from 'react'

export interface AutoCompleteProps<T> {
  id: string
  show: boolean
  defaultValue?: string
  queryEndpoint?: string
  queryFilter?: string
  placeholder?: string
  dropdownArrowIcon?: ReactNode
  closeIcon?: ReactNode
  onSelect: (item: any) => void
  onClose: () => void
  onOpen: () => void
  itemToString: (item: T) => string
}

export interface SuggestionListProps<T> {
  items: T[]
  id: string
  activeItem: number
  onSelect: (item: string) => void
  itemToString: (item: T) => string
}

export interface SuggestionItemProps<T> {
  id: string
  item: string
  onSelect: (item: string) => void
  isActive: boolean
}
