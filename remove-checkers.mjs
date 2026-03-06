import sharp from 'sharp';
import fs from 'fs';

async function processImage(inputPath, outputPath) {
    console.log(`Processing: ${inputPath}`);
    const img = sharp(inputPath);
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

    // Find top 2 colors in the top 50x50 block
    const edgeColors = new Map();
    const w = Math.min(50, info.width);
    const h = Math.min(50, info.height);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const i = (y * info.width + x) * info.channels;
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const key = `${r},${g},${b}`;
            edgeColors.set(key, (edgeColors.get(key) || 0) + 1);
        }
    }
    const topEdgeColors = [...edgeColors.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    console.log(`Top edge colors:`, topEdgeColors);

    // Assume the two most common colors in the top corner are the checkerboard colors
    const bgColors = topEdgeColors.slice(0, 2).map(([k]) => k.split(',').map(Number));
    console.log(`Detected checkerboard colors:`, bgColors);

    // A pixel is background if it's close to either bgColor
    const tolerance = 15;
    const isBg = (r, g, b) => {
        for (const [br, bg, bb] of bgColors) {
            if (Math.abs(r - br) < tolerance &&
                Math.abs(g - bg) < tolerance &&
                Math.abs(b - bb) < tolerance) {
                return true;
            }
        }
        return false;
    };

    // If channel count doesn't have alpha, we need to create a 4-channel buffer
    const outData = Buffer.alloc(info.width * info.height * 4);
    for (let i = 0, j = 0; i < data.length; i += info.channels, j += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        outData[j] = r;
        outData[j + 1] = g;
        outData[j + 2] = b;
        // alpha:
        if (isBg(r, g, b) && r > 100 && g > 100 && b > 100) {
            outData[j + 3] = 0; // Transparent
        } else {
            outData[j + 3] = info.channels === 4 ? data[i + 3] : 255; // Keep original alpha or solid
        }
    }

    await sharp(outData, { raw: { width: info.width, height: info.height, channels: 4 } })
        .png()
        .toFile(outputPath);
    console.log(`Saved: ${outputPath}`);
}

async function run() {
    await processImage('D:/Web Technologies/Projects/Saarway/Resources/Logo/Saarway - Logo without Text.png', 'c:/Users/Salman/Desktop/saarway-livestock-hub/public/images/logo-icon.png');
    await processImage('D:/Web Technologies/Projects/Saarway/Resources/Logo/Saarway - Logo with text.png', 'c:/Users/Salman/Desktop/saarway-livestock-hub/public/images/logo-full.png');
}

run().catch(console.error);
