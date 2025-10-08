const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
const svgContent = `
<svg width="192" height="192" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" fill="#4F46E5"/>
  <text x="96" y="96" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">
    AI4D
  </text>
</svg>
`;

// Save SVG first
const svgPath = path.join(__dirname, '../public/images/icons/icon.svg');
if (!fs.existsSync(path.dirname(svgPath))) {
  fs.mkdirSync(path.dirname(svgPath), { recursive: true });
}
fs.writeFileSync(svgPath, svgContent);

// Create all required icon sizes from the manifest
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconDir = path.join(__dirname, '../public/images/icons');

sizes.forEach(size => {
  const pngPath = path.join(iconDir, `icon-${size}x${size}.png`);
  fs.writeFileSync(pngPath, svgContent.replace(/192/g, size));
});

// Create maskable icons
sizes.filter(size => [192, 512].includes(size)).forEach(size => {
  const maskablePath = path.join(iconDir, `maskable-icon-${size}x${size}.png`);
  const maskableSvg = `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#4F46E5" rx="${size * 0.15}"/>
  <text x="${size/2}" y="${size/2}" font-family="Arial, sans-serif" font-size="${size/6}" fill="white" text-anchor="middle" dominant-baseline="middle">
    AI4D
  </text>
</svg>
`;
  fs.writeFileSync(maskablePath, maskableSvg);
});

// Create shortcut icons
const day1Svg = `
<svg width="96" height="96" xmlns="http://www.w3.org/2000/svg">
  <rect width="96" height="96" fill="#10B981" rx="10"/>
  <text x="48" y="48" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" dominant-baseline="middle">
    D1
  </text>
</svg>
`;
fs.writeFileSync(path.join(iconDir, 'day1-96x96.png'), day1Svg);

const continueSvg = `
<svg width="96" height="96" xmlns="http://www.w3.org/2000/svg">
  <rect width="96" height="96" fill="#F59E0B" rx="10"/>
  <text x="48" y="40" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle">
    Play
  </text>
  <polygon points="38,50 38,60 58,55" fill="white"/>
</svg>
`;
fs.writeFileSync(path.join(iconDir, 'continue-96x96.png'), continueSvg);

// Create badge icon
const badgeSvg = `
<svg width="72" height="72" xmlns="http://www.w3.org/2000/svg">
  <circle cx="36" cy="36" r="36" fill="#4F46E5"/>
  <text x="36" y="36" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" dominant-baseline="middle">
    AI
  </text>
</svg>
`;

const badgePath = path.join(iconDir, 'badge-72x72.png');
fs.writeFileSync(badgePath, badgeSvg);

console.log('Icon placeholders created successfully!');