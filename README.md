# Quartz Particles -- SharkPool

### Fast and Easy Particle Engine using JS and WebGL

---
#### Description

**Quartz Particles** is a lightweight and well-performing Particle Engine built with JavaScript and WebGL (and TWGL).
It allows you to create and manage multiple Particle Engines and Emitters with a plentiful amount of customizable properties like speed, direction, color, size, gravity, and more.

For my Windows PC (@SharkPool-SP), this engine can render over **30,000** particles in a single engine with decent fps. Over **20,000** on the M1 Macbook Air as well!

---

#### How to Import

You can add **Quartz Particles** to your project using an *ES module import*. For example:

```html
<script type="module">
  import QuartzParticles from "./quartz-particles.min.js";
  // or import from "./quartz-particles.js"

  /* Now you can create and initialize your Particle Engine! */
  const myEngine = new QuartzParticles();
</script>
```
---

#### How to Use

1. Initialize the engine with a canvas size:

```js
engine.initialize({ width: 640, height: 480 });
document.body.appendChild(myEngine.engine.canvas);
```

2. Create an emitter with a texture and position:

```js
myEngine.createEmitter("spark", [0, 0], "/square.png", optionsObj);
```
**Note:**

- Position (0,0) is the center

- You can also pass an object containing a WebGLTexture, width value, and height value instead of a url

- 'optionsObj' is a **optional** object that sets the behaviour of the particles. See [Quartz Particle Properties](https://github.com/SharkPool-SP/Quartz-Particles/blob/main/src/docs/particle-properties.md) for a description of each property to include in the object.


3. Update the engine in your animation loop:

```js
function animate(time) {
  myEngine.updateEngine(1); // Pass deltaTime if needed
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

4. Remove emitters or dispose the engine when done:

```js
myEngine.disposeEmitter("spark");
myEngine.disposeEngine();
```
