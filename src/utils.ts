import {
  Cartographic,
  Matrix4,
  Transforms,
  Cartesian3,
  DeveloperError,
  Math as CesiumMath
} from 'cesium'

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

/**
 * Get regular polygon positions.
 * @param center Position of center.
 * @param radius Radius of polygon.
 * @param sides Number of sides, must be greater than 3.
 * @returns
 */
export function getRegularPolygonPositions(center: Cartesian3, radius: number, sides: number) {
  if (sides < 3) {
    throw new DeveloperError('radius must be greater than 3')
  }

  const [[localCenter], localToWorldMatrix] = getEastNorthUpPositions(center)

  const split = 360 / sides
  const positions = []
  let i = 0

  while (i <= sides) {
    const radian = CesiumMath.toRadians(split * i)
    const pointPosition = localCenter.clone()
    pointPosition.x += Math.cos(radian) * radius
    pointPosition.y += Math.sin(radian) * radius
    positions.push(Matrix4.multiplyByPoint(localToWorldMatrix, pointPosition, new Cartesian3()))
    i++
  }

  return positions
}

/**
 * Get heading degree.
 * @param p1 The first position.
 * @param p2 Another position.
 * @returns Heading degree.
 */
export function getHeadingDegree(p1: Cartesian3, p2: Cartesian3) {
  const { x: x1, y: y1 } = p1
  const { x: x2, y: y2 } = p2

  const dividend = x2 - x1
  const divisor = y2 - y1

  // If x2=x1, alpha could only be 0 or 180.
  if (dividend === 0) {
    return divisor >= 0 ? 0 : 180
  }

  // If y2=y1, alpha could only be 90 or -90.
  if (divisor === 0) {
    // There is no equal judgement due to it already be done above.
    return dividend > 0 ? 90 : -90
  }

  // Calculate the alpha angle.
  const tanAlpha = (x2 - x1) / (y2 - y1)
  const alpha = (Math.atan(tanAlpha) / Math.PI) * 180

  if (divisor > 0) {
    return alpha
  } else {
    // If y2-y1<0, alpha is just the supplement of real angle.
    const multiplier = x2 - x1 > 0 ? 1 : -1
    const realAlpha = (180 - Math.abs(alpha)) * multiplier
    return realAlpha
  }
}

/**
 * Get pitch degree.
 * @param p1 The first position.
 * @param p2 Another position.
 * @returns Pitch degree.
 */
export function getPitchDegree(p1: Cartesian3, p2: Cartesian3) {
  const { x: x1, y: y1, z: z1 } = p1
  const { x: x2, y: y2, z: z2 } = p2

  const xDiff = x2 - x1
  const yDiff = y2 - y1
  const zDiff = z2 - z1

  // The new position is laid on x-y surface, so there
  // is no pitch.
  if (zDiff === 0) {
    return 0
  }

  // The new position is laid on z-axis, so if z2-z1>0,
  // 90; if z2-z1<0, -90.
  if (xDiff === 0 && yDiff === 0) {
    return zDiff > 0 ? 90 : -90
  }

  const distance = Cartesian3.distance(p1, p2)

  // tanθ=distance from new position to sub point / distance from
  // sub point to previous position.
  const sinTheta = (z2 - z1) / distance
  const theta = (Math.abs(Math.asin(sinTheta)) / Math.PI) * 180

  // Pitch's plus or minus is according to z2-z1, if z2-z1>0, positive
  // otherwise negative.
  return zDiff > 0 ? theta : -theta
}
