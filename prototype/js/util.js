// Constants
const PI = Math.PI;
const TAU = PI * 2;
const axis = {
    x: new THREE.Vector3(1, 0, 0),
    y: new THREE.Vector3(0, 1, 0),
    z: new THREE.Vector3(0, 0, 1)
}
Object.freeze(axis)

// Functions  
function mod(n, m) {
    return ((n % m) + m) % m;
}

function normalMod(value) {
    return value - Math.floor(value);
}

function isFloat(x) {
    return !!(x % 1)
}

function map(value, start1, stop1, start2, stop2) {
    return (value - start1) * (stop2 - start2) / (stop1 - start1) + start2
}

function copyCanvas(filename) {
    // https://stackoverflow.com/questions/27549157/render-and-save-scen-with-three-js-int-png-or-canvas-bitmap
    imgData = renderer.domElement.toDataURL();
  
    // create a new image and add to the document
    // imgNode = document.createElement("img");
    // imgNode.src = imgData;
    // document.body.appendChild(imgNode);
  
    //        alternative way, which downloads the image 
    var link = document.createElement("a");
    link.download = filename;
    link.href = imgData;
    link.click();
  }
  