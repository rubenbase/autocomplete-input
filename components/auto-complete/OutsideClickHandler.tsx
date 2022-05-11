import React, { useRef, useEffect, useCallback, ReactNode, HTMLAttributes } from 'react'

interface OutsideClickHandlerProps extends HTMLAttributes<HTMLDivElement> {
  onOutsideClick: () => void
  children: ReactNode // in React 18+ declaring children here is the recommended instead of using FC
}

const OutsideClickHandler = ({
  onOutsideClick,
  children,
  ...rest
}: OutsideClickHandlerProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = useCallback(
    (event: globalThis.MouseEvent) => {
      if (wrapperRef?.current && !wrapperRef.current.contains(event.target as Node)) {
        onOutsideClick()
      }
    },
    [onOutsideClick]
  )

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleClickOutside])

  return (
    <div {...rest} ref={wrapperRef}>
      {children}
    </div>
  )
}

export default OutsideClickHandler
