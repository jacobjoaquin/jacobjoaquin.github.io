// Canvas
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({ canvas });
const dims = getClientDim(renderer)

// Scene
const scene = new THREE.Scene();

// Camera
const fov = 10;
const aspect = 1;
const near = 0.1;
const far = 1000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
const cameraOrtho = new THREE.OrthographicCamera(-250, 250, 250, -250, 1, 10000);
camera.position.z = 200

// Set Lights
const ambientLight = new THREE.AmbientLight(0xffffff)
scene.add(ambientLight)

// Palette
// let palette = paletteDict['prismatics']()
const paletteChoice = choice(['pinkOrangeGlow', 'pinkOrange'])
let palette = paletteDict[paletteChoice]()
// let palette = paletteDict['pinkOrange']()

// Set Shaders
const labShader = new MakeShader(
  renderer,
  { x: 1024, y: 1 },
  textureVShader,
  generateTexture(palette),
  {
    u_resolution: { value: { x: 1024, y: 1 } },
  }
)

// Materials
const uniforms = {
  u_resolution: { value: { x: dims.width, y: dims.height } },
  u_phase: { value: 0 },
  u_texture: { type: 't', value: labShader.getTexture().texture },
  u_angles: { value: choice([0.0, 2.0, 4.0, 5.0, 6.0, 8.0, 12.0]) },
  u_dist: { value: choice([0.1, 0.5, 1.0, 2.0]) },
  u_modFreq: { value: choice([0.0, 1.0, 2.0, 4.0, 8.0, 16.0, 32.0, 64.0, 128.0]) },
  u_modAmp: { value: choice([1.0, 2.0, 4.0, 8.0, 16.0, 32.0]) },
  u_noiseAmp: { value: Math.random() * 0.3 },
}

console.log(uniforms)

const shaderCode = generateShader(palette)

const sm = new THREE.ShaderMaterial({
  vertexShader: textureVShader,
  fragmentShader: shaderCode,
  uniforms
});

// Plane for large shader background
const geometry = new THREE.PlaneGeometry(400, 400)
const mesh = new THREE.Mesh(geometry, sm)
mesh.position.z = -500
scene.add(mesh);

// Set Disorient

const material = new THREE.MeshPhongMaterial({
  color: 0xffffff,
  flatShading: true,
});

function setDisorient() {
  const phrase = 'dis\nori\nent'
  const points = DisorientFont2017.stringToPoints(phrase, true)
  const xPoints = []
  const yPoints = []
  for (const p of points) {
    xPoints.push(p.x)
    yPoints.push(p.y)
  }
  console.log(xPoints)
  const xMax = Math.max(...xPoints)
  const yMin = Math.min(...yPoints)
  console.log(xMax)
  console.log(yMin)

  const meshGroup = new THREE.Object3D()
  const s = 0.5

  for (const o of points) {
    o.x -= xMax / 2
    o.y -= yMin / 2
    o.x *= s
    o.y *= s
    o.r *= s
    o.z = 0
  }
  const geoRadius = s / 2
  const sphereSize = 1
  const sphereGeometry = new THREE.SphereGeometry(geoRadius, 128 * sphereSize, 64 * sphereSize)

  for (const o of points) {
    let m = new THREE.Mesh(sphereGeometry, material)
    m.position.set(o.x, o.y, o.z)
    meshGroup.add(m)
  }

  return meshGroup
}

scene.add(setDisorient())

function animate() {
  if (resizeRendererToDisplaySize(renderer)) {
    updateSizeOfCanvas()
  }

  t = Date.now()
  const period = 4000
  uniforms.u_phase.value = (t % period) / period;

  renderer.render(scene, camera);
  requestAnimationFrame(animate)
}

console.log('start')
requestAnimationFrame(animate)