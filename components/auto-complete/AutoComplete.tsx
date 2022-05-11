import React, {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { MdOutlineKeyboardArrowDown } from 'react-icons/md'
import { MdClose } from 'react-icons/md'
import { keys } from '../../utils/keys'
import { scrollIntoView } from '../../utils/scrollIntoView'
import OutsideClickHandler from './OutsideClickHandler'
import SuggestionList from './SuggestionList'
import styles from './AutoComplete.module.css'
import { AutoCompleteProps } from './types'
import { Error } from '../../types/error'

const DEFAULT_DEBOUNCE_TIMEOUT_MS = 250

function AutoComplete<T extends unknown>({
  id,
  show,
  queryEndpoint,
  queryFilter,
  placeholder,
  defaultValue,
  dropdownArrowIcon = <MdOutlineKeyboardArrowDown />,
  closeIcon = <MdClose />,
  onClose,
  onSelect,
  onOpen,
  itemToString,
}: AutoCompleteProps<T>) {
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [suggestion, setSuggestion] = useState<T[]>([])
  const [selectedOption, setSelectedOption] = useState(-1)
  const queryCacheRef = useRef<Record<string, T[]>>({})
  const autoCompleteRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const resetStateBeforeClose = () => {
    setSelectedOption(-1)
  }

  const setText = (text: string) => {
    if (autoCompleteRef?.current) autoCompleteRef.current.value = text
    setSearch(text)
  }

  const handleSelect = (item: string) => {
    setText(item)
    onSelect(item)
    handleClose()
  }

  /**
   * Clean up the timer in case is still running when unmounting
   */
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [])

  /**
   * Gets the suggestion list node
   */
  const getSuggestionListNode = useCallback(() => {
    const SUGGESTION_LIST_ID = `#${id}-listbox`
    return document.querySelector(SUGGESTION_LIST_ID)
  }, [id])

  /**
   * Gets the suggestion item node
   */
  const getSuggestionItemNodeByIdx = useCallback(
    (index: number) => {
      const SUGGESTION_ITEM_ID = `#${id}-item`
      console.log('preee', `${SUGGESTION_ITEM_ID}-${index}`)

      return document.querySelector(`${SUGGESTION_ITEM_ID}-${index}`)
    },
    [id]
  )

  /**
   * Scrolls to the selected suggestion panel item
   */
  const triggerScrollByIdx = useCallback(
    (index: number) => {
      const parentNode = getSuggestionListNode()
      const suggestionItemNode = getSuggestionItemNodeByIdx(index)
      console.log('parentNode && suggestionItemNode', parentNode, suggestionItemNode)

      if (parentNode && suggestionItemNode) scrollIntoView(parentNode, suggestionItemNode)
    },
    [getSuggestionListNode, getSuggestionItemNodeByIdx]
  )

  /**
   * Runs when the suggestion panel is closed
   */
  const handleClose = useCallback(() => {
    resetStateBeforeClose()
    onClose()
  }, [onClose])

  /**
   * When the user passes a queryEndpoint and optionally a
   * queryFilter then we use them to fetch and sync cache.
   */
  const fetchQuery = useCallback(async (url: string) => {
    // Reads from cache to avoid calling the api for the same requests over and over
    if (queryCacheRef?.current?.[url]) {
      const data = queryCacheRef.current[url]
      setSuggestion(data)
      return
    }

    try {
      const res = await fetch(url)
      const data = await res.json()

      if (!data?.results) {
        // Should this have always results from backend? Then handle this as an error
        // If backend can give us null results then we can default to empty results
        setSuggestion([])
        return
      }

      // Return and set the results both in the state and the cache
      setSuggestion(data.results)
      queryCacheRef.current[url] = data.results
      return data.results as T[]
    } catch (err: unknown) {
      const error = err as Error
      if (error.response && error.response.status === 404) {
        setSuggestion([])
        // We could handle the error in different ways, fire a sentry event, toast... we could
        // pass an error callback via props to fire it...
        // I'm just going to show an error text under the field as default.
        setError('Something went wrong.')
      }
    }
  }, [])

  /**
   * When the user passes a queryEndpoint and optionally a
   * queryFilter it generates an endpoint url to be used.
   */
  const generateUrl = useCallback(
    (query?: string): string | undefined => {
      if (!queryEndpoint) return
      let url = queryEndpoint
      if (queryFilter && query) url += `${queryFilter}${query}`
      return url
    },
    [queryEndpoint, queryFilter]
  )

  /**
   * Runs when the ArrowIcon button (chevron) is clicked
   */
  const handleDropdownArrowButtonClick = useCallback(() => {
    // Close if we click on it when the suggestion panel is open
    if (show) {
      handleClose()
      return
    }

    // When we click on it without having typed anything we fetch queryEndpoint without a filter
    // this can be configurable with flags if business doesn't want that but IMO doing this it's nice UX.
    if (!search && !show && queryEndpoint) {
      autoCompleteRef.current?.focus()
      fetchQuery(queryEndpoint)
      onOpen()
    }
  }, [fetchQuery, show, search, queryEndpoint, onOpen, handleClose])

  /**
   * Runs when the CloseIcon button is clicked
   * Clears the input search and dependant state
   */
  const handleCloseButtonClick = useCallback(() => {
    setText('')
    onSelect('')
    setSuggestion([])
    handleClose()
  }, [handleClose, onSelect])

  /**
   * Runs when the CloseIcon button is clicked
   * Basically does a reset so the user don't have to keep pressing the delete button multiple times.
   */
  const handleOutsideClick = useCallback(() => {
    if (show) {
      setText('')
      handleClose()
    }
  }, [show, handleClose])

  /**
   * Runs on input changes.
   */
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const query = event.target.value
      setSearch(query)

      // Close the suggestion panel when the input value is empty.
      if (!query) {
        handleClose()
        return
      }

      // Open the suggestion panel when the user starts typing.
      if (!show) onOpen()

      // If we fetch internally then we need to create the url based on the props
      const url = generateUrl(query)
      if (!url) return

      //   Return the cache if any to avoid fetching
      if (queryCacheRef?.current?.[url]) {
        const data = queryCacheRef.current[url]
        setSuggestion(data)
        return
      }

      // Debounce the fetch
      if (searchTimeoutRef?.current) clearTimeout(searchTimeoutRef.current)
      searchTimeoutRef.current = setTimeout(
        () => fetchQuery(url),
        DEFAULT_DEBOUNCE_TIMEOUT_MS
      )
    },
    [show, onOpen, handleClose, fetchQuery, generateUrl]
  )

  /**
   * Runs when the ArrowDown key is pressed.
   * Searched and preselects the first item on the suggestion panel.
   */
  const handleArrowDownKeyPressed = useCallback(async () => {
    let result: T[] | undefined

    // The first time we press the ArrowDown key we only want to fetch the results
    // and open the suggestion panel as by default the selectedOption is 0 already
    if (!show) {
      const url = generateUrl(search)
      if (!url) return

      result = await fetchQuery(url)
      onOpen()
      return
    }

    // We get the last option index from results if any or from suggestion options
    const lastOptionIdx = result ? result?.length - 1 : suggestion?.length - 1

    // Update the selected option for accessibility and scroll to it.
    setSelectedOption((selectedOption) => {
      const nextSelectedIdx =
        selectedOption === lastOptionIdx ? lastOptionIdx : selectedOption + 1
      triggerScrollByIdx(nextSelectedIdx)
      return nextSelectedIdx
    })
  }, [
    fetchQuery,
    generateUrl,
    onOpen,
    search,
    show,
    suggestion?.length,
    triggerScrollByIdx,
  ])

  /**
   * Runs when the ArrowUp key is pressed.
   * Searched and preselects the first item on the suggestion panel.
   */
  const handleArrowUpKeyPressed = useCallback(() => {
    if (!show) return
    setSelectedOption((selectedOption) => {
      if (selectedOption === -1) return -1
      const nextSelectedIdx = selectedOption == 0 ? 0 : selectedOption - 1
      triggerScrollByIdx(nextSelectedIdx)
      return nextSelectedIdx
    })
  }, [show, triggerScrollByIdx])

  /**
   * Runs on keyUp to call handleChange when the user
   * types and selects the 1st item on every change.
   */
  const handleKeyUp = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.keyCode) {
        // ignore this keys otherwise the menu will show
        case keys.esc:
        case keys.left:
        case keys.up:
        case keys.down:
        case keys.right:
        case keys.space:
        case keys.enter:
        case keys.tab:
        case keys.shift:
          break

        // handle the input change and select then 1st item on change.
        default:
          handleChange(e as unknown as ChangeEvent<HTMLInputElement>)
          const nextSelectedIdx = 0
          setSelectedOption(nextSelectedIdx)
          triggerScrollByIdx(nextSelectedIdx)
      }
    },
    [handleChange, triggerScrollByIdx]
  )

  /**
   * Runs on keyDown to control the logic of selecting an item
   * and moving up and down the list with the keyboard.
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.keyCode) {
        // Triggers the external onSelect the item and closes the suggestion panel
        case keys.enter:
          e.preventDefault()
          const itemSelected = suggestion?.find((_, idx) => idx === selectedOption)
          if (!itemSelected) return
          const itemStr = itemToString(itemSelected)
          setText(itemStr)
          onSelect(itemStr)
          handleClose()
          break

        // handles going up in the suggestion panel
        case keys.up:
          handleArrowUpKeyPressed()
          break

        // handles going down in the suggestion panel
        case keys.down:
          handleArrowDownKeyPressed()
          break

        case keys.tab:
          handleClose()
          break
      }
    },
    [
      handleArrowDownKeyPressed,
      handleArrowUpKeyPressed,
      handleClose,
      itemToString,
      onSelect,
      selectedOption,
      suggestion,
    ]
  )

  // Dynamic Styles
  const paddingRightStyle = dropdownArrowIcon ? 'pl-2 pr-8' : 'px-2'
  const chevronStyle = show ? 'rotate-180' : ''

  return (
    <>
      <OutsideClickHandler
        className={styles.autocomplete}
        onOutsideClick={handleOutsideClick}
      >
        <input
          ref={autoCompleteRef}
          id={id}
          name={id}
          type="text"
          role="combobox"
          onKeyUp={handleKeyUp}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoCapitalize="none"
          placeholder={placeholder}
          defaultValue={defaultValue}
          className={`py-2 border focus:ring-[#15357a] focus:border-[#15357a] block w-full sm:text-sm border-gray-300 ${paddingRightStyle}`}
          tabIndex={1}
          aria-controls={`${id}-listbox`}
          aria-autocomplete="list"
          aria-expanded="true"
          aria-describedby={id}
        />
        {dropdownArrowIcon && !search && (
          <button
            onClick={handleDropdownArrowButtonClick}
            type="button"
            tabIndex={-1}
            className={`absolute top-0 right-0 bottom-0 py-auto px-2 ${chevronStyle}`}
            aria-label={`open ${id} suggestion panel`}
            aria-expanded="false"
            aria-controls={`${id}-listbox`}
          >
            {dropdownArrowIcon}
          </button>
        )}
        {closeIcon && search && (
          <button
            onClick={handleCloseButtonClick}
            type="button"
            tabIndex={1}
            className="absolute top-0 right-0 bottom-0 py-auto px-2"
            aria-label={`${id} clear button`}
            aria-expanded="false"
          >
            {closeIcon}
          </button>
        )}

        {/* Suggestion */}
        {show && suggestion.length > 0 && (
          <SuggestionList<T>
            id={id}
            activeItem={selectedOption}
            items={suggestion}
            onSelect={handleSelect}
            itemToString={itemToString}
          />
        )}
      </OutsideClickHandler>
      {show && suggestion.length === 0 && (
        <span className="text-sm">No results were found</span>
      )}
      {/* We could use this section to show errors like: */}
      {/* {error && <span className="text-sm text-red-500">{error}</span>} */}
    </>
  )
}

export default AutoComplete
