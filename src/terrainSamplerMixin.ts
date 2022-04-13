import {
  Viewer,
  defined,
  DeveloperError,
  JulianDate,
  sampleTerrainMostDetailed,
  Cartographic
} from 'cesium'
import { Drawer } from './Drawer'

export function sampleMixin(viewer: Viewer) {
  if (!defined(viewer)) {
    throw new DeveloperError('viewer is required.')
  }

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
    drawer.drawPolyline({
      onFinished(drawer) {
        const { polyline } = drawer.polylines[0]
        const positions = polyline.polyline.positions.getValue(new JulianDate())
        const cartographices = positions.map(position => Cartographic.fromCartesian(position))
        sampleTerrainMostDetailed(viewer.terrainProvider, cartographices).then(res => {
          console.log(res)
        })
      }
    })
  }
  box.append(drawButton)
}
