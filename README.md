# Cesium Toolkit

Useful toolkit for cesium.

![npm](https://img.shields.io/npm/v/cesium-toolkit?logo=npm&style=flat-square)
![npm type definitions](https://img.shields.io/npm/types/cesium-toolkit?logo=typescript&style=flat-square)
![LGTM Grade](https://img.shields.io/lgtm/grade/javascript/github/Gu-Miao/cesium-toolkit?logo=lgtm&style=flat-square)
![GitHub](https://img.shields.io/github/license/Gu-Miao/cesium-toolkit?logo=github&style=flat-square)

## Install

First you must make sure that you've install cesium yet.

Then, you could install this by npm:

```bash
npm install cesium-toolkit -S
```

Or use CDN like `jsdelivr`.The global variable is `CesiumToolkit`.

## Import

We provide `UMD` and `ESM` bundle, so you could import it like this:

```js
// ESM
import { Drawer } from 'cesium-toolkit'

// CJS
const { Drawer } = require('cesium-toolkit')

// Script Tag
const { Drawer } = CesiumToolkit
```

## Classes

### Drawer

A class for drawing points, polylines and polygons.

## Functions

### increaseHeight

Add height to a cartesian coordinate. like a postion is `120, 50, 0` saving by a `Cartesian3`, if you want to increase its height to 100, you could:

```js
import { increaseHeight } from 'cesium-toolkit'

const position = Cartesian3.fromDegrees(120, 50, 0)
const newPosition = increaseHeight(position, 100)
```

Type defination:

```ts
function increaseHeight(position: Cartesian3, height?: number): Cartesian3
```

- position - `Cartesian3` cartesian position.
- height - `number` **optional** height to increase, if don't pass or pass `0`, return original cartesian.

* @return - return a new cartesian position.

### setHeight

Similar to `increaseHeight()`, but set the height rahter than increase it.

Type defination:

```ts
function setHeight(position: Cartesian3, height?: number): Cartesian3
```

- position - `Cartesian3` cartesian position.
- height - `number` **optional** height to set, if don't pass or pass `0`, return original cartesian.

* @return - return a new cartesian position.

## Mixins

Common usage for a cesium mixin:

```js
import { SomeMixin } from 'cesium-toolkit'

viewer.extend(SomeMixin, {
  // ...Some config
})
```

But due to its function signature, code hints can't work well.

```ts
extend(mixin: Viewer.ViewerMixin, options?: any): void;
```

So you could use it like this:

```js
import { SomeMixin } from 'cesium-toolkit'

SomeMixin(viewer, {
  // ...Some config with code hints
})
```

### terrainSamplerMixin

A mixin to sample heights from terrain by drawing polyline.

Basic usage:

```js
import { terrainSamplerMixin } from 'cesium-toolkit'

terrainSamplerMixin(viewer)
```

Then you could draw a polyline with points and once it finishes, it will call `sampleTerrainMostDetailed()` to get height of points and prinit it on devtools console panel.

Also, you could handle the error or result directly by passing a callback through the second argument:

```js
terrainSamplerMixin(viewer, {
  onSample(err, result) {
    if (err) throw err
    console.log('result', result)
  }
})
```

Type defination:

```ts
type onSampleSucceeded = (err: null, result: Cartographic[]) => any
type onSampleFailed = (err: null) => any

type Options = {
  onSample?: onSampleSucceeded & onSampleFailed
}

function terrainSamplerMixin(viewer: Viewer, options?: Options): void
```

## LICENSE

MIT
