import {
  Viewer,
  defined,
  DeveloperError,
  JulianDate,
  sampleTerrainMostDetailed,
  Cartographic,
  Math as CesiumMath,
  //@ts-ignore
  VERSION
} from 'cesium'
import { Drawer } from './Drawer'

type onSampleSucceeded = (err: null, result: Cartographic[]) => any
type onSampleFailed = (err: null) => any

type Options = {
  onSample?: onSampleSucceeded & onSampleFailed
}

export function terrainSamplerMixin(viewer: Viewer, options: Options = {}) {
  if (!defined(viewer)) {
    throw new DeveloperError('viewer is required.')
  }

  const { onSample } = options
  const catchName = parseFloat(VERSION) >= 1.92 ? 'catch' : 'otherwise'

  const drawer = new Drawer({
    viewer,
    dataSourceName: 'sampleMixinDataSource'
  })

  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.top = '10px'
  container.style.left = '10px'
  container.style.padding = '4px 6px'
  viewer.container.append(container)

  const element = document.createElement('div')
  element.classList.add('cesium-cesiumInspector')
  container.append(element)

  const title = document.createElement('div')
  title.classList.add('cesium-cesiumInspector-button')
  title.innerHTML = 'Terrain Smapler'
  element.append(title)

  const box = document.createElement('div')
  box.classList.add('cesium-cesiumInspector-dropDown')
  box.style.textAlign = 'center'
  element.append(box)

  const drawButton = document.createElement('button')
  drawButton.classList.add('cesium-cesiumInspector-pickButton')
  drawButton.innerHTML = 'Draw Polyline'
  drawButton.onclick = () => {
    tips.innerHTML = 'drawing...'
    tips.style.color = ''
    drawer.drawPolyline({
      label: false,
      onFinished(drawer) {
        tips.innerHTML = 'sampling...'
        const { polyline } = drawer.polylines[0]
        const positions = polyline.polyline.positions.getValue(new JulianDate())
        const cartographices = positions.map(position => Cartographic.fromCartesian(position))
        //@ts-ignore
        sampleTerrainMostDetailed(viewer.terrainProvider, cartographices)
          .then(result => {
            let message = '[\n'
            let i = 0
            const { length } = result
            while (i < length) {
              const { longitude, latitude, height } = result[i]
              const lon = CesiumMath.toDegrees(longitude)
              const lat = CesiumMath.toDegrees(latitude)
              message += `  [${lon}, ${lat}, ${height}],\n`
              i++
            }
            message += ']'
            console.log(message)
            if (typeof onSample === 'function') {
              onSample(null, result)
            }
            tips.innerHTML = 'Sample successfully! You could open devtools and copy the result.'
            tips.style.color = '#2ed573'
          })
          [catchName]((err: any) => {
            if (typeof onSample === 'function') {
              onSample(err)
            }
            tips.innerHTML = 'Sample failed! You could devtools and see the reason.'
            tips.style.color = '#ff4d4d'
            throw err
          })
      }
    })
  }
  box.append(drawButton)

  const cleanButton = document.createElement('button')
  cleanButton.classList.add('cesium-cesiumInspector-pickButton')
  cleanButton.innerHTML = 'Clean'
  cleanButton.onclick = () => {
    drawer.cancel()
    drawer.removeAll()
  }
  box.append(cleanButton)

  const tips = document.createElement('div')
  tips.classList.add('cesium-cesiumInspector-styleEditor')
  tips.style.marginTop = '8px'
  tips.style.padding = '6px'
  tips.innerHTML = 'in idle...'
  box.append(tips)
}
