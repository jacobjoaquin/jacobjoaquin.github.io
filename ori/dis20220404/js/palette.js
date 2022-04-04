function colorsToPalette(list) {
    const positionColorList = []
    for (let i = 0; i < list.length; i++) {
        positionColorList.push({ position: i / (list.length - 1), color: new THREE.Color('#' + list[i]) })
    }
    return positionColorList
}

function positionColorsToPalette(list) {
    const positionColorList = []
    positionColorsToLists(list)

    for (const data of list) {
        positionColorList.push({ position: data.position, color: new THREE.Color('#' + data.color) })
    }
    return positionColorList
}

function colorListsToPalette(positions, colors) {
    const positionColorList = []
    for (let i = 0; i < colors.length; i++) {
        positionColorList.push({ position: positions[i], color: new THREE.Color('#' + colors[i]) })
    }
    return positionColorList
}

// TODO: Remove me once everthing is converted
function positionColorsToLists(list) {
    let p = []
    let c = []
    for (const o of list) {
        p.push(o.position)
        const color = '\'' + o.color + '\''
        c.push(color)
    }
    console.log('const positions = [' + p.join(', ') + ']')
    console.log('const colors = [' + c.join(', ') + ']')
}

const paletteDict = {
    prismatics: () => {
        return colorListsToPalette([0, 0.25, 0.31, 0.37, 0.45, 0.5, 0.6, 0.75, 0.88, 1],
            ['000000', '2c0012', '88032f', 'de291e', 'e3bd0c', '39b7a9', '2b4ec9', '2b134d', '1b051b', '000000'])
    },
    pinkOrangeGlow: () => {
        return colorListsToPalette([0, 0.3, 0.4, 0.48, 0.52, 0.6, 0.7, 1],
            ['101010', '460000', '9f2260', 'ff2a93', 'c6fcff', 'ff6600', '460000', '101010'])
    },
    pinkOrange: () => {
        return colorListsToPalette([0, 0.3, 0.4, 0.48, 0.52, 0.6, 0.7, 1],
            ['9f2260', 'ff2a93', 'ff6600', '9f2260'])
    }
}
