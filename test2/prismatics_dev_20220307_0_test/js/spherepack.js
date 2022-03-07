function distance(x = 0, y = 0, z = 0, x1 = 0, y1 = 0, z1 = 0) {
    x = x - x1
    y = y - y1
    z = z - z1
    return Math.sqrt(x * x + y * y + z * z)
}

function spherePack(maxRadius, minRadius, reduceRatio, maxTries, output = []) {
    const width = 1
    const height = 1

    // const output = []
    let r = maxRadius
    let triesLeft = maxTries

    while (r >= minRadius && triesLeft > 0) {
        let x = R.random_num(r, width - r);
        let y = R.random_num(r, height - r);
        // let z = R.random_num(r, height - r);
        let z = 0

        let doesIntersect = false;
        for (let i = 0; i < output.length; i++) {
            let c = output[i];
            let d = distance(x, y, z, c.x, c.y, c.z);

            if (d < r + c.r) {
                doesIntersect = true;
                break;
            }
        }

        if (!doesIntersect) {
            output.push({ x: x, y: y, z: z, r: r });
            triesLeft = maxTries;
        }

        triesLeft--;
        if (triesLeft == 0) {
            r *= reduceRatio;
            triesLeft = maxTries;
        }
    }
    return output;
}