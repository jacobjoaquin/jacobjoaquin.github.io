const vShader = `
varying vec3 pixPosition; 

void main() {
    pixPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}`

function generateShader(palette) {
  const div = (R.random_num(8, 32)).toFixed(1)
  const crush = P.crush ? `colorTable = floor(colorTable * ${div}) / ${div};` : ''
  const spiral = P.spiral ? `colorTable = mod(colorTable + atan(pixPosition.y, pixPosition.x) / TAU, 1.0);` : ''
  const opArt = P.opArt ? 'colorTable += step(0.5, mod(pixPosition.z * 0.1 + st.x * u_opArtX + st.y * u_opArtY + phase, 1.0)) * phase;' : ''
  let spirit = ''
  if (P.spirit) {
    spirit = `
    float dist = focalPixDistance * (1.0 / 256.0);  // TODO: 256.0 is potential modulation input
    colorTable += sin(dist * u_spiritDist) * cos(pixPosition.z) * u_spiritCoef;
    colorTable = mod(colorTable, 1.0);`
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
  colorTable += envWaitRise(mod(focalPixDistance * ${P.bandfreq} + phase, 1.0), u_bandwidth) * u_thinDensity;

  ${spiral}
  ${crush}
  ${opArt}
  ${spirit}

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

