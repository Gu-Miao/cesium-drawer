import { Cartographic } from 'cesium'
import type { Cartesian3 } from 'cesium'

/**
 * Remove a item in array searching from behind
 * @param array Array
 * @param item Item in array
 * @returns Array without item
 */
export function removeArrayItemFromBehind(array: any[], item: any) {
  const { length } = array
  let i = length - 1
  while (i >= 0) {
    if (array[i] === item) break
    i--
  }
  if (array[i] === item) {
    array.splice(i, 1)
  }

  return array
}

/**
 * Add height to a cartesian coordinate
 * @param position Cartesian position
 * @param height Height to add
 */
export function addHeight(position: Cartesian3, height = 0) {
  const cartographic = Cartographic.fromCartesian(position)
  cartographic.height += height
  return Cartographic.toCartesian(cartographic)
}
