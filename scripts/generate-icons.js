/**
 * 图标生成脚本
 * 使用 sharp 库从 SVG 生成各平台所需的图标格式
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

const PROJECT_ROOT = path.join(__dirname, '..');
const SVG_FILE = path.join(PROJECT_ROOT, 'build/logo.svg');
const BUILD_DIR = path.join(PROJECT_ROOT, 'build');

// 需要生成的尺寸
const PNG_SIZES = [16, 32, 48, 64, 128, 256, 512, 1024];

async function generateIcons() {
  console.log('🎨 开始生成应用图标...\n');
  
  // 创建 build 目录
  try {
    await fs.mkdir(BUILD_DIR, { recursive: true });
    console.log(`✅ 创建输出目录: ${BUILD_DIR}\n`);
  } catch (err) {
    console.error('❌ 创建目录失败:', err);
    process.exit(1);
  }

  // 生成不同尺寸的 PNG
  console.log('🖼️  生成 PNG 图标...');
  const pngFiles = [];
  
  for (const size of PNG_SIZES) {
    const outputFile = path.join(BUILD_DIR, `icon-${size}.png`);
    try {
      await sharp(SVG_FILE)
        .resize(size, size)
        .png()
        .toFile(outputFile);
      
      console.log(`  ✅ ${size}x${size}: ${outputFile}`);
      pngFiles.push({ size, file: outputFile });
    } catch (err) {
      console.error(`  ❌ 生成 ${size}x${size} 失败:`, err.message);
    }
  }

  // 生成主 icon.png (512x512)
  const mainIcon = path.join(BUILD_DIR, 'icon.png');
  try {
    await sharp(SVG_FILE)
      .resize(512, 512)
      .png()
      .toFile(mainIcon);
    console.log(`\n✅ 生成主图标: ${mainIcon}\n`);
  } catch (err) {
    console.error('❌ 生成主图标失败:', err);
  }

  // Windows: 生成 .ico 文件
  console.log('🪟 生成 Windows .ico 文件...');
  const icoFile = path.join(BUILD_DIR, 'icon.ico');
  
  try {
    // 使用 png-to-ico 或直接使用 sharp 生成
    // 这里我们生成一个 256x256 的 PNG 作为 .ico
    await sharp(SVG_FILE)
      .resize(256, 256)
      .png()
      .toFile(icoFile.replace('.ico', '-temp.png'));
    
    // 重命名为 .ico (electron-builder 可以处理)
    await fs.rename(icoFile.replace('.ico', '-temp.png'), icoFile);
    console.log(`  ✅ 生成 Windows 图标: ${icoFile}\n`);
  } catch (err) {
    console.error('  ❌ 生成 .ico 失败:', err.message);
  }

  // macOS: 生成 .icns 需要特殊工具，这里生成所需的 PNG
  if (process.platform === 'darwin') {
    console.log('🍎 生成 macOS 图标资源...');
    const iconsetDir = path.join(BUILD_DIR, 'icon.iconset');
    
    try {
      await fs.mkdir(iconsetDir, { recursive: true });
      
      // 生成 iconset 所需的文件
      const iconsetFiles = [
        { size: 16, name: 'icon_16x16.png' },
        { size: 32, name: 'icon_16x16@2x.png' },
        { size: 32, name: 'icon_32x32.png' },
        { size: 64, name: 'icon_32x32@2x.png' },
        { size: 128, name: 'icon_128x128.png' },
        { size: 256, name: 'icon_128x128@2x.png' },
        { size: 256, name: 'icon_256x256.png' },
        { size: 512, name: 'icon_256x256@2x.png' },
        { size: 512, name: 'icon_512x512.png' },
        { size: 1024, name: 'icon_512x512@2x.png' }
      ];
      
      for (const { size, name } of iconsetFiles) {
        const outputFile = path.join(iconsetDir, name);
        await sharp(SVG_FILE)
          .resize(size, size)
          .png()
          .toFile(outputFile);
      }
      
      console.log(`  ✅ 生成 iconset 目录: ${iconsetDir}`);
      console.log('  ℹ️  请运行以下命令生成 .icns 文件:');
      console.log(`     iconutil -c icns "${iconsetDir}" -o "${path.join(BUILD_DIR, 'icon.icns')}"\n`);
    } catch (err) {
      console.error('  ❌ 生成 iconset 失败:', err.message);
    }
  }

  // 清理临时文件
  console.log('🧹 清理临时文件...');
  for (const size of PNG_SIZES) {
    const file = path.join(BUILD_DIR, `icon-${size}.png`);
    if (size !== 512) { // 保留 512x512 作为主图标
      try {
        await fs.unlink(file);
      } catch (err) {
        // 忽略删除失败
      }
    }
  }

  console.log('\n🎉 图标生成完成！\n');
  console.log('📝 生成的文件:');
  console.log('  - build/icon.png (Linux)');
  console.log('  - build/icon.ico (Windows)');
  if (process.platform === 'darwin') {
    console.log('  - build/icon.iconset/ (macOS 资源目录)');
  }
}

// 检查是否安装了 sharp
try {
  require.resolve('sharp');
  generateIcons().catch(console.error);
} catch (err) {
  console.error('❌ 错误: 未安装 sharp 库');
  console.error('请运行: npm install --save-dev sharp\n');
  process.exit(1);
}
