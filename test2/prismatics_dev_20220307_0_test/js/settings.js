// ArtBlock Token
// const seed = 6185289928179352
// const seed = 3983006560940002
// const seed = 5575102122714546
// const seed = 6494479197647369
const seed = -1
let tokenGeneration = genTokenData(123, seed)
tokenData = tokenGeneration[0]
console.log(`seed: ${tokenGeneration[1]}`)
const R = new Random()
console.log(R)


// Mode lists
const artModeList = ['random', 'keeper', 'vas', 'relationship']
const paletteList = ['prismatics', 'prismaticfade', 'pinkband', 'purpleband', 'orangewave']
const gradientList = ['gradient', 'crush']
const stageList = ['plane', 'box', 'tunnel']
const propList = ['orb', 'spherePack2', 'grid']
const propShapeList = ['n/a', 'sphere', 'ring']
const propMaterialList = ['cubecamera', 'sm']
const propGlassList = ['reflect', 'refract']
const opArtList = ['none', 'opArt']
const spiritList = ['none', 'spirit']
const animationList = ['none', 'magician', 'pong']


function createBaseProperties(override) {
    const properties = {
        cameraFOV: R.random_num(60, 120),
        palette: R.random_choice(paletteList),
        gradient: R.random_choice(gradientList),
        stage: R.random_choice(stageList),
        prop: R.random_choice(propList),
        propShape: R.random_choice(propShapeList),
        propMaterial: R.random_choice(propMaterialList),
        orbRadius: R.random_num(40, 80),
        glass: R.random_choice(propGlassList),
        spiral: R.random_bool(0.5),
        focalAngle: R.random_dec() * TAU,
        focalLength: R.random_num(0, 100),
        focalZ: R.random_choice([0, -300, -3000]),
        smudge: { x: R.random_dec(), y: R.random_dec(), z: R.random_dec() },
        bandwidth: R.random_num(0.1, 0.9),
        bandfreq: R.random_num(0.05, 0.0005),
        opArt: R.random_choice(opArtList),
        opArtX: R.random_num(-16, 16),
        opArtY: R.random_num(-16, 16),
        shaderNoise: R.random_choice(['i', 'ii']),
        spirit: R.random_bool(0.5),
        spiritDist: R.random_num(1, 200),
        spiritCoef: R.random_num(0.01, 0.2),
        animation: R.random_choice(animationList),
    }

    // Overrides

    // Set opARt properties to 0 part of the time
    if (R.random_bool(0.5)) {
        properties.opArtX = 0
        properties.opArtY = 0
    }

    return { ...properties, ...override() }
}

const artModes = {
    random: () => { return {} },
    keeper: () => {
        return {
            cameraFOV: R.random_num(60, 100),
            gradient: 'gradient',
            stage: R.random_choice(['box', 'tunnel']),
            prop: R.random_choice(['grid', 'spherePack2']),

            properMaterial: 'cubecamera',
            glass: 'reflect',

            shaderNoise: 'ii',
            opArt: 'none',
            spirit: false,
        }
    },
    vas: () => {
        return {
            // cameraFOV: 69.59827748592943,
            cameraFOV: 100,
            bandfreq: 0.010669854145962745,
            bandwidth: 0.41395691428333525,
            focalAngle: 5.455521747875892,
            focalLength: 161.27318097278476,
            focalZ: -3000,
            glass: "refract",
            gradient: "gradient",
            // palette: "prismatics",
            prop: "orb",
            propMaterial: "sm",
            propShape: "n/a",
            smudge: { x: 0.11810357472859323, y: 0.3994714298751205, z: 0.5733378233853728 },
            stage: "box",
            shaderNoise: 'i',
        }
    },
    relationship: () => {
        return {
            animation: 'pong',
            // stage: 'box',
            prop: 'orb',
            cameraFOV: 120,
        }
    },
}




function setArtMode(mode) {
    console.log(mode)
    return createBaseProperties(artModes[mode])
}
