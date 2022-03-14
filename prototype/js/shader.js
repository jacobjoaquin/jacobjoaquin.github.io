const vShader = `
varying vec3 pixPosition; 

void main() {
    pixPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}`

function generateShader(palette) {
  const div = (R.random_num(8, 32)).toFixed(1)
  const gradientCode = {
    gradient: '',
    crush: `colorTable = floor(colorTable * ${div}) / ${div};`

  }
  const spiralCode = {
    true: `colorTable = mod(colorTable + atan(pixPosition.y, pixPosition.x) / TAU, 1.0);`,
    false: ''
  }
  const opArtCode = {
    none: '',
    opArt: 'colorTable += step(0.5, mod(pixPosition.z * 0.1 + st.x * u_opArtX + st.y * u_opArtY + phase, 1.0)) * phase;',
  }

  const noiseCode = {
    none: '',
    i: `
    // Noise
    vec3 pixPositionOffset = pixPosition + vec3(-1000.0) + (u_random - 0.5) * 1000.0;  
    float n = noise(pixPositionOffset.xy * 0.001 + pixPositionOffset.z * 0.5) * 20.0;
    n = noise(pixPositionOffset.xy * 0.05 + n);
    n = envWaitRise(n, 0.5);
  
    // Simplex
    float sn = snoise((pixPositionOffset + n * 10.0) * 0.05);
    sn = envWaitRise(sn, 0.5);
  
    // Color
    colorTable += sn * 0.5;
    `,
    ii: `
  // Noise
  vec3 pixPositionOffset = pixPosition + vec3(-1000.0) + (u_random - 0.5) * 1000.0;
  float n = noise(pixPositionOffset.xy * 0.00001 + pixPositionOffset.z * 0.05);
  n = noise(pixPositionOffset.xy * 0.05 + n * 10.0);

  // Simplex
  float sn = snoise(vec3(pixPositionOffset * 0.05) + snoise(pixPositionOffset * 0.05));
  sn = envWaitRise(sn, 0.3);

  // Color
  colorTable += sn * 0.25 + n * 0.2;
  `,

  }

  const gradient = gradientCode[properties.gradient]
  const spiral = spiralCode[properties.spiral]
  const opArt = opArtCode[properties.opArt]
  const noiseType = noiseCode[properties.shaderNoise]

  let spirit = ''
  if (properties.spirit) {
    spirit = `
    float dist = focalPixDistance * (1.0 / 256.0);  // TODO: 256.0 is potential modulation input
    colorTable += sin(dist * u_spiritDist) * cos(pixPosition.z) * u_spiritCoef;
    colorTable = mod(colorTable, 1.0);
`
  }

  const template = `
#ifdef GL_ES
precision mediump float;
#endif

#define TAU 6.283185307179586
#define PI 3.141592653589793

varying vec3 pixPosition;

uniform vec2 u_resolution;
uniform float u_phase;
uniform float u_reflections;
uniform vec3 u_random;
uniform vec3 u_focal;
uniform float u_bandwidth;
uniform sampler2D u_texture;
uniform float u_opArtX;
uniform float u_opArtY;
uniform float u_spiritDist;
uniform float u_spiritCoef;
uniform float u_cycleFreq;
uniform float u_thinDensity;

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

// TODO: Not used. Use it or lose it.
float triangle(float t) {
  t /= TAU;
  return 4.0 * abs(t - floor(t + 0.75) + 0.25) - 1.0;
}

void main() {
  float aspect = u_resolution.x / u_resolution.y;
  vec3 st = gl_FragCoord.xyz;
  vec3 fragCoord = gl_FragCoord.xyz;
  st.xy /= u_resolution;
  vec3 stcopy = st;


  float phase = u_phase;
  phase = mod(phase, 1.0);
  
  // TODO: Explore me
  // Phase Modulation
  // phase = 1.0 - phase;
  // phase += envWaitRise(phase, 0.5) * 1.0;
  // phase = (sin(phase * TAU * 1.0) + 1.0) * 0.5;

  // TODO: Remove with caution
  // Correct for Aspect
  // st.x -= 0.5;
  // st.x *= aspect;
  // st.x += 0.5;

  // Globals
  float colorTable = 0.0;
  float zoomCoef = 1.0;  // TODO: Modulation source? Changes Optical
  st.xy -= 0.5;
  st.xy *= zoomCoef;
  float focalPixDistance = distance(u_focal, pixPosition);
  float r = rand(stcopy.xy);

  // Ripples
  // float myModulation = envWaitRise(mod(myOffset * scale + -phase, 1.0), envRisePoint) * nCycles;
  colorTable += envWaitRise(mod(focalPixDistance * 0.002 - phase, 1.0), 0.9);  // TODO: add nCycles
  colorTable += envWaitRise(mod(focalPixDistance * ${properties.bandfreq} + phase, 1.0), u_bandwidth) * u_thinDensity;

  /*${noiseType}*/
  ${spiral}
  ${gradient}
  ${opArt}
  /*${spirit}*/

  // TODO: Remove with caution
  // colorTable += envWaitRise(st.x * 1.0, 0.425);

  // Noise + Palette Cycle
  colorTable += phase * u_cycleFreq;
  colorTable += r * 0.03;
  
  // Out
  gl_FragColor = texture2D(u_texture, vec2(mod(colorTable, 1.0), 1.0));
}`

  return template
}

