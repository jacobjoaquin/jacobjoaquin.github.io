// Constants
const PI = Math.PI
const TAU = PI * 2
// const GRATIO = 0.618033988749895
const GRATIO = 0.9
// const GRATIO = R.random_dec()

const axis = {
    x: new THREE.Vector3(1, 0, 0),
    y: new THREE.Vector3(0, 1, 0),
    z: new THREE.Vector3(0, 0, 1)
}

function triangle(t) {
    return 4.0 * Math.abs(t - Math.floor(t + 0.75) + 0.25) - 1.0
}

function forceFloat(v) {
    return isFloat(v) ? v : v.toFixed(1)
}

function fract(value) {
    return value - Math.floor(value)
}

function isFloat(x) {
    return !!(x % 1)
}

function map(value, start1, stop1, start2, stop2) {
    return (value - start1) * (stop2 - start2) / (stop1 - start1) + start2
}

function distance(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function getPerpendicularPoint(a, b, c) {
    const s = ((c.x - a.x) * (b.x - a.x) + (c.y - a.y) * (b.y - a.y)) / ((b.x - a.x) ** 2 + (b.y - a.y) ** 2)
    return { x: a.x + s * (b.x - a.x), y: a.y + s * (b.y - a.y) }
}

function getIntersection(x0, y0, x1, y1, x2, y2, x3, y3) {
    const d = (y3 - y2) * (x1 - x0) - (x3 - x2) * (y1 - y0)
    if (d == 0) return null
    const ua = ((y3 - y2) * (x2 - x0) - (x3 - x2) * (y2 - y0)) / d
    const ub = ((y1 - y0) * (x2 - x0) - (x1 - x0) * (y2 - y0)) / d
    if (ua < 0.0 || ua > 1.0 || ub < 0.0 || ub > 1.0) return null
    return { x: x0 + ua * (x1 - x0), y: y0 + ua * (y1 - y0) }
}
// Functions  
function chance(odds) {
    if (arguments.length === 0) {
        odds = 0.5;
    }
    return Math.random(1.0) < odds;
}

function choice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function rrange(a, b) {
    if (arguments.length === 1) {
        return Math.random() * a;
    } else if (arguments.length === 2) {
        const r = Math.random();
        return (b - a) * r + a;
    }
}

function randint(min, max) {
    // [max] (inclusive)
    // [min, max] (inclusive)
    if (arguments.length == 1) {
        max = min;
        min = 0;
    }
    return Math.floor(((max + 1) - min) * Math.random() + min)
}


function mod(n, m) {
    return ((n % m) + m) % m;
}

function normalMod(value) {
    return value - Math.floor(value);
}

function copyCanvas(filename) {
    // https://stackoverflow.com/questions/27549157/render-and-save-scen-with-three-js-int-png-or-canvas-bitmap
    imgData = renderer.domElement.toDataURL();
  
    // create a new image and add to the document
    imgNode = document.createElement("img");
    imgNode.src = imgData;
    // document.body.appendChild(imgNode);
  
    //        alternative way, which downloads the image 
    var link = document.createElement("a");
    link.download = filename;
    link.href = imgData;
    link.click();
  }
  

  function updateSizeOfCanvas() {
  const canvas = renderer.domElement
  const aspect = canvas.clientWidth / canvas.clientHeight
  camera.aspect = aspect
  camera.updateProjectionMatrix()
  const dims = getClientDim(renderer)
  uniforms.u_resolution.value.x = dims.width
  uniforms.u_resolution.value.y = dims.height
}

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = canvas.clientWidth * pixelRatio | 0;
    const height = canvas.clientHeight * pixelRatio | 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

function getClientDim(render) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    return {
        width: canvas.clientWidth * pixelRatio | 0,
        height: canvas.clientHeight * pixelRatio
    }
}

function createGLSLColorRampFromColorList(colorRamp) {
    const output = []
    output.push(`# define LENGTH ${colorRamp.length}`)
    output.push('RampPoint dataArray[LENGTH] = RampPoint[LENGTH] (')

    for (let i = 0; i < colorRamp.length; i++) {
        const data = colorRamp[i]
        let pos = data.position
        const c = data.color
        pos = forceFloat(pos)
        const r = forceFloat(c.r)
        const g = forceFloat(c.g)
        const b = forceFloat(c.b)

        let line = (`\tRampPoint(${pos}, vec3(${r}, ${g}, ${b}))`)
        if (i != colorRamp.length - 1) {
            line = [line, ''].join()
        }
        output.push(line)
    }

    output.push(');')
    return output.join('\n')
}
