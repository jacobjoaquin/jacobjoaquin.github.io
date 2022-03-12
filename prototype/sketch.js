// Invisillations (prototype)
// By Jacob Joaquin


/*

_________________________________________ 
/ Welcome to the mess! Code is currently  \
\ optimized for creativy, not efficiency. /
 ----------------------------------------- 
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||

*/


/*
# TODO

- Finte tune
- Rewrite code for efficiency, and length (gas)
- Start with picture, then flash/fade once initial art is generated
- Check if JS minimizer reduces obj keys, rename if necessary
- Fine tune palettes
- Add extra motion to prop clusters
- Animation per prop in cluster, reactive to environment
- Modes: Classic Prismatics, Contemporary, Ink on Paper
- Add other shader 
- Optimize shader for efficiency, and length if possible (gas)
*/


// let properties = createBaseProperties()
let thisMode = R.random_choice(artModeList)
// thisMode = 'relationship'
let properties = setArtMode(thisMode)

// Overrides ------------------------------------------------------------------
// properties.animation = 'magician'
// properties.glass = 'refract'
// properties.opArt = 'none'
// properties.shaderNoise = 'i'
// properties.spirit = false
// properties.spiral = false
// properties.palette = 'prismatics
// properties.shaderNoise = 'none'
properties.cameraFOV = 120

// plane ! spiral
while (properties.stage === 'plane' && properties.spiral) {
  properties.stage = R.random_choice(stageList)
}

// Grey => Crush
if (properties.palette === 'grey' && properties.gradient === 'gradient') {
  properties.gradient = 'crush'
}

if (properties.animation === 'magician') {
  properties.orbRadius *= 0.6185
}
// ----------------------------------------------------------------------------

// properties = propertiesDev
console.log('initial properties:')
console.log(properties)

// Sketch Properties
const uniformRandom = properties.smudge
const uniformFocal = new THREE.Vector3(properties.focalLength, 0, properties.focalZ)
uniformFocal.applyAxisAngle(axis.z, properties.focalAngle)
const cubeCameraResolution = 1024

// Set Palette
const paletteModes = {
  prismatics: 7,
  prismaticfade: 9,
  pinkband: 22,
  orangewave: 4,
  grey: 11
}
palette = paletteDict[properties.palette]()

// Canvas
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({
  // antialias: true,
  canvas: canvas,
  powerPreference: 'high-performance',
  alpha: true,
  preserveDrawingBuffer: true
})
resizeRendererToDisplaySize(renderer)
const dims = getClientDim(renderer)

// Scene
const scene = new THREE.Scene();

// Camera
const fov = properties.cameraFOV
const aspect = 1
const near = 0.1
const far = 1000
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
camera.position.z = -100

// const width = 500
// const height = width
// const camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
// camera.position.z = -100

scene.add(camera);


// Cube Camera
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(cubeCameraResolution, {
  generateMipmaps: true,
  minFilter: THREE.LinearMipmapLinearFilter,
})
cubeRenderTarget.texture.mapping = THREE.CubeRefractionMapping
const cubeCamera = new THREE.CubeCamera(1, 1024, cubeRenderTarget)
const cubeCameraMaterialProperties = {
  color: 0xddff88,
  envMap: cubeRenderTarget.texture,
  refractionRatio: 0.618,
  // reflectivity: 1.0,
}

// Set Glass Material
const glass = {
  reflect: () => {
    cubeCameraMaterialProperties.reflectivity = 1.0
  },
  refract: () => {
    cubeCameraMaterialProperties.refractionRatio = 0.9
  }
}
glass[properties.glass]()
const cubeCameraMaterial = new THREE.MeshPhongMaterial(cubeCameraMaterialProperties);

// Set Lights
const ambientLight = new THREE.AmbientLight(0xffffff)
scene.add(ambientLight)

// Set Texture
const texture = setupTexture()

// Set Uniforms
const uniforms = {
  u_resolution: { value: { x: dims.width, y: dims.height } },
  u_phase: { value: 0.0 },
  u_index: { value: 0 },
  u_random: { value: uniformRandom },
  u_focal: { value: uniformFocal },
  u_texture: { type: 't', value: texture.texture },
  u_bandwidth: { value: properties.bandwidth },
  u_opArtX: { value: properties.opArtX },
  u_opArtY: { value: properties.opArtY },
  u_spiritDist: { value: properties.spiritDist },
  u_spiritCoef: { value: properties.spiritCoef },
  u_cycleFreq: { value: R.random_choice([-2, -1, 0, 1, 2]) },
  // u_thinDensity: { value: R.random_choice([-0.5, 1, 1, 1, 1, 2, 4, 8, 16]) }, // TODO: <----
  u_thinDensity: { value: 1.0 },
}

// Set Geometry
const geometryPlane = new THREE.PlaneGeometry(4000, 4000)

// Set Materials
const materialWhite = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 1.0, 1.0) })
const shaderCode = generateShader(palette)
const sm = new THREE.ShaderMaterial({
  vertexShader: vShader,
  fragmentShader: shaderCode,
  uniforms,
})
const materialTexture = new THREE.MeshBasicMaterial({ map: texture.texture })
const propMaterials = {
  cubecamera: cubeCameraMaterial,
  sm: sm
}
const material = propMaterials[properties.propMaterial]

// Set Background 
scene.background = new THREE.Color('#E0C9A6')
// scene.background = new THREE.Color('#111111')

// Set Stage
const stage = {
  plane: () => {
    const plane = new THREE.Mesh(geometryPlane, sm)
    plane.position.z = -400
    scene.add(plane);
  },
  box: () => {
    const roomScaleZ = R.random_num(2, 4)
    // const roomLength = R.random_number(150, 500)
    const roomLength = 200
    const geometry = new THREE.BoxGeometry(roomLength, roomLength, roomLength * roomScaleZ);
    const roomMesh = new THREE.Mesh(geometry, sm);
    roomMesh.material.side = THREE.DoubleSide;
    scene.add(roomMesh)
  },
  tunnel: () => {
    const nSides = R.random_choice([3, 4, 5, 6, 8, 12, 128])
    const geometry = new THREE.CylinderGeometry(200, 200, 1200, nSides, openEnded = true);
    const cylinder = new THREE.Mesh(geometry, sm);
    cylinder.material.side = THREE.DoubleSide;
    cylinder.setRotationFromAxisAngle(axis.x, TAU / 4)
    scene.add(cylinder);
  }
}

// Set ObjectList
const meshList = []

// Set Pivot
const pivot = new THREE.Object3D()
scene.add(pivot)

// Set Props
const prop = {
  orb: () => {
    const radius = properties.orbRadius
    const widthSegments = 128
    const heightSegments = 64
    const size = 4
    const sphereGeometry = new THREE.SphereGeometry(radius, widthSegments * size, heightSegments * size)
    // const sphereMesh = new THREE.Mesh(sphereGeometry, cubeCameraMaterial);
    const sphereMesh = new THREE.Mesh(sphereGeometry, material);
    // const sphereMesh = new THREE.Mesh(sphereGeometry, texture);
    sphereMesh.position.z = -200;
    pivot.add(sphereMesh)
  },
  spherePack2: () => {
    const spherePackList = []
    spherePackList.push(...spherePack(0.1, 0.01, 0.95, 1000))

    for (const o of spherePackList) {
      const s = 200
      o.x = (o.x - 0.5) * s
      o.y = (o.y - 0.5) * s
      o.z = (o.z - 0.5) * s - 50
      o.r *= s * 1.0
      // o.r *= s * 1.0 * R.random_num(0.25, 1)
    }

    const mRand = 1
    const radius = 1.0
    const widthSegments = 128 * 1
    const heightSegments = 64 * 1

    const sphereGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments)

    for (const o of spherePackList) {
      for (let i = 0; i < 1; i++) {
        let sphereMesh;
        sphereMesh = new THREE.Mesh(sphereGeometry, cubeCameraMaterial)
        sphereMesh.position.set(o.x, o.y, o.z + R.random_num(0, -200))
        sphereMesh.scale.set(o.r, o.r, o.r * 0.5)
        sphereMesh.material.side = THREE.DoubleSide
        pivot.add(sphereMesh)
      }
    }
  },
  grid: () => {
    function createGridList(nx, ny, minX, minY, maxX, maxY, radius) {
      const out = []
      for (let y = 0; y < ny; y++) {
        for (let x = 0; x < nx; x++) {
          const xv = map(x, 0, nx - 1, minX, maxX)
          const yv = map(y, 0, ny - 1, minY, maxY)
          const o = { x: xv, y: yv, z: 0, r: radius }
          out.push(o)
        }
      }
      return out
    }
    const mRand = 1
    const radius = 1.0
    const widthSegments = 128 * 1
    const heightSegments = 64 * 1
    const sphereGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments)
    const tubeRadius = radius * 0.125
    const torusCoef = 2.0
    const torusGeometry = new THREE.TorusGeometry(radius - tubeRadius, tubeRadius, 6 * torusCoef, 16 * torusCoef);

    const gridDim = 50
    const gridRows = Math.floor(R.random_num(3, 8));
    const gridRadius = gridDim / gridRows * 1.0
    const gridList = createGridList(gridRows, gridRows, -gridDim, -gridDim, gridDim, gridDim, gridRadius)

    const rDepth = R.random_choice([0, -50])
    const layerCoef = R.random_num(1, 3)
    const radiusCoef = R.random_choice([0.25, 0.5, 0.618])
    for (const o of gridList) {
      o.r *= radiusCoef
      o.z = R.random_num(0, rDepth) - 150
    }

    const nLayers = R.random_choice([1, 3, 8])
    for (const o of gridList) {
      for (let i = 0; i < nLayers; i++) {
        let sphereMesh;
        const thisMaterial = material
        if (R.random_bool(0.5)) {
          sphereMesh = new THREE.Mesh(sphereGeometry, thisMaterial)
        } else {
          sphereMesh = new THREE.Mesh(torusGeometry, thisMaterial)
        }
        sphereMesh.position.set(o.x, o.y, o.z + -i * layerCoef * o.r)
        sphereMesh.scale.set(o.r, o.r, o.r)
        sphereMesh.material.side = THREE.DoubleSide
        pivot.add(sphereMesh)
      }
    }
  }
}

class Pong {
  x0 = -100
  x1 = 100
  y0 = -100
  y1 = 100
  z0 = -200
  z1 = 0
  r = 50
  speed = 0.75

  constructor() {
    this.x0 += this.r
    this.x1 -= this.r
    this.y0 += this.r
    this.y1 -= this.r

    this.position = new THREE.Vector3(0, -37.222, -65)
    this.positionLag = new THREE.Vector3().copy(this.position)
    this.angle = new THREE.Vector3(1, 0, 0)
      .multiplyScalar(this.speed)
      .applyAxisAngle(axis.z, R.random_num(0, TAU))
      .applyAxisAngle(axis.y, R.random_num(0, TAU))
      .multiplyScalar(this.speed)
  }

  update() {
    const coef = 0.05
    this.position.add(this.angle)
    this.positionLag.x = this.positionLag.x * (1 - coef) + this.position.x * coef
    this.positionLag.y = this.positionLag.y * (1 - coef) + this.position.y * coef
    this.positionLag.z = this.positionLag.z * (1 - coef) + this.position.z * coef
    pivot.position.copy(this.positionLag)
    uniformFocal.copy(this.positionLag)

    if (this.position.x <= this.x0 || this.position.x >= this.x1) {
      this.angle.x *= -1
    }
    if (this.position.y <= this.y0 || this.position.y >= this.y1) {
      this.angle.y *= -1
    }
    if (this.position.z <= this.z0 || this.position.z >= this.z1) {
      this.angle.z *= -1
    }
  }
}

const pong = new Pong()

// Set Animation
animationQueue = []
animations = {
  none: () => { },
  magician: () => {
    pivot.position.y = Math.sin(animationPhase * TAU * 4) * -20;
    pivot.setRotationFromAxisAngle(axis.y, Math.cos(animationPhase * TAU * 2) * TAU * 0.04)
  },
  pong: () => {
    pong.update()
  }
}


animationQueue.push(() => { cubeCamera.setRotationFromAxisAngle(axis.z, phase2 * TAU * 1.0) })
animationQueue.push(animations[properties.animation])


// Do the things
stage[properties.stage]()
prop[properties.prop]()

// Main
const freq = 1 / 16
let nFrames = 60 * 30
let frameCount = -2
let lastTime = 0
let phase = R.random_dec()
let phase2 = R.random_dec()
let freq2 = freq * 0.5 * R.random_choice([-1, 1])
let animationPhase = R.random_dec()

const doAnimation = R.random_bool(0.5)

function animate(time) {
  // Handle Resize
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    const dims = getClientDim(renderer)
    uniforms.u_resolution.value.x = dims.width
    uniforms.u_resolution.value.y = dims.height
  }

  phase += ((time - lastTime) / 1000.0) * freq;
  phase = normalMod(phase)
  // console.log(phase)
  phase2 += ((time - lastTime) / 1000.0) * freq2;
  phase2 = normalMod(phase2)

  animationPhase += 1 / 1000
  animationPhase = normalMod(animationPhase)

  uniforms.u_phase.value = phase
  lastTime = time;
  frameCount++

  // Update Animations
  for (a of animationQueue) {
    a()
  }

  // Update Renders
  cubeCamera.update(renderer, scene)
  renderer.render(scene, camera);

  // Capture Animation
  // if (frameCount >= 1 && frameCount <= nFrames) {
  //   console.log(frameCount)
  //   let name = 'f' + ('' + frameCount).padStart(6, '0');
  //   copyCanvas(name + '.png')
  // }
  // setTimeout(() => { requestAnimationFrame(animate) }, 250);

  // Capture Single Frame
  // copyCanvas('threeOutput.png')

  requestAnimationFrame(animate)
  // setTimeout(() => { requestAnimationFrame(animate) }, 1000 / 120);
}

console.log('final properties:')
console.log(properties)
camera.aspect = canvas.clientWidth / canvas.clientHeight;
camera.updateProjectionMatrix();
uniforms.u_resolution.value.x = dims.width
uniforms.u_resolution.value.y = dims.height
cubeCamera.update(renderer, scene)
renderer.render(scene, camera);
requestAnimationFrame(animate)