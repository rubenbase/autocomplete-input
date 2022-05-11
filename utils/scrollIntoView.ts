/**
 * Scrolls a child element into the parent's view
 * @param parent
 * @param child
 */
export const scrollIntoView = (parent: Element, child: Element) => {
  const parentBounding = parent.getBoundingClientRect(),
    clientBounding = child.getBoundingClientRect()

  const parentBottom = parentBounding.bottom,
    parentTop = parentBounding.top,
    clientBottom = clientBounding.bottom,
    clientTop = clientBounding.top

  if (parentTop >= clientTop) {
    scrollTo(parent, -(parentTop - clientTop), 300)
  } else if (clientBottom > parentBottom) {
    scrollTo(parent, clientBottom - parentBottom, 300)
  }
}
function scrollTo(element: Element, to: number, duration: number) {
  let start = element.scrollTop,
    currentTime = 0,
    increment = 20

  let animateScroll = function () {
    currentTime += increment

    let val = easeInOutQuad(currentTime, start, to, duration)
    element.scrollTop = val

    if (currentTime < duration) {
      setTimeout(animateScroll, increment)
    }
  }

  animateScroll()
}
// Function for smooth scroll animation with the time duration
function easeInOutQuad(time: number, startPos: number, endPos: number, duration: number) {
  time /= duration / 2

  if (time < 1) return (endPos / 2) * time * time + startPos
  time--
  return (-endPos / 2) * (time * (time - 2) - 1) + startPos
}
