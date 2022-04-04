/*

Disorient Presents: DisorientFont2017 for Javascript

Design: The Eye
Coded by: Jacob Joaquin
Copyright(c) 2017 - Present

Usage:
const points = DisorientFont2017.stringToPoints('DIS\nORI\nENT')

Returns an array of objects. An object stores the x and y of each point.

Example output:
[{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 0}...]

In some systems, the y-axis needs to be inverted. Set the optional invertY
argument to true:

const points = DisorientFont2017.stringToPoints("*!@$\nDIS\nori\nent", true)

*/

/**
 * Disorient Presents: DisorientFont2017 for Javascript
 */
class DisorientFont2017 {
    // Index 0 is the width of the glyph
    // Every value after if a row of the glyph, top down
    static data = {
        'a': [10, 510, 511, 3, 511, 1023, 771, 1023, 511],
        'b': [10, 1022, 1023, 771, 1023, 1023, 771, 1023, 1022],
        'c': [10, 511, 1023, 768, 768, 768, 768, 1023, 511],
        'd': [10, 1022, 1023, 771, 771, 771, 771, 1023, 1022],
        'e': [10, 510, 1023, 771, 1023, 1023, 768, 1022, 510],
        'f': [10, 511, 1023, 768, 1022, 1022, 768, 768, 768],
        'g': [10, 511, 1023, 768, 831, 831, 771, 1023, 511],
        'h': [10, 771, 771, 771, 1023, 1023, 771, 771, 771],
        'i': [2, 3, 3, 0, 3, 3, 3, 3, 3],
        'j': [10, 3, 3, 0, 3, 771, 771, 1023, 510],
        'k': [10, 771, 771, 771, 1022, 1022, 771, 771, 771],
        'l': [10, 768, 768, 768, 768, 768, 768, 1023, 511],
        'm': [10, 1022, 1023, 819, 819, 819, 819, 819, 819],
        'n': [10, 1022, 1023, 771, 771, 771, 771, 771, 771],
        'o': [10, 510, 1023, 771, 771, 771, 771, 1023, 510],
        'p': [10, 1022, 1023, 771, 771, 1023, 1022, 768, 768],
        'q': [10, 510, 1023, 771, 771, 771, 775, 1023, 504],
        'r': [10, 1022, 1023, 771, 771, 1022, 1022, 775, 771],
        's': [10, 511, 1023, 768, 1022, 511, 3, 1023, 1022],
        't': [10, 1023, 1023, 48, 48, 48, 48, 48, 48],
        'u': [10, 771, 771, 771, 771, 771, 771, 1023, 510],
        'v': [10, 771, 771, 771, 771, 771, 775, 1022, 1020],
        'w': [10, 819, 819, 819, 819, 819, 819, 1023, 1022],
        'x': [10, 771, 771, 771, 510, 510, 771, 771, 771],
        'y': [10, 771, 771, 771, 1023, 510, 48, 48, 48],
        'z': [10, 1023, 1023, 3, 511, 1022, 768, 1023, 1023],
        '1': [4, 14, 15, 3, 3, 3, 3, 3, 3],
        '2': [10, 1022, 1023, 3, 511, 1022, 768, 1023, 1023],
        '3': [10, 1022, 1023, 3, 511, 511, 3, 1023, 1022],
        '4': [10, 780, 780, 780, 780, 1023, 511, 12, 12],
        '5': [10, 1023, 1023, 768, 1022, 1023, 3, 1023, 1022],
        '6': [10, 510, 1022, 768, 1022, 1023, 771, 1023, 510],
        '7': [10, 1022, 1023, 3, 3, 3, 3, 3, 3],
        '8': [10, 510, 1023, 771, 1023, 1023, 771, 1023, 510],
        '9': [10, 510, 1023, 771, 1023, 511, 3, 511, 510],
        '0': [10, 510, 1023, 771, 771, 771, 771, 1023, 510],
        '~': [4, 15, 15, 0, 0, 0, 0, 0, 0],
        '`': [3, 6, 7, 3, 0, 0, 0, 0, 0],
        '!': [2, 3, 3, 3, 3, 3, 0, 3, 3],
        '@': [10, 510, 1023, 771, 895, 895, 867, 1023, 510],
        '#': [10, 204, 1023, 1023, 204, 204, 1023, 1023, 204],
        '$': [10, 511, 1023, 816, 1022, 511, 51, 1023, 1022],
        '%': [10, 902, 910, 924, 56, 112, 231, 455, 391],
        '^': [6, 12, 63, 51, 0, 0, 0, 0, 0],
        '&': [10, 504, 1020, 780, 507, 511, 782, 1023, 507],
        '*': [10, 819, 951, 510, 252, 252, 510, 951, 819],
        '(': [4, 3, 7, 14, 12, 12, 14, 7, 3],
        ')': [4, 12, 14, 7, 3, 3, 7, 14, 12],
        '_': [10, 0, 0, 0, 0, 0, 0, 1023, 1023],
        '-': [10, 0, 0, 0, 1023, 1023, 0, 0, 0],
        '+': [10, 48, 48, 48, 1023, 1023, 48, 48, 48],
        '=': [10, 0, 1023, 1023, 0, 0, 1023, 1023, 0],
        '[': [4, 15, 15, 12, 12, 12, 12, 15, 15],
        '{': [4, 3, 7, 6, 12, 12, 6, 7, 3],
        '}': [4, 12, 14, 6, 3, 3, 6, 14, 12],
        ']': [4, 15, 15, 3, 3, 3, 3, 15, 15],
        '|': [2, 3, 3, 3, 3, 3, 3, 3, 3],
        '\\': [8, 192, 224, 112, 56, 28, 14, 7, 3],
        ':': [2, 0, 3, 3, 0, 0, 3, 3, 0],
        ';': [2, 0, 3, 3, 0, 0, 3, 3, 3],
        '\'': [2, 3, 3, 3, 3, 0, 0, 0, 0],
        '"': [5, 27, 27, 27, 27, 0, 0, 0, 0],
        '<': [5, 3, 7, 14, 28, 28, 14, 7, 3],
        '>': [5, 24, 28, 14, 7, 7, 14, 28, 24],
        '?': [10, 510, 1023, 771, 63, 62, 0, 48, 48],
        ',': [2, 0, 0, 0, 0, 3, 3, 3, 3],
        '.': [2, 0, 0, 0, 0, 0, 0, 3, 3],
        '/': [8, 3, 7, 14, 28, 56, 112, 224, 192],
    }
    
    static #getCharPoints(c, xOffset = 0, yOffset = 0) {
        const data = this.data[c]
        const width = data[0]
        const pointList = []

        for (let row = 1; row < data.length; row++) {
            const n = data[row]

            for (let col = 0; col < width; col++) {
                const shift = (width - 1) - col
                if ((n >> shift) & 1) {
                    pointList.push({ x: col + xOffset, y: row - 1 + yOffset })
                }
            }
        }

        return pointList
    }

    /**
     * Converts a string to an array of {x, y} objects.
     * @param {string} s A String
     * @param {boolean} invertY Invert y-axis. Default false.
     * @returns {Array} An array of {x, y} objects
     */
    static stringToPoints(s, invertY = false) {
        const offset = { x: 0, y: 0 }
        const pointList = []

        for (let c of s) {
            c = c.toLowerCase()

            if (c === '\n') {
                offset.x = 0
                offset.y += 9
                continue
            } else if (!(c in this.data)) {
                continue
            }

            const w = this.data[c][0]
            const points = this.#getCharPoints(c, offset.x, offset.y)
            pointList.push(...points)
            offset.x += w + 1
        }

        if (invertY) {
            pointList.forEach(p => { p.y *= -1 })
        }

        return pointList
    }
}
