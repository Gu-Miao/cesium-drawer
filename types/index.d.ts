import {
  CustomDataSource,
  ScreenSpaceEventHandler,
  PolygonGraphics,
  Viewer,
  EntityCollection,
  Cartesian3,
  PointGraphics,
  PolylineGraphics,
  LabelGraphics,
  Entity
} from 'cesium'
type PointEntity = Entity & {
  point: Required<Entity['point']>
  position: Required<Entity['position']>
}
type LabelEntity = Entity & {
  label: Required<Entity['label']>
  position: Required<Entity['position']>
}
type PolylineEntity = Entity & {
  polyline: Required<Entity['polyline']>
}
type PolygonEntity = Entity & {
  polygon: Required<Entity['polygon']>
}
type DrawerConstructorOptions = {
  viewer: Viewer
  dataSourceName?: string
}
type LabelOptions = Omit<LabelGraphics.ConstructorOptions, 'text'> & {
  text?: string | ((position: Cartesian3, index: number, positions: Cartesian3[]) => string)
  height?: number | ((drawer: Drawer) => number)
}
type DrawPolylineOptions = {
  point?: PointGraphics.ConstructorOptions | boolean
  label?: LabelOptions | boolean
  polyline?: Omit<PolylineGraphics.ConstructorOptions, 'positions'>
  showGuidance?: boolean
  stopAfterFinish?: boolean
}
type DrawPolygonOptions = DrawPolylineOptions & {
  polygon?: Omit<PolygonGraphics.ConstructorOptions, 'hierarchy'>
}
type DataSet = {
  point?: PointEntity
  label?: LabelEntity
  position: Cartesian3
}
type PositionData = {
  position: Cartesian3
  index: number
  positions: Cartesian3[]
}
type PolylineDataSet = {
  polyline: PolylineEntity
  dataSets: DataSet[]
}
type PolygonDataSet = PolylineDataSet & {
  polygon: PolygonEntity
}
declare class Drawer {
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
  constructor(options: DrawerConstructorOptions)
  /**
   * Create point entity
   * @param position A Cartesian3 that specify the position of point
   * @param options Object that specify properties of PointGraphic
   */
  createPoint(position: Cartesian3, options?: PointGraphics.ConstructorOptions): Entity
  /**
   * Create label entity
   * @param data Object that contains positions data of PointGraphic
   * @param options Object that specify properties of PointGraphic
   */
  createLabel(data: PositionData, options?: LabelOptions): Entity
  /**
   * Draw polyline graphic
   * @param options Object that specify options of drawing
   */
  drawPolyline(options: DrawPolylineOptions): void
  /**
   * Draw polygon graphic
   * @param options Object that specify options of drawing
   */
  drawPolygon(options: DrawPolygonOptions): void
  /**
   * Cancel drawing
   */
  cancel(): void
  /**
   * Remove all entities
   */
  removeAll(): void
  /**
   * Destory drawer
   * @param keepEntities Should keep entities after destory.
   */
  destory(keepEntities?: boolean): void
}
export {
  Drawer,
  PointEntity,
  LabelEntity,
  PolylineEntity,
  PolygonEntity,
  DrawerConstructorOptions,
  LabelOptions,
  DrawPolylineOptions,
  DrawPolygonOptions,
  DataSet,
  PositionData,
  PolylineDataSet,
  PolygonDataSet
}
