/** @type {import('cesium')} */
const Cesium = window.Cesium
const { Viewer, createWorldTerrain } = Cesium

/** @type {import('..')} */
const CesiumDrawer = window.CesiumDrawer
const { Drawer } = CesiumDrawer

const viewer = new Viewer('cesiumContainer', {
  terrainProvider: createWorldTerrain()
})
viewer.scene.globe.depthTestAgainstTerrain = true
viewer.scene.debugShowFramesPerSecond = true

const drawer = new Drawer({
  dataSourceName: 'ds1',
  viewer
})

Cesium.Viewer

drawer.dataSource

drawer.drawPolyline({
  point: false,
  label: true,
  showGuidance: true,
  stopAfterFinish: false
})
