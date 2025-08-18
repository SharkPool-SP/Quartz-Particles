## Customizing Your Particles

When creating an emitter, you can customize its behaviour in two ways:

1. Pass an **options object** as the **4th argument** to `engine.createEmitter(...)`
2. Or modify the `opts` property in an emitter post-creation:

   ```js
   engine.emitters.get("name").opts.speed.val = 30;
   ```

---

### Option Format

Each option uses the same format:

```js
{ val: ..., inf: ... }
```

* **val** → The base (default) value. Every particle will use this as a starting point
* **inf** → The random variance. Each particle gets an extra offset chosen randomly between `-inf` and `+inf`.

Example:

```js
{ val: 3, inf: 2 }  
// possible results per particle: 1 → 5
```

Unless stated otherwise, both `val` and `inf` should be **numbers**.

---

### Behaviour Keys

| Key                | Description                               | Data Type       |
| ------------------ | ----------------------------------------- | --------------- |
| `maxP`             | Maximum number of particles alive at once | number          |
| `emission`         | Particles spawned per frame               | number          |
| `time`             | Particle lifetime (seconds)               | number          |
| `speed`            | Starting speed                            | number          |
| `xPos`, `yPos`     | Spawn position offset                     | number          |
| `gravX`, `gravY`   | Gravity (X/Y) applied each frame          | number          |
| `sDir`             | Starting direction (degrees)              | number          |
| `eDir`             | Ending direction (rotation over lifetime) | number          |
| `sSpin`            | Starting particle rotation                | number          |
| `eSpin`            | Ending particle rotation                  | number          |
| `sSize`            | Starting size                             | number          |
| `eSize`            | Ending size                               | number          |
| `sStreX`, `sStreY` | Starting stretch (X/Y)(%)                 | number          |
| `eStreX`, `eStreY` | Ending stretch (X/Y)(%)                   | number          |
| `accelRad`         | Radial acceleration                       | number          |
| `accelTan`         | Tangential acceleration                   | number          |
| `sinW`, `cosW`     | Wave frequency (sin/cos oscillation)      | number          |
| `sinS`, `cosS`     | Wave strength (sin/cos oscillation)       | number          |
| `fIn`              | Fade-in duration                          | number          |
| `fOut`             | Fade-out duration                         | number          |
| `sCol`             | Starting color (RGB array)                | array `[r,g,b]` |
| `eCol`             | Ending color (RGB array)                  | array `[r,g,b]` |

---

### Default Emitter Values

Here’s the built-in default behaviour of an Emitter:

```js
{
  maxP:    { val: 50, inf: 0 },
  emission:{ val: 1, inf: 0 },
  time:    { val: 0.4, inf: 0.1 },
  speed:   { val: 15, inf: 0 },

  xPos: { val: 10, inf: 0 },
  yPos: { val: 0, inf: 0 },

  gravX: { val: 0, inf: 0 },
  gravY: { val: -1.5, inf: 0 },

  sDir:  { val: 0, inf: 25 },
  eDir:  { val: 0, inf: 0 },

  sSpin: { val: 0, inf: 0 },
  eSpin: { val: 45, inf: 135 },

  sSize: { val: 25, inf: 10 },
  eSize: { val: 15, inf: 5 },

  sStreX: { val: 100, inf: 0 },
  eStreX: { val: 100, inf: 0 },
  sStreY: { val: 100, inf: 0 },
  eStreY: { val: 100, inf: 0 },

  accelRad: { val: 0, inf: 0 },
  accelTan: { val: 0, inf: 0 },

  sinW: { val: 0, inf: 0 },
  cosW: { val: 0, inf: 0 },
  sinS: { val: 1, inf: 0 },
  cosS: { val: 1, inf: 0 },

  fIn:  { val: 0, inf: 5 },
  fOut: { val: 15, inf: 2 },

  sCol: { val: [255, 0, 255], inf: 0 }, // #ff00ff
  eCol: { val: [0, 0, 255], inf: 0 },   // #0000ff
}
```
