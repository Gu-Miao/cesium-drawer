import { addHeight } from '../utils'
import { Cartesian3, Cartographic } from 'cesium'

test('addHeight()', () => {
  const position = Cartesian3.fromDegrees(120, 36, 1000)
  const position1 = addHeight(position, 1000)
  const { height: height1 } = Cartographic.fromCartesian(position1)
  expect(Math.round(height1)).toEqual(2000)

  const position2 = addHeight(position)
  const { height: height2 } = Cartographic.fromCartesian(position2)
  expect(Math.round(height2)).toEqual(1000)
})
