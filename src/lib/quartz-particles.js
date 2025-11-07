import * as twgl from "https://cdn.jsdelivr.net/npm/twgl.js@4/dist/4.x/twgl-full.module.min.js";

/* Engine Constants */
const radianConvert = Math.PI / 180;
const vertices = [
  -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5,
];
const texcoords = [0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1];

const TWO_PI = Math.PI * 2;
const INV_TWO_PI = 8192 / TWO_PI;

const sinTable = new Float32Array(8192),
  cosTable = new Float32Array(8192);
for (let i = 0; i < 8192; i++) {
  const angle = (i / 8192) * TWO_PI;
  sinTable[i] = Math.sin(angle);
  cosTable[i] = Math.cos(angle);
}

const engineVertShader = `
attribute vec2 a_position;
attribute vec2 a_texcoord;

uniform mat4 u_matrix;

varying vec2 v_texcoord;

void main() {
  gl_Position = u_matrix * vec4(a_position, 0, 1);
  v_texcoord = a_texcoord;
}`;
const engineFragShader = `
precision mediump float;

uniform sampler2D u_texture;
uniform vec4 u_tintColor;

varying vec2 v_texcoord;

void main() {
  vec4 tex = texture2D(u_texture, v_texcoord);
  gl_FragColor = tex * u_tintColor;
}`;

// data.uri for a SVG white square. Default texture
const backupURL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDUwIDUwIj48cGF0aCBkPSJNMCA1MFYwaDUwdjUweiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==";

const defaultSettings = {
  maxP: { val: 50, inf: 0 },
  emission: { val: 1, inf: 0 },
  time: { val: 0.4, inf: 0.1 },
  speed: { val: 15, inf: 0 },
  xPos: { val: 10, inf: 0 },
  yPos: { val: 0, inf: 0 },
  gravX: { val: 0, inf: 0 },
  gravY: { val: -1.5, inf: 0 },
  sDir: { val: 0, inf: 25 },
  eDir: { val: 0, inf: 0 },
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
  fIn: { val: 0, inf: 5 },
  fOut: { val: 15, inf: 2 },
  sCol: { val: [255, 0, 255] /* #ff00ff */, inf: 0 },
  eCol: { val: [0, 0, 255] /* #0000ff */, inf: 0 },
};

const defaultScale = {
  width: 480, // px
  height: 360 // px
};

/* Engine Utility */
const fastSin = (rads) => sinTable[Math.floor(rads * INV_TWO_PI) & 8191];
const fastCos = (rads) => cosTable[Math.floor(rads * INV_TWO_PI) & 8191];

const rng = (val, inf) => val + (Math.random() * 2 - 1) * inf;

const clamp = (min, max, value) => {
  return value > max ? max : min > value ? min : value;
};

const image2Texture = (url, gl, callback) => {
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.src = url;
  img.onerror = (e) => console.error("Error loading texture:", e);
  img.onload = () => callback({
    tWidth: img.width,
    tHeight: img.height,
    texture: twgl.createTexture(gl, { src: img, flipY: true }),
  });
};

const shiftRGB = (rgbSetting) => {
  return rgbSetting.val.map((c) => clamp(0, 255, rng(c, rgbSetting.inf)));
};

const createTint = (sRGB, eRGB, time) => {
  return eRGB.map((c, i) => (c * time + sRGB[i] * (1 - time)) / 255);
};

/* Quartz Engine Class */
class QuartzParticles {
  constructor() {
    this.engine = null;
    this.emitters = null;
  }

  /**
   * initializes the particle engine
   *
   * @param {object} scale, object containing numeric width & height properties for display
  */
  initialize (scale = defaultScale) {
    const canvas = document.createElement("canvas");
    this.initializeFromCanvas(canvas, scale);
  }

  /**
   * initializes the particle engine using a canvas already on the DOM
   * 
   * @param {<canvas>} canvas, the canvas element
   * @param {object} optScale, (optional) object containing numeric width & height
   * properties for display. Uses the inputted canvas size by default
   */
  initializeFromCanvas (canvas, optScale) {
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (optScale && optScale.width && optScale.height) {
      canvas.width = optScale.width;
      canvas.height = optScale.height;
    }

    const projection = twgl.m4.ortho(0, canvas.width, canvas.height, 0, -1, 1);
    const programInfo = twgl.createProgramInfo(gl, [
      engineVertShader,
      engineFragShader,
    ]);
    const bufferInfo = twgl.createBufferInfoFromArrays(gl, {
      a_position: { numComponents: 2, data: vertices },
      a_texcoord: { numComponents: 2, data: texcoords },
    });

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.engine = {
      canvas, gl,
      programInfo, bufferInfo, projection,
      noTrails: true,
    };
    this.emitters = new Map();
  }

  /**
   * deletes the particle engine
   */
  disposeEngine () {
    this.emitters.forEach(e => {
      if (e.textureData?.texture) {
        this.engine.gl.deleteTexture(e.textureData.texture);
      }
    });
    this.engine.canvas.remove();
    this.engine = null;
    this.emitters.clear();
  }

  /**
   * restarts the flow of the engine. Resets all emitters to their default state
   */
  resetEngineFlow () {
    this.emitters.forEach((emitter) => {
      emitter.frameCnt = 0;
      emitter.tintCache = new Map();
    });
  }

  /**
   * updates a single frame of the particle engine
   * @param {number} delta, numerical value used for delta frames
   */
  updateEngine (delta = 1) {
    const {
      canvas, gl,
      programInfo, bufferInfo, projection,
      data,
      noTrails,
    } = this.engine;
    const emitters = this.emitters;
    const { width, height } = canvas;
    const lifeRate = 0.01 * delta;

    /* clear canvas */
    twgl.bindFramebufferInfo(gl, null);
    gl.viewport(0, 0, width, height);
    if (noTrails) {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }

    emitters.forEach((emitter) => {
      if (!emitter.textureData) return;

      const { pos, opts, data, tintCache, textureData } = emitter;
      const { tWidth, tHeight } = textureData;
      emitter.frameCnt++;

      const maxP = Math.round(rng(opts.maxP.val, opts.maxP.inf));
      const rPos = [pos[0] - tWidth * 0.25, pos[1] + tHeight * 0.25];

      // [CPU] emit new particles
      if (emitter.frameCnt > 1 && data.size < maxP) {
        const emission = Math.round(rng(opts.emission.val, opts.emission.inf));
        const count = maxP > emission ? emission : maxP;
        for (let i = 0; i < count; i++) {
          const life = rng(opts.time.val, opts.time.inf);
          const obj = {
            ind: 0,
            conLife: life * 100, life,
            speed: rng(opts.speed.val, opts.speed.inf),
            x: rPos[0] + rng(opts.xPos.val, opts.xPos.inf),
            y: rPos[1] + rng(opts.yPos.val * -1, opts.yPos.inf),
            dir: rng(opts.sDir.val - 90, opts.sDir.inf),
            eDir: rng(opts.eDir.val - 90, opts.eDir.inf),
            spin: rng(opts.sSpin.val - 90, opts.sSpin.inf),
            eSpin: rng(opts.eSpin.val - 90, opts.eSpin.inf),
            size: rng(opts.sSize.val, opts.sSize.inf) * 0.01,
            eSize: rng(opts.eSize.val, opts.eSize.inf) * 0.01,
            streX: rng(opts.sStreX.val, opts.sStreX.inf) * 0.01,
            eStreX: rng(opts.eStreX.val, opts.eStreX.inf) * 0.01,
            streY: rng(opts.sStreY.val, opts.sStreY.inf) * 0.01,
            eStreY: rng(opts.eStreY.val, opts.eStreY.inf) * 0.01,
            gravX: rng(opts.gravX.val, opts.gravX.inf),
            gravY: rng(opts.gravY.val, opts.gravY.inf),
            accelRad: rng(opts.accelRad.val, opts.accelRad.inf),
            accelTan: rng(opts.accelTan.val, opts.accelTan.inf),
            sinW: rng(opts.sinW.val, opts.sinW.inf),
            cosW: rng(opts.cosW.val, opts.cosW.inf),
            sinS: rng(opts.sinS.val, opts.sinS.inf),
            cosS: rng(opts.cosS.val, opts.cosS.inf),
            fIn: rng(opts.fIn.val, opts.fIn.inf),
            fOut: rng(opts.fOut.val, opts.fOut.inf),
            sCol: shiftRGB(opts.sCol),
            eCol: shiftRGB(opts.eCol),
            ogPos: [],
          };
          obj.ogPos = [obj.x, obj.y];
          data.add(obj);
        }
      }

      // [GPU] draw particles
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textureData.texture);

      for (const particle of data) {
        let {
          ind, conLife, life,
          x, y, ogPos,
          dir, eDir,
          size, eSize,
          spin, eSpin,
          speed, gravX, gravY,
          streX, eStreX,
          streY, eStreY,
          accelRad, accelTan,
          sinW, sinS,
          cosW, cosS,
          fIn, fOut,
          sCol, eCol,
        } = particle;

        /* do not draw if dead */
        if (particle.life - lifeRate <= 0) {
          data.delete(particle);
          continue;
        }

        const dx = x - (pos[0] + width * 0.5);
        const dy = y - (pos[1] + height * 0.5);
        const mag = Math.hypot(dx, dy) || 1;
        const normX = dx / mag;
        const normY = dy / mag;
        const dirRad = dir * radianConvert;

        ogPos[0] += (fastCos(dirRad) * speed + normX *
          accelRad * ind + -normY * accelTan * ind) * delta;
        ogPos[0] -= gravX * ind * delta;
        ogPos[1] += (fastSin(dirRad) * speed + normY *
          accelRad * ind + normX * accelTan * ind) * delta;
        ogPos[1] -= gravY * ind * delta;

        const waveT = conLife - life;
        particle.x = ogPos[0] + fastSin(waveT * sinS) * sinW;
        particle.y = ogPos[1] + fastCos(waveT * cosS) * cosW;

        const fadeIn = ind * (1 / fIn);
        const fadeOut = (conLife - ind) * (1 / fOut);
        const opacity = clamp(0, 1, Math.min(fadeIn, fadeOut));

        const tintKey = life.toFixed(4);
        let tint = tintCache.get(tintKey);
        if (!tint) {
          tint = createTint(
            sCol, eCol, clamp(0, 1, ind / conLife)
          );
          tintCache.set(tintKey, tint);
        }

        particle.ind += delta;
        particle.life -= lifeRate;

        const screenX = particle.x + width * 0.5;
        const screenY = particle.y + height * 0.5;
        const sizeX = tWidth * size * streX;
        const sizeY = tHeight * size * streY;
        /* do not draw if out-of-bounds */
        if (
          screenX + sizeX < 0 ||
          screenX - sizeX > width ||
          screenY + sizeY < 0 ||
          screenY - sizeY > height
        ) continue;

        const posNDC = [particle.x + width * 0.5, particle.y + height * 0.5, 0];

        let matrix = twgl.m4.translate(projection, posNDC);
        matrix = twgl.m4.rotateZ(matrix, spin * radianConvert);
        matrix = twgl.m4.scale(matrix, [sizeX, sizeY, 1]);

        twgl.setUniforms(programInfo, {
          u_matrix: matrix,
          u_texture: textureData.texture,
          u_tintColor: [...tint, opacity],
        });
        twgl.drawBufferInfo(gl, bufferInfo);

        const deltaFactor = delta / conLife;
        particle.dir += (eDir - dir) * deltaFactor;
        particle.spin += (eSpin - spin) * deltaFactor;
        particle.size += (eSize - size) * deltaFactor;
        particle.streX += (eStreX - streX) * deltaFactor;
        particle.streY += (eStreY - streY) * deltaFactor;
      }
    });
  }

  /**
   * create an emitter by name for the engine
   * @param {string} name, name used to identify the emitter
   * @param {array} position, array with x and y coordinates. (0,0) is the center
   * @param {WebGLTexture|String} texturePath, image URL or WebGLTexture used by each particle
   * @param {object} options, (optional) settings for the engine. Same structure as 'defaultSettings'
   */
  createEmitter(name, position = [0, 0], texturePath, options) {
    const ctx = {
      pos: position,
      opts: options ?? structuredClone(defaultSettings),
      textureData: null,
      frameCnt: 0,
      data: new Set(), tintCache: new Map(),
    };

    if (typeof texturePath === "object" && !Array.isArray(texturePath)) {
      if (!(texturePath.texture instanceof WebGLTexture)) {
        console.error(`QuartzParticles.createEmitter -- (${name}) missing WebGLTexture 'texture' property!`);
        return;
      }

      if (
        typeof texturePath.tWidth === "number" && typeof texturePath.tHeight === "number"
      ) {
        ctx.textureData = texturePath;
      } else {
        console.error(`QuartzParticles.createEmitter -- (${name}) missing 'tWidth', 'tHeight' number properties!`);
        return;
      }
    } else {
      image2Texture(texturePath || backupURL, this.engine.gl, (webTexture) => {
        ctx.textureData = webTexture;
      });
    }
    this.emitters.set(name, ctx);
  }

  /**
   * remove an emitter by name from the engine
   * @param {string} name, name used to identify the emitter
   */
  disposeEmitter(name) {
    const emitter = this.emitters.get(name);
    if (emitter) {
      if (emitter.textureData?.texture) {
        this.engine.gl.deleteTexture(emitter.textureData.texture);
      }
      this.emitters.delete(name);
    }
  }
}

export default QuartzParticles;
