function colorsToPalette(list) {
    const positionColorList = []

    for (let i = 0; i < list.length; i++) {
        const c = new THREE.Color(list[i])
        const pos = i / (list.length - 1)
        positionColorList.push({ position: pos, color: c })
    }

    return positionColorList
}

function positionColorsToPalette(list) {
    const positionColorList = []

    for (const data of list) {
        const pos = data.position
        const c = new THREE.Color(data.color)
        positionColorList.push({ position: pos, color: c })
    }

    return positionColorList
}

const paletteDict = {
    prismatics: () => {
        return positionColorsToPalette([
            { position: 0.0, color: '#000000' },
            { position: 0.25, color: '#2c0012' },
            { position: 0.31, color: '#88032f' },
            { position: 0.37, color: '#de291e' },
            { position: 0.45, color: '#e3bd0c' },
            { position: 0.50, color: '#39b7a9' },
            { position: 0.60, color: '#2b4ec9' },
            { position: 0.75, color: '#2b134d' },
            { position: 0.88, color: '#1b051b' },
            { position: 1.0, color: '#000000' },
        ])
    },
    prismaticfade: () => {
        return positionColorsToPalette([
            { position: 0.0, color: '#221a22' },
            { position: 0.11, color: '#181818' },
            { position: 0.35, color: '#361722' },
            { position: 0.45, color: '#a31b37' },
            { position: 0.55, color: '#afb339' },
            { position: 0.58, color: '#84c07a' },
            { position: 0.61, color: '#2eb2b4' },
            { position: 0.67, color: '#2e69ba' },
            { position: 0.76, color: '#3a2d79' },
            { position: 0.9, color: '#301d39' },
            { position: 1.0, color: '#221a22' },
        ])
    },
    pinkband: () => {
        return positionColorsToPalette([
            { position: 0.0, color: '#fdf5e8' },
            { position: 0.25, color: '#dd00dd' },
            { position: 0.31, color: '#88032f' },
            { position: 0.37, color: '#de291e' },
            { position: 0.45, color: '#e3bd0c' },
            { position: 0.50, color: '#39b7a9' },
            { position: 0.60, color: '#2b4ec9' },
            { position: 0.75, color: '#2b134d' },
            { position: 0.88, color: '#dd00dd' },
            { position: 1.0, color: '#fdf5e8' },
        ])
    },
    purpleband: () => {
        return positionColorsToPalette([
            { position: 0.0, color: '#fdf5e8' },
            { position: 0.25, color: '#8800dd' },
            { position: 0.31, color: '#88032f' },
            { position: 0.37, color: '#de291e' },
            { position: 0.45, color: '#e3bd0c' },
            { position: 0.50, color: '#39b7a9' },
            { position: 0.60, color: '#2b4ec9' },
            { position: 0.75, color: '#2b134d' },
            { position: 0.88, color: '#8800dd' },
            { position: 1.0, color: '#fdf5e8' },
        ])
    },
    orangewave: () => {
        return colorsToPalette(['#242424', '#281579', '#a501d4', '#ff00b4', '#ff910e', '#ff3600', '#242424']);    
    },
    grey: () => {
        return colorsToPalette(['#000000', '#ffffff', '#000000']);    
    },
}
