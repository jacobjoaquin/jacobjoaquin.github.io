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
const vec3 D = vec3(95.047, 100.0, 108.883);

vec3 labToRgb(vec3 L) {
  vec3 v = vec3((L.x + 16.0) / 116.0);
  v.xz = vec2(L.y / 500.0 + v.y, v.y - L.z / 200.0);
  vec3 p = pow(v, vec3(3.0));
  v = mix((v - vec3(16.0 / 116.0)) / vec3(7.787), p, step(vec3(0.008856), p)) * D * 0.01;
  vec3 c = vec3(dot(v, vec3(3.2406, -1.5372, -0.4986)), dot(v, vec3(-0.9689, 1.8758, 0.0415)), dot(v, vec3(0.0557, -0.2040, 1.0570)));
  return mix(vec3(12.92) * c, vec3(1.055) * pow(c, vec3(1.0 / 2.4)) - vec3(0.055), step(vec3(0.0031308), c));
}

vec3 rgbToLab(vec3 v) {
  v = mix(v / vec3(12.92), pow(((v + vec3(0.055)) / vec3(1.055)), vec3(2.4)), step(vec3(0.04045), pow(((v + vec3(0.055)) / vec3(1.055)), vec3(2.4)))) * 100.0;
  v = vec3(dot(v, vec3(0.4124, 0.3576, 0.1805)), dot(v, vec3(0.2126, 0.7152, 0.0722)), dot(v, vec3(0.0193, 0.1192, 0.9505)));
  vec3 p = pow(v / D, vec3(1.0 / 3.0));
  v = mix((vec3(7.787) * v) + vec3((16.0 / 116.0)), p, step(vec3(0.008856), p));
  return vec3((116.0 * v.y) - 16.0, 500.0 * (v.x - v.y), 200.0 * (v.y - v.z));
}

vec3 getLab(float v) {
  int p = 0;

  for (int i = 0; i < LENGTH; i++) {
    if (v >= dataArray[i].position && v < dataArray[i + 1].position) {
      p = i;
      break;
    }
  }

  float p0 = dataArray[p].position;
  float p1 = dataArray[p + 1].position;
  return labToRgb(mix(rgbToLab(dataArray[p].color), rgbToLab(dataArray[p + 1].color), (v - p0) / (p1 - p0)));
}

void main() {
  gl_FragColor = vec4(getLab(gl_FragCoord.x / u_resolution.x), 1.0);
}`
  return template
}