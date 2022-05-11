/**
 * Returns the next index in the list of an item that is not disabled.
 * @param {number} moveAmount Number of positions to move. Negative to move backwards, positive forwards.
 * @param {number} baseIndex The initial position to move from.
 * @param {number} itemCount The total number of items.
 * @param {Function} getItemNodeFromIndex Checks if item is disabled.
 * @returns {number} The new index.
 */

export const getNextNonDisabledIndex = (
  moveAmount: number,
  baseIndex: number,
  itemCount: number,
  getItemNodeFromIndex: (i: number) => Element
) => {
  const currentElementNode = getItemNodeFromIndex(baseIndex)
  if (!currentElementNode || !currentElementNode.hasAttribute('disabled')) {
    return baseIndex
  }

  if (moveAmount > 0) {
    for (let index = baseIndex + 1; index < itemCount; index++) {
      if (!getItemNodeFromIndex(index).hasAttribute('disabled')) {
        return index
      }
    }
  } else {
    for (let index = baseIndex - 1; index >= 0; index--) {
      if (!getItemNodeFromIndex(index).hasAttribute('disabled')) {
        return index
      }
    }
  }

  return -1
}
