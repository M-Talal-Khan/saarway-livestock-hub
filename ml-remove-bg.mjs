import { removeBackground } from '@imgly/background-removal-node';
import fs from 'fs';
import path from 'path';

async function processImage(inputPath, outputPath) {
    console.log(`Processing with ML: ${inputPath}`);
    try {
        const imageBuffer = fs.readFileSync(inputPath);
        // We can pass a buffer
        const blob = new Blob([imageBuffer], { type: 'image/png' });

        // This runs the ML model to perfectly remove background (including checkerboards if it recognizes the foreground object)
        const resultBlob = await removeBackground(blob);

        const buffer = Buffer.from(await resultBlob.arrayBuffer());

        fs.writeFileSync(outputPath, buffer);
        console.log(`Saved: ${outputPath}`);
    } catch (err) {
        console.error(`Failed on ${inputPath}:`, err);
    }
}

async function run() {
    await processImage('D:/Web Technologies/Projects/Saarway/Resources/Logo/Saarway - Logo without Text.png', 'c:/Users/Salman/Desktop/saarway-livestock-hub/public/images/logo-icon.png');
    await processImage('D:/Web Technologies/Projects/Saarway/Resources/Logo/Saarway - Logo with text.png', 'c:/Users/Salman/Desktop/saarway-livestock-hub/public/images/logo-full.png');
}

run().then(() => console.log('Done'));
