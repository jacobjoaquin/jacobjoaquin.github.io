function createGLSLColorRampFromColorList(rampData) {
  const l = rampData.length;
  const output = []
  output.push(`# define LENGTH ${l}`)
  output.push('RampPoint dataArray[LENGTH] = RampPoint[LENGTH] (')

  for (let i = 0; i < l; i++) {
      const data = rampData[i]
      let pos = data.position
      const c = data.color
      pos = isFloat(pos) ? pos : pos.toFixed(1)
      const r = isFloat(c.r) ? c.r : c.r.toFixed(1)
      const g = isFloat(c.g) ? c.g : c.g.toFixed(1)
      const b = isFloat(c.b) ? c.b : c.b.toFixed(1)

      let line = (`\tRampPoint(${pos}, vec3(${r}, ${g}, ${b}))`)
      if (i != rampData.length - 1) {
          line = [line, ''].join()
      }
      output.push(line)
  }

  output.push(');')
  return output.join('\n')
}

function setupTexture() {
  const dims = { width: 1024, height: 1 }
  const texture = new THREE.WebGLRenderTarget(dims.width, dims.height);
  const textureCode = generateTexture(palette)
  const geometry = new THREE.PlaneGeometry(999, 999)
  const camera = new THREE.PerspectiveCamera(90, 1, 0.1, 200)
  const scene = new THREE.Scene();
  const uniforms = { u_resolution: { value: { x: dims.width, y: dims.height } } }
  const material = new THREE.ShaderMaterial({
    vertexShader: textureVShader,
    fragmentShader: textureCode,
    uniforms,
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.z = -200
  scene.add(mesh);
  renderer.setRenderTarget(texture)
  renderer.render(scene, camera);
  renderer.setRenderTarget(null);
  geometry.dispose()
  material.dispose()
  return texture
}

const textureVShader = `
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}`

function generateTexture(palette) {
  const paletteData = createGLSLColorRampFromColorList(palette)
  const template = `
#ifdef GL_ES
precision mediump float;
#endif

struct RampPoint {
  float position;
  vec3 color;
};

${paletteData}

uniform vec2 u_resolution;

const vec3 d65 = vec3(95.047, 100.0, 108.883);

vec3 lab_to_xyz(vec3 lab) {
    float y = (lab.x + 16.0) / 116.0;
    float x = lab.y / 500.0 + y;
    float z = y - lab.z / 200.0;

    float py = pow(y, 3.0);
    if (py > 0.008856) {
        y = py;
    } else {
        y = (y - 16.0 / 116.0) / 7.787;
    }

    float px = pow(x, 3.0);
    if (px > 0.008856) {
        x = px;
    } else {
        x = (x - 16.0 / 116.0) / 7.787;
    }

    float pz = pow(z, 3.0);    
    if (pz > 0.008856) {
        z = pz;
    } else {
        z = (z - 16.0 / 116.0) / 7.787;
    }

    return vec3(x, y, z) * d65;
}
  
vec3 xyz_to_rgb(vec3 v) {
  v *= 0.01;

  float r = dot(v, vec3(3.2406, -1.5372, -0.4986));
  float g = dot(v, vec3(-0.9689, 1.8758, 0.0415));
  float b = dot(v, vec3(0.0557, -0.2040, 1.0570));

  if (r > 0.0031308) {
    r = 1.055 * (pow(r, (1.0 / 2.4))) - 0.055;
  } else {
    r = 12.92 * r;
  }

  if (g > 0.0031308) {
    g = 1.055 * (pow(g, (1.0 / 2.4))) - 0.055;
  } else {
    g = 12.92 * g;
  }

  if (b > 0.0031308) {
    b = 1.055 * (pow(b, (1.0 / 2.4))) - 0.055;
  } else {
    b = 12.92 * b;
  }

  return vec3(r, g, b);
}

vec3 rgb_to_xyz(vec3 rgb) {
  if (rgb.r > 0.04045) {
    rgb.r = pow(((rgb.r + 0.055) / 1.055), 2.4);
  } else {
    rgb.r /= 12.92;
  }

  if (rgb.g > 0.04045) {
    rgb.g = pow(((rgb.g + 0.055) / 1.055), 2.4);
  } else {
    rgb.g /= 12.92;
  }

  if (rgb.b > 0.04045) {
    rgb.b = pow(((rgb.b + 0.055) / 1.055), 2.4);
  } else {
    rgb.b /= 12.92;
  }

  rgb = rgb * 100.0;

  float x = dot(rgb, vec3(0.4124, 0.3576, 0.1805));
  float y = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
  float z = dot(rgb, vec3(0.0193, 0.1192, 0.9505));

  return vec3(x, y, z);
}

  
vec3 xyz_to_lab(vec3 xyz) {
  xyz = xyz / d65;

  float px = pow(xyz.x, 1.0 / 3.0);
  if (px > 0.008856) {
    xyz.x = px;
  } else {
    xyz.x = (7.787 * xyz.x) + (16.0 / 116.0);
  }

  float py = pow(xyz.y, 1.0 / 3.0);
  if (py > 0.008856) {
    xyz.y = py;
  } else {
    xyz.y = (7.787 * xyz.y) + (16.0 / 116.0);
  }

  float pz = pow(xyz.z, 1.0 / 3.0);
  if (pz > 0.008856) {
    xyz.z = pz;
  } else {
    xyz.z = (7.787 * xyz.z) + (16.0 / 116.0);
  }

  float l = (116.0 * xyz.y) - 16.0;
  float a = 500.0 * (xyz.x - xyz.y);
  float b = 200.0 * (xyz.y - xyz.z);

  return vec3(l, a, b);
}

vec3 getRampColor(float v) {
  // Constrain input value
  v = clamp(v, 0.0, 1.0);

  // Get position index of start point
  int p = LENGTH - 1;

  for (int i = 0; i < LENGTH; i++) {
    if (v >= dataArray[i].position && v < dataArray[i + 1].position) {
      p = i;
      break;
    }
  }

  // Get colors
  vec3 color0 = dataArray[p].color;
  vec3 color1 = dataArray[p + 1].color;
  
  // Interpolate between the two colors
  float p0 = dataArray[p].position;
  float p1 = dataArray[p + 1].position;
  float amt = (v - p0) / (p1 - p0);

  return mix(color0, color1, amt);
}

vec3 getRampColorLab(float v) {
  // Constrain input value
  v = clamp(v, 0.0, 1.0);

  // Get position index of start point
  int p = LENGTH - 1;

  for (int i = 0; i < LENGTH; i++) {
    if (v >= dataArray[i].position && v < dataArray[i + 1].position) {
      p = i;
      break;
    }
  }

  // Get colors
  vec3 color0 = dataArray[p].color;
  vec3 color1 = dataArray[p + 1].color;
  
  // Interpolate between the two colors
  float p0 = dataArray[p].position;
  float p1 = dataArray[p + 1].position;
  float amt = (v - p0) / (p1 - p0);

  vec3 c0 = rgb_to_xyz(color0);
  c0 = xyz_to_lab(c0);
  vec3 c1 = rgb_to_xyz(color1);
  c1 = xyz_to_lab(c1);
  c0 = mix(c0, c1, amt);
  c0 = lab_to_xyz(c0);
  c0 = xyz_to_rgb(c0);

  return c0;
}

void main() {
  vec2 st = gl_FragCoord.xy;
  st.xy /= u_resolution;
  gl_FragColor = vec4(getRampColorLab(st.x), 1.0);
}`

  return template
}

