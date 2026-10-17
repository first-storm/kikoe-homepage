import sharp from 'sharp';
const heading = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="630" fill="#fafafa"/><text x="72" y="120" fill="#1c64aa" font-family="sans-serif" font-size="34" font-weight="700">Kikoe</text><text x="72" y="207" fill="#251f32" font-family="sans-serif" font-size="48" font-weight="700"><tspan x="72">Your conversations,</tspan><tspan x="72" dy="60">turned into useful notes.</tspan></text><text x="72" y="345" fill="#625d65" font-family="sans-serif" font-size="24">Cloud or on your device. Free and open source.</text></svg>`);
const screenshot = await sharp('src/assets/hero-light.png').resize(730).toBuffer();
const icon = await sharp('src/assets/kikoe.svg').resize(100,100).toBuffer();
await sharp(heading).composite([{input:screenshot,left:398,top:384},{input:icon,left:1028,top:60}]).png().toFile('public/social.png');
await sharp('src/assets/kikoe.svg').resize(180,180).png().toFile('public/apple-touch-icon.png');
