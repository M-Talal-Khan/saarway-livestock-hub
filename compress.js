const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = 'public/images/home_slider';

fs.readdirSync(dir).filter(f => f.endsWith('.png')).forEach(file => {
    const inPath = path.join(dir, file);
    const outPath = path.join(dir, file.replace('.png', '.webp'));

    sharp(inPath)
        .webp({ quality: 80 })
        .toFile(outPath)
        .then(info => {
            console.log(`Converted ${file} to WebP:`, info);
        })
        .catch(err => {
            console.error(`Error converting ${file}:`, err);
        });
});
