//==========================================================================
//
//  Definition
//
//==========================================================================

interface ElementSpaceInfo {
  left: number
  right: number
  top: number
  bottom: number
  h: number
  v: number
}

const EmptyElementSpaceInfo = () => {
  return {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    h: 0,
    v: 0,
  }
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

/**
 * Gets the margin information for the specified style.
 */
function getElementMargin(style: CSSStyleDeclaration): ElementSpaceInfo

/**
 * Gets the margin information for the specified element.
 */
function getElementMargin(element: Element): ElementSpaceInfo

function getElementMargin(elementOrStyle: Element | CSSStyleDeclaration): ElementSpaceInfo {
  const result = EmptyElementSpaceInfo()

  if (!elementOrStyle) return result

  let style: CSSStyleDeclaration
  if (elementOrStyle instanceof Element) {
    style = getComputedStyle(elementOrStyle)
  } else {
    style = elementOrStyle as CSSStyleDeclaration
  }

  result.left = toFloat(style.getPropertyValue('margin-left'))
  result.right = toFloat(style.getPropertyValue('margin-right'))
  result.top = toFloat(style.getPropertyValue('margin-top'))
  result.bottom = toFloat(style.getPropertyValue('margin-bottom'))
  result.h = result.left + result.right
  result.v = result.top + result.bottom

  return result
}

/**
 * Gets the BorderBox information of the specified style.
 */
function getElementBorderBox(style: CSSStyleDeclaration): ElementSpaceInfo

/**
 * Gets the BorderBox information of the specified style.
 */
function getElementBorderBox(element: Element): ElementSpaceInfo

function getElementBorderBox(elementOrStyle: Element | CSSStyleDeclaration): ElementSpaceInfo {
  const result = EmptyElementSpaceInfo()

  if (!elementOrStyle) return result

  let style: CSSStyleDeclaration
  if (elementOrStyle instanceof Element) {
    style = getComputedStyle(elementOrStyle)
  } else {
    style = elementOrStyle as CSSStyleDeclaration
  }

  result.left =
    toFloat(style.getPropertyValue('border-left-width')) +
    toFloat(style.getPropertyValue('padding-left'))
  result.right =
    toFloat(style.getPropertyValue('border-right-width')) +
    toFloat(style.getPropertyValue('padding-right'))
  result.top =
    toFloat(style.getPropertyValue('border-top-width')) +
    toFloat(style.getPropertyValue('padding-top'))
  result.bottom =
    toFloat(style.getPropertyValue('border-bottom-width')) +
    toFloat(style.getPropertyValue('padding-bottom'))
  result.h = result.left + result.right
  result.v = result.top + result.bottom

  return result
}

/**
 * Converts a string to a floating-point number.
 * @param value
 */
function toFloat(value?: string): number {
  const result = parseFloat(value || '0')
  return isNaN(result) ? 0 : result
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { getElementMargin, getElementBorderBox }
