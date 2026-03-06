import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const SRC_DIR = String.raw`D:\Web Technologies\Projects\Saarway\Resources\Logo`;
const DEST_DIR = String.raw`c:\Users\Salman\Desktop\saarway-livestock-hub\public\images`;

async function removeBackground(inputPath, outputPath, threshold = 240) {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    const width = metadata.width;
    const height = metadata.height;

    // Get raw pixel data with alpha
    const rawBuffer = await image.ensureAlpha().raw().toBuffer();

    // Process pixels - make white/near-white pixels transparent
    for (let i = 0; i < rawBuffer.length; i += 4) {
        const r = rawBuffer[i];
        const g = rawBuffer[i + 1];
        const b = rawBuffer[i + 2];

        // Check if pixel is white/near-white
        const isWhite = r >= threshold && g >= threshold && b >= threshold;

        // Check if pixel is light grey (checkerboard pattern from fake transparency)
        const isLightGrey = r >= 190 && g >= 190 && b >= 190 &&
            Math.abs(r - g) < 10 && Math.abs(g - b) < 10;

        if (isWhite || isLightGrey) {
            rawBuffer[i + 3] = 0; // Make fully transparent
        }
    }

    await sharp(rawBuffer, { raw: { width, height, channels: 4 } })
        .png()
        .toFile(outputPath);

    console.log('Processed: ' + path.basename(outputPath));
}

// Process logo icon (without text)
await removeBackground(
    path.join(SRC_DIR, 'Saarway - Logo without Text.png'),
    path.join(DEST_DIR, 'logo-icon.png')
);

// Process full logo (with text)
await removeBackground(
    path.join(SRC_DIR, 'Saarway - Logo with text.png'),
    path.join(DEST_DIR, 'logo-full.png')
);

console.log('All logos processed with true transparency!');
