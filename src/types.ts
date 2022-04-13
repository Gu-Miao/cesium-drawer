import {
  Property,
  PositionProperty,
  JulianDate,
  Entity,
  LabelGraphics,
  PointGraphics,
  PolylineGraphics,
  PolygonGraphics,
  Cartesian3,
  PolygonHierarchy,
  Event
} from 'cesium'

/**
 * The interface for all properties, which represent a value that can optionally vary over time.
 * This type defines an interface and cannot be instantiated directly.
 */
export interface IProperty<T> {
  /**
   * Gets a value indicating if this property is constant.  A property is considered
   * constant if getValue always returns the same result for the current definition.
   */
  readonly isConstant: boolean
  /**
   * Gets the event that is raised whenever the definition of this property changes.
   * The definition is considered to have changed if a call to getValue would return
   * a different result for the same time.
   */
  readonly definitionChanged: Event
  /**
   * Gets the value of the property at the provided time.
   * @param time - The time for which to retrieve the value.
   * @param [result] - The object to store the value into, if omitted, a new instance is created and returned.
   * @returns The modified result parameter or a new instance if the result parameter was not supplied.
   */
  getValue(time: JulianDate, result?: any): T
  /**
   * Compares this property to the provided property and returns
   * <code>true</code> if they are equal, <code>false</code> otherwise.
   * @param [other] - The other property.
   * @returns <code>true</code> if left and right are equal, <code>false</code> otherwise.
   */
  equals(other?: Property): boolean
}

export interface PointEntity extends Entity {
  point: PointGraphics
  position: PositionProperty
}
export interface LabelEntity extends Entity {
  label: LabelGraphics
  position: PositionProperty
}
export interface PolylineEntity extends Entity {
  polyline: Omit<PolylineGraphics, 'positions'> & {
    positions: IProperty<Cartesian3[]>
  }
}
export interface PolygonEntity extends Entity {
  polygon: Omit<PolygonGraphics, 'hierarchy'> & {
    hierarchy: IProperty<PolygonHierarchy>
  }
}
