import sharp from 'sharp';

async function processLogo(inputPath, outputPath) {
    console.log(`Processing strict checkerboard removal for: ${inputPath}`);
    const img = sharp(inputPath);
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

    // Convert to 4 channels
    const outData = Buffer.alloc(info.width * info.height * 4);

    for (let i = 0, j = 0; i < data.length; i += info.channels, j += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        outData[j] = r;
        outData[j + 1] = g;
        outData[j + 2] = b;

        // Solid if it's not light grey or white
        let isLight = r > 180 && g > 180 && b > 180;

        if (isLight) {
            // Also check if it's roughly neutral (grey/white) to not kill light colors if there are any
            if (Math.abs(r - g) < 30 && Math.abs(g - b) < 30) {
                outData[j + 3] = 0; // Transparent
            } else {
                outData[j + 3] = info.channels === 4 ? data[i + 3] : 255;
            }
        } else {
            // Check for semi-transparent edge smoothing
            if (r > 150 && g > 150 && b > 150 && Math.abs(r - g) < 30 && Math.abs(g - b) < 30) {
                // fade out edge
                outData[j + 3] = Math.max(0, 255 - (r - 150) * 2.5);
            } else {
                outData[j + 3] = info.channels === 4 ? data[i + 3] : 255; // Keep alpha or solid
            }
        }
    }

    await sharp(outData, { raw: { width: info.width, height: info.height, channels: 4 } })
        .png()
        .toFile(outputPath);
    console.log(`Saved: ${outputPath}`);
}

async function run() {
    await processLogo('D:/Web Technologies/Projects/Saarway/Resources/Logo/Saarway - Logo without Text.png', 'c:/Users/Salman/Desktop/saarway-livestock-hub/public/images/logo-icon.png');
    await processLogo('D:/Web Technologies/Projects/Saarway/Resources/Logo/Saarway - Logo with text.png', 'c:/Users/Salman/Desktop/saarway-livestock-hub/public/images/logo-full.png');
}

run().catch(console.error);
