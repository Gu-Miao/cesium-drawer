/** @type {import('cesium')} */
const Cesium = window.Cesium
const { Viewer, createWorldTerrain } = Cesium

/** @type {import('..')} */
const CesiumToolkit = window.CesiumToolkit
const {
  // Drawer,
  sampleMixin
} = CesiumToolkit

const viewer = new Viewer('cesiumContainer', {
  terrainProvider: createWorldTerrain()
})
viewer.scene.globe.depthTestAgainstTerrain = true
// viewer.scene.debugShowFramesPerSecond = true

// const drawer = new Drawer({
//   dataSourceName: 'ds1',
//   viewer
// })

// drawer.drawPolyline({
//   point: false,
//   label: true,
//   showGuidance: true,
//   stopAfterFinish: false
// })

viewer.extend(sampleMixin)
viewer.extend(Cesium.viewerCesium3DTilesInspectorMixin)
