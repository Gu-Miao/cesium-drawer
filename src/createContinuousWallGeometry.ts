import {
  Cartesian3,
  DeveloperError,
  Geometry,
  GeometryAttribute,
  PrimitiveType,
  BoundingSphere,
  ComponentDatatype,
  GeometryAttributes,
  Cartographic
} from 'cesium'
import { setHeight } from './toolkit'

interface ContinuousWallGeometryOptions {
  positions: Cartesian3[]
  minimumHeights?: number[]
  maximumHeights?: number[]
}

/**
 * Create wall geometry with st that calculated by distance between positions.
 * @param options Options to create a wall geometry.
 */
export function createContinuousWallGeometry(options?: ContinuousWallGeometryOptions) {
  const { positions, minimumHeights, maximumHeights } = options || {}

  if (!positions) {
    throw new DeveloperError('options.positions is required.')
  }
  if (maximumHeights && maximumHeights.length !== positions.length) {
    throw new DeveloperError(
      'options.positions and options.maximumHeights must have the same length.'
    )
  }
  if (minimumHeights && minimumHeights.length !== positions.length) {
    throw new DeveloperError(
      'options.positions and options.minimumHeights must have the same length.'
    )
  }

  const positionObjs = []
  let i = -1
  const { length } = positions
  while (++i < length) {
    const position = positions[i]
    const cartographic = Cartographic.fromCartesian(positions[i])
    const top = maximumHeights ? setHeight(position, maximumHeights[i]) : position
    cartographic.height = 0
    const noHeightPosition = Cartographic.toCartesian(cartographic)
    const bottom =
      minimumHeights && minimumHeights[i] !== 0
        ? setHeight(position, minimumHeights[i])
        : noHeightPosition

    positionObjs.push({ top, bottom, position: noHeightPosition })
  }

  const indices = []
  const distances = [0]
  const times = (positions.length - 1) * 2
  let perimeter = 0
  for (let i = 0; i < times; i++) {
    // Create indices
    if (i % 2) {
      indices.push(i + 2, i - 1, i + 1)
    } else {
      indices.push(i + 1, i, i + 3)
    }

    // Calculate perimeter
    if (positionObjs[i + 1]) {
      const distance = Cartesian3.distance(positionObjs[i].position, positionObjs[i + 1].position)
      distances.push(distance)
      perimeter += distance
    }
  }

  let percent = 0
  const st = []
  const wallPositions = []
  for (let i = 0; i < positions.length; i++) {
    // Build st
    percent += distances[i] / perimeter
    if (i === positions.length - 1) percent = 1
    st.push(percent, 0, percent, 1)

    // Build positions
    const { top, bottom } = positionObjs[i]
    wallPositions.push(bottom.x, bottom.y, bottom.z, top.x, top.y, top.z)
  }

  return new Geometry({
    attributes: {
      position: new GeometryAttribute({
        componentDatatype: ComponentDatatype.DOUBLE,
        componentsPerAttribute: 3,
        values: wallPositions
      }),
      st: new GeometryAttribute({
        componentDatatype: ComponentDatatype.FLOAT,
        componentsPerAttribute: 2,
        values: new Float64Array(st)
      })
    } as GeometryAttributes,
    indices: new Uint16Array(indices),
    primitiveType: PrimitiveType.TRIANGLES,
    boundingSphere: BoundingSphere.fromVertices(wallPositions)
  })
}
