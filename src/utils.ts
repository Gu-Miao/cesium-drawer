import { Cartographic, Matrix4, Transforms, Cartesian3 } from 'cesium'

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

/**
 * Add height to a cartesian coordinate
 * @param position Cartesian position
 * @param height Height to add
 */
export function setHeight(position: Cartesian3, height = 0) {
  const cartographic = Cartographic.fromCartesian(position)
  cartographic.height = height
  return Cartographic.toCartesian(cartographic)
}

/**
 * Get local positions with east-north-up coordinate system.
 * @param origin Origin point position.
 * @param cartesians Other positions.
 */
export function getEastNorthUpPositions(
  origin: Cartesian3,
  ...cartesians: Cartesian3[]
): [Cartesian3[], Matrix4, Matrix4] {
  const localToWorldMatrix = Transforms.eastNorthUpToFixedFrame(origin)
  const worldToLocalMatrix = Matrix4.inverse(localToWorldMatrix, new Matrix4())

  const positions: Cartesian3[] = [
    Matrix4.multiplyByPoint(worldToLocalMatrix, origin, new Cartesian3())
  ]
  let i = 0
  const { length } = cartesians
  while (i < length) {
    positions.push(Matrix4.multiplyByPoint(worldToLocalMatrix, cartesians[i], new Cartesian3()))
    i++
  }

  return [positions, localToWorldMatrix, worldToLocalMatrix]
}
