import React, { useRef, useEffect, useCallback } from 'react'

const OutsideClickHandler = ({ onOutsideClick, children, ...rest }) => {
  const wrapperRef = useRef(null)

  const handleClickOutside = useCallback(
    (event) => {
      if (wrapperRef?.current && !wrapperRef.current.contains(event.target)) {
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
