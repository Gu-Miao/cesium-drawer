import {
  CustomDataSource,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  CallbackProperty,
  ConstantProperty,
  Color,
  Cartographic,
  Math as CesiumMath,
  Cartesian2,
  PolygonHierarchy
} from 'cesium'
import type {
  Viewer,
  Cartesian3,
  EntityCollection,
  Entity,
  LabelGraphics,
  PointGraphics,
  PolylineGraphics,
  PolygonGraphics
} from 'cesium'
import type { PointEntity, LabelEntity, PolylineEntity, PolygonEntity } from './types'
import { removeArrayItemFromBehind, addHeight } from './utils'

export type DrawerConstructorOptions = {
  viewer: Viewer
  dataSourceName?: string
}
export type LabelOptions = Omit<LabelGraphics.ConstructorOptions, 'text'> & {
  text?: string | ((position: Cartesian3, index: number, positions: Cartesian3[]) => string)
  height?: number | ((drawer: Drawer) => number)
}
export type DrawPolylineOptions = {
  point?: PointGraphics.ConstructorOptions | boolean
  label?: LabelOptions | boolean
  polyline?: Omit<PolylineGraphics.ConstructorOptions, 'positions'>
  showGuidance?: boolean
  stopAfterFinish?: boolean
  isFinished?: (drawer: Drawer) => boolean
  onFinished?: (drawer: Drawer) => any
}
export type DrawPolygonOptions = DrawPolylineOptions & {
  polygon?: Omit<PolygonGraphics.ConstructorOptions, 'hierarchy'>
}
export type DataSet = {
  point?: PointEntity
  label?: LabelEntity
  position: Cartesian3
}
export type PositionData = {
  position: Cartesian3
  index: number
  positions: Cartesian3[]
}
export type PolylineDataSet = {
  polyline: PolylineEntity
  dataSets: DataSet[]
}
export type PolygonDataSet = PolylineDataSet & {
  polygon: PolygonEntity
}

const defaultPointOptions: PointGraphics.ConstructorOptions = {
  pixelSize: 10
}
const defaultLabeLOptions: LabelOptions = {
  text(position, index) {
    const { longitude, latitude } = Cartographic.fromCartesian(position)
    return `Point ${index + 1}
longitude: ${CesiumMath.toDegrees(longitude)}
latitude: ${CesiumMath.toDegrees(latitude)}`
  },
  showBackground: true,
  backgroundColor: Color.BLACK.withAlpha(0.5),
  backgroundPadding: new Cartesian2(4, 6),
  fillColor: Color.WHITE,
  font: '14px sans-serif',
  height(drawer) {
    const { position } = drawer.viewer.camera
    const { height } = Cartographic.fromCartesian(position)
    return height / 5
  }
}
const defaultPolylineOptions: DrawPolylineOptions['polyline'] = {
  material: Color.YELLOW,
  width: 5,
  clampToGround: true
}
const defulatDrawPolylineOptions: DrawPolylineOptions = {
  point: true,
  label: true,
  polyline: defaultPolylineOptions,
  showGuidance: true,
  stopAfterFinish: true
}
const defaultPolygonOptions: DrawPolygonOptions['polygon'] = {
  material: Color.YELLOW.withAlpha(0.6)
}
const defulatDrawPolygonOptions: DrawPolygonOptions = {
  ...defulatDrawPolylineOptions,
  polygon: defaultPolygonOptions
}

export class Drawer {
  /** Gets the Viewer instance */
  viewer: Viewer
  /** Gets the DataSource instance to be visualized */
  dataSource: CustomDataSource
  /** Gets the collection of Entity instances */
  entities: EntityCollection
  /** Gets the set of Entity instances contain PolygonGraphic and its dataset */
  polylines: PolylineDataSet[]
  /** Gets the set of Entity instances contain PolygonGraphic and its dataset */
  polygons: PolygonDataSet[]
  /** Gets the set of Entity instances that are being painted */
  drawingEntities: Entity[]
  /** Gets the screen space event handler */
  handler: ScreenSpaceEventHandler | undefined
  constructor(options: DrawerConstructorOptions) {
    const { viewer, dataSourceName } = options

    this.viewer = viewer
    this.dataSource = new CustomDataSource(dataSourceName)
    this.entities = this.dataSource.entities
    this.viewer.dataSources.add(this.dataSource)
    this.polylines = []
    this.polygons = []
    this.drawingEntities = []
  }
  /**
   * Create point entity
   * @param position A Cartesian3 that specify the position of point
   * @param options Object that specify properties of PointGraphic
   */
  createPoint(position: Cartesian3, options?: PointGraphics.ConstructorOptions) {
    const pointOptions = { ...defaultPointOptions, ...options }
    return this.entities.add({
      point: {
        ...pointOptions
      },
      position
    }) as PointEntity
  }
  /**
   * Create label entity
   * @param data Object that contains positions data of PointGraphic
   * @param options Object that specify properties of PointGraphic
   */
  createLabel(data: PositionData, options?: LabelOptions) {
    const { position, index, positions } = data
    const labelOptions = { ...defaultLabeLOptions, ...options }
    const { height } = labelOptions
    const isHeightFunction = typeof height === 'function'
    const labelPosition = height
      ? addHeight(position, isHeightFunction ? height(this) : height)
      : position
    const text =
      typeof labelOptions.text === 'function'
        ? labelOptions.text(position, index, positions)
        : labelOptions.text

    return this.entities.add({
      label: {
        ...labelOptions,
        text
      },
      position: labelPosition
    }) as LabelEntity
  }
  /**
   * Draw polyline graphic
   * @param options Object that specify options of drawing
   */
  drawPolyline(options?: DrawPolylineOptions) {
    this.cancel()
    this.removeDrawingEntities()

    const { point, label, polyline, showGuidance, stopAfterFinish, isFinished, onFinished } = {
      ...defulatDrawPolylineOptions,
      ...options
    }

    const pointOptions = typeof point === 'object' ? point : defaultPointOptions
    const labelOptions = typeof label === 'object' ? label : defaultLabeLOptions

    let positions: Cartesian3[] = []
    let dataSets: DataSet[] = []

    // Create polyline entity
    let polylineEntity = this.entities.add({
      polyline: {
        ...polyline,
        positions: showGuidance ? new CallbackProperty(() => positions, false) : positions
      }
    }) as PolylineEntity
    this.drawingEntities.push(polylineEntity)

    this.handler = new ScreenSpaceEventHandler(this.viewer.canvas)

    // Left click to set point position
    this.handler.setInputAction(movement => {
      const pickedPosition = this.viewer.scene.pickPosition(movement.position)
      if (!pickedPosition) return

      positions.push(pickedPosition)

      const dataSet: DataSet = { position: pickedPosition }
      if (point) {
        const pointEntity = this.createPoint(pickedPosition, pointOptions)
        dataSet.point = pointEntity
        this.drawingEntities.push(pointEntity)
      }
      if (label) {
        const data = { position: pickedPosition, index: positions.length - 1, positions }
        const labelEntity = this.createLabel(data, labelOptions)
        dataSet.label = labelEntity
        this.drawingEntities.push(labelEntity)
      }
      dataSets.push(dataSet)
    }, ScreenSpaceEventType.LEFT_CLICK)

    // Mouse move to show guidance
    let latestPosition: Cartesian3
    if (showGuidance) {
      this.handler.setInputAction(movement => {
        const pickedPosition = this.viewer.scene.pickPosition(movement.endPosition)
        if (!pickedPosition) return

        if (latestPosition) {
          removeArrayItemFromBehind(positions, latestPosition)
        }

        latestPosition = pickedPosition
        positions.push(pickedPosition)
      }, ScreenSpaceEventType.MOUSE_MOVE)
    }

    // Right click to remove latest position
    this.handler.setInputAction(() => {
      const dataSet = dataSets[dataSets.length - 1]
      if (!dataSet) return
      const { point, label, position } = dataSet
      if (point) this.entities.remove(point)
      if (label) this.entities.remove(label)
      removeArrayItemFromBehind(positions, position)
      removeArrayItemFromBehind(dataSets, dataSet)
    }, ScreenSpaceEventType.RIGHT_CLICK)

    // Middle click to finish
    this.handler.setInputAction(() => {
      if (latestPosition) {
        removeArrayItemFromBehind(positions, latestPosition)
      }

      const polylineGraphics = polylineEntity.polyline
      polylineGraphics.positions = new ConstantProperty(positions)

      this.polylines.push({
        polyline: polylineEntity,
        dataSets
      })
      positions = []
      dataSets = []

      if (stopAfterFinish || (isFinished && isFinished(this))) {
        this.cancel()
        this.drawingEntities = []
        if (onFinished) onFinished(this)
        return
      }

      polylineEntity = this.entities.add({
        polyline: {
          ...polyline,
          positions: showGuidance ? new CallbackProperty(() => positions, false) : positions
        }
      }) as PolylineEntity
      this.drawingEntities = [polylineEntity]
    }, ScreenSpaceEventType.MIDDLE_CLICK)
  }
  /**
   * Draw polygon graphic
   * @param options Object that specify options of drawing
   */
  drawPolygon(options?: DrawPolygonOptions) {
    this.cancel()
    this.removeDrawingEntities()

    const {
      point,
      label,
      polyline,
      polygon,
      showGuidance,
      stopAfterFinish,
      isFinished,
      onFinished
    } = {
      ...defulatDrawPolygonOptions,
      ...options
    }

    const pointOptions = typeof point === 'object' ? point : defaultPointOptions
    const labelOptions = typeof label === 'object' ? label : defaultLabeLOptions

    let positions: Cartesian3[] = []
    let dataSets: DataSet[] = []

    // Create polyline entity
    let polylineEntity = this.entities.add({
      polyline: {
        ...polyline,
        positions: showGuidance ? new CallbackProperty(() => positions, false) : positions
      }
    }) as PolylineEntity
    // Create polygon entity
    let polygonEntity = this.entities.add({
      polygon: {
        ...polygon,
        hierarchy: showGuidance
          ? new CallbackProperty(() => new PolygonHierarchy(positions), false)
          : new PolygonHierarchy(positions)
      }
    }) as PolygonEntity

    this.handler = new ScreenSpaceEventHandler(this.viewer.canvas)

    // Left click to set point position
    this.handler.setInputAction(movement => {
      const pickedPosition = this.viewer.scene.pickPosition(movement.position)
      if (!pickedPosition) return

      positions.push(pickedPosition)

      const dataSet: DataSet = { position: pickedPosition }
      if (point) {
        const pointEntity = this.createPoint(pickedPosition, pointOptions)
        dataSet.point = pointEntity
      }
      if (label) {
        const data = { position: pickedPosition, index: positions.length - 1, positions }
        const labelEntity = this.createLabel(data, labelOptions)
        dataSet.label = labelEntity
      }
      dataSets.push(dataSet)
    }, ScreenSpaceEventType.LEFT_CLICK)

    // Mouse move to show guidance
    let latestPosition: Cartesian3
    if (showGuidance) {
      this.handler.setInputAction(movement => {
        const pickedPosition = this.viewer.scene.pickPosition(movement.endPosition)
        if (!pickedPosition) return

        if (latestPosition) {
          removeArrayItemFromBehind(positions, latestPosition)
        }

        latestPosition = pickedPosition
        positions.push(pickedPosition)
      }, ScreenSpaceEventType.MOUSE_MOVE)
    }

    // Right click to remove latest position
    this.handler.setInputAction(() => {
      const dataSet = dataSets[dataSets.length - 1]
      if (!dataSet) return
      const { point, label, position } = dataSet
      if (point) this.entities.remove(point)
      if (label) this.entities.remove(label)
      removeArrayItemFromBehind(positions, position)
      removeArrayItemFromBehind(dataSets, dataSet)
    }, ScreenSpaceEventType.RIGHT_CLICK)

    // Middle click to finish
    this.handler.setInputAction(() => {
      if (latestPosition) {
        removeArrayItemFromBehind(positions, latestPosition)
      }

      const polylineGraphics = polylineEntity.polyline
      polylineGraphics.positions = new ConstantProperty(positions)
      const polygonGraphics = polygonEntity.polygon
      polygonGraphics.hierarchy = new ConstantProperty(new PolygonHierarchy(positions))

      this.polygons.push({
        polyline: polylineEntity,
        polygon: polygonEntity,
        dataSets
      })
      positions = []
      dataSets = []

      if (stopAfterFinish || (isFinished && isFinished(this))) {
        this.cancel()
        this.drawingEntities = []
        if (onFinished) onFinished(this)
        return
      }

      polylineEntity = this.entities.add({
        polyline: {
          ...polyline,
          positions: showGuidance ? new CallbackProperty(() => positions, false) : positions
        }
      }) as PolylineEntity
      polygonEntity = this.entities.add({
        polygon: {
          ...polygon,
          hierarchy: showGuidance
            ? new CallbackProperty(() => {
                new PolygonHierarchy(positions)
              }, false)
            : new PolygonHierarchy(positions)
        }
      }) as PolygonEntity
    }, ScreenSpaceEventType.MIDDLE_CLICK)
  }
  /**
   * Cancel drawing
   */
  cancel() {
    this.handler?.destroy()
  }
  /**
   * Remove drawing entities
   */
  removeDrawingEntities() {
    const { length } = this.drawingEntities
    let i = 0
    while (i < length) {
      this.entities.remove(this.drawingEntities[i])
      i++
    }
  }
  /**
   * Remove all entities
   */
  removeAll() {
    this.entities.removeAll()
  }
  /**
   * Destory drawer
   * @param keepEntities Should keep entities after destory.
   */
  destory(keepEntities = false) {
    // Remove entities and dataSouce
    this.cancel()
    this.removeDrawingEntities()
    if (!keepEntities) {
      this.removeAll()
      this.viewer.dataSources.remove(this.dataSource)
    }

    // Remove properties
    for (const name in this) {
      delete this[name]
    }

    // Cut the proto type chain
    Object.setPrototypeOf(this, null)
  }
}
