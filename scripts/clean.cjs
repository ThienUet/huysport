const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const targets = [
  'node_modules',
  'huysports_admin/node_modules',
  'huysports_admin/dist',
  'huysports_be/node_modules',
  'huysports_be/dist',
  'huysports_client/node_modules',
  'huysports_client/.next',
  'huysports_client/out',
  '.turbo'
];

console.log('🧹 Dang don dep tat ca thu muc node_modules va build artifacts...');

targets.forEach((target) => {
  const fullPath = path.join(rootDir, target);
  if (fs.existsSync(fullPath)) {
    try {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`✅ Da xoa: ${target}`);
    } catch (err) {
      console.error(`❌ Khong the xoa ${target}:`, err.message);
    }
  } else {
    console.log(`⏭️  Bo qua (khong ton tai): ${target}`);
  }
});

console.log('✨ Hoan tat! Tat ca node_modules va build cache da duoc don sach.');
