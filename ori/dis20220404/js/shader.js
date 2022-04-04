// Shader
// https://pandaqitutorials.com/Games/9-three-js-complete-glsl-tutorial

class MakeShader {
  constructor(renderer, dims, vShader, fShader, uniforms) {
    this.renderer = renderer
    this.texture = new THREE.WebGLRenderTarget(dims.x, dims.y);
    this.geometry = new THREE.PlaneGeometry(1024, 1024)
    this.camera = new THREE.PerspectiveCamera(1200, 1, 0.1, 200)
    this.scene = new THREE.Scene();
    this.uniforms = uniforms
    this.material = new THREE.ShaderMaterial({
      vertexShader: vShader,
      fragmentShader: fShader,
      uniforms: this.uniforms,
    })
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.position.z = -200
    this.scene.add(this.mesh)
    this.update()
  }

  update() {
    this.renderer.setRenderTarget(this.texture)
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);
  }

  getTexture() {
    return this.texture
  }
}

const vShader = `varying vec3 pixPosition; 
varying vec3 vNormal;
void main() {
    pixPosition = position;
    vNormal = normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}`

const textureVShader = `void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`

function generateShader(palette) {
  const template = `
#ifdef GL_ES
precision mediump float;
#endif

#define TAU 6.283185307179586
#define PI 3.141592653589793


uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_phase;
uniform float u_angles;
uniform float u_dist;
uniform float u_modFreq;
uniform float u_modAmp;
uniform float u_noiseAmp;


highp float rand(vec2 co) {
  //http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
  highp float a = 12.9898;
  highp float b = 78.233;
  highp float c = 43758.5453;
  highp float dt = dot(co, vec2(a, b));
  // highp float sn = mod(dt, 3.14);
  highp float sn = mod(dt, PI);  // Higher precision of PI than original
  return fract(sin(sn) * c);
}

float envWaitRise(float v, float p0) {
  return clamp((v - p0) / (1.0 - p0), 0.0, 1.0);
}

mat2 rotate2d(float _angle){
  // https://thebookofshaders.com/08/
  return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
}

// float random (vec2 st) {
//   return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
// }

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
// https://thebookofshaders.com/11/
float noise (vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = rand(i);
    float b = rand(i + vec2(1.0, 0.0));
    float c = rand(i + vec2(0.0, 1.0));
    float d = rand(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);
    // y = x*x*x*(x*(x*6.-15.)+10.);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

vec3 random3(vec3 c) {
  // https://thebookofshaders.com/edit.php#11/iching-03.frag
  float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
  vec3 r;
  r.z = fract(512.0*j);
  j *= .125;
  r.x = fract(512.0*j);
  j *= .125;
  r.y = fract(512.0*j);
  return r-0.5;
}

const float F3 =  0.3333333;
const float G3 =  0.1666667;
float snoise(vec3 p) {
  // https://thebookofshaders.com/edit.php#11/iching-03.frag

  vec3 s = floor(p + dot(p, vec3(F3)));
  vec3 x = p - s + dot(s, vec3(G3));

  vec3 e = step(vec3(0.0), x - x.yzx);
  vec3 i1 = e*(1.0 - e.zxy);
  vec3 i2 = 1.0 - e.zxy*(1.0 - e);

  vec3 x1 = x - i1 + G3;
  vec3 x2 = x - i2 + 2.0*G3;
  vec3 x3 = x - 1.0 + 3.0*G3;

  vec4 w, d;

  w.x = dot(x, x);
  w.y = dot(x1, x1);
  w.z = dot(x2, x2);
  w.w = dot(x3, x3);

  w = max(0.6 - w, 0.0);

  d.x = dot(random3(s), x);
  d.y = dot(random3(s + i1), x1);
  d.z = dot(random3(s + i2), x2);
  d.w = dot(random3(s + 1.0), x3);

  w *= w;
  w *= w;
  d *= w;

  return dot(d, vec4(52.0));
}

vec2 kaleidoscope2d(vec2 v) {
  v -= 0.5;
  v = abs(v);
  v += 0.5;
  return v;
}

float triangle(float t) {
  t /= TAU;
  return 4.0 * abs(t - floor(t + 0.75) + 0.25) - 1.0;
}

void main() {
  float aspect = u_resolution.x / u_resolution.y;
  vec3 st = gl_FragCoord.xyz;
  st.xy /= u_resolution;
 
  // Correct aspect
  st.x = ((st.x - 0.5) * (u_resolution.x / u_resolution.y)) + 0.5;  // Correct for aspect

  // Distance
  float d = distance(rotate2d(TAU * u_phase) * st.xy, rotate2d(TAU * u_phase) * vec2(0.5, 0.5));

  vec2 ks = st.xy;

  // Kaleidoscope idea
  float kx = distance(vec2(0.5, 0.5), st.xy) * 4.0 / (d + u_dist);
  float angle = atan(st.y - 0.5, st.x - 0.5);
  float ky = triangle(angle * u_angles + 9.0 / 12.0 * TAU);
  ks = vec2(kx, ky);

  // Noise
  // vec3 stn = st;
  vec3 stn = vec3(ks, st.z);

  // Simplex
  float sn = snoise(stn.xyz) * triangle(st.y * u_modFreq * TAU) * 1.0;

  float amt = d + u_phase + sn;
  amt += rand(vec2(sin(u_phase * TAU) * 0.01 + st.x, cos(u_phase * TAU) * 0.01 + st.y)) * u_noiseAmp;

  // Out
  gl_FragColor = texture(u_texture, vec2(fract(amt), 1.0));  // Main
}`

  return template
}

