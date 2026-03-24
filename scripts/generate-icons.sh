#!/bin/bash

# 图标生成脚本
# 用于将 SVG logo 转换为各平台所需的图标格式

echo "🎨 开始生成应用图标..."

# 检查是否安装了必要的工具
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ 错误: 未找到 $1，请先安装"
        echo "   macOS: brew install $2"
        echo "   Ubuntu: sudo apt install $3"
        return 1
    fi
    return 0
}

# 检查工具
if ! check_command "convert" "imagemagick" "imagemagick"; then
    exit 1
fi

if ! check_command "rsvg-convert" "librsvg" "librsvg2-bin"; then
    echo "⚠️  未找到 rsvg-convert，将使用 ImageMagick（质量可能稍差）"
    USE_IMAGEMAGICK=true
else
    USE_IMAGEMAGICK=false
fi

# 设置路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SVG_FILE="$PROJECT_ROOT/public/assets/logo.svg"
BUILD_DIR="$PROJECT_ROOT/build"

# 创建 build 目录
mkdir -p "$BUILD_DIR"

echo "📁 项目根目录: $PROJECT_ROOT"
echo "📁 SVG 文件: $SVG_FILE"
echo "📁 输出目录: $BUILD_DIR"
echo ""

# 生成不同尺寸的 PNG
generate_png() {
    local size=$1
    local output="$BUILD_DIR/icon-${size}.png"
    
    if [ "$USE_IMAGEMAGICK" = true ]; then
        convert -background none -resize ${size}x${size} "$SVG_FILE" "$output"
    else
        rsvg-convert -w $size -h $size "$SVG_FILE" -o "$output"
    fi
    
    echo "✅ 生成 ${size}x${size} PNG: $output"
}

# 生成标准 PNG 图标
echo "🖼️  生成 PNG 图标..."
generate_png 16
generate_png 32
generate_png 48
generate_png 64
generate_png 128
generate_png 256
generate_png 512
generate_png 1024

# 生成主 icon.png (512x512)
cp "$BUILD_DIR/icon-512.png" "$BUILD_DIR/icon.png"
echo "✅ 生成主图标: $BUILD_DIR/icon.png"
echo ""

# macOS: 生成 .icns 文件
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 生成 macOS .icns 文件..."
    
    ICONSET_DIR="$BUILD_DIR/icon.iconset"
    mkdir -p "$ICONSET_DIR"
    
    # 生成所需的尺寸
    cp "$BUILD_DIR/icon-16.png" "$ICONSET_DIR/icon_16x16.png"
    cp "$BUILD_DIR/icon-32.png" "$ICONSET_DIR/icon_16x16@2x.png"
    cp "$BUILD_DIR/icon-32.png" "$ICONSET_DIR/icon_32x32.png"
    cp "$BUILD_DIR/icon-64.png" "$ICONSET_DIR/icon_32x32@2x.png"
    cp "$BUILD_DIR/icon-128.png" "$ICONSET_DIR/icon_128x128.png"
    cp "$BUILD_DIR/icon-256.png" "$ICONSET_DIR/icon_128x128@2x.png"
    cp "$BUILD_DIR/icon-256.png" "$ICONSET_DIR/icon_256x256.png"
    cp "$BUILD_DIR/icon-512.png" "$ICONSET_DIR/icon_256x256@2x.png"
    cp "$BUILD_DIR/icon-512.png" "$ICONSET_DIR/icon_512x512.png"
    cp "$BUILD_DIR/icon-1024.png" "$ICONSET_DIR/icon_512x512@2x.png"
    
    # 生成 .icns
    iconutil -c icns "$ICONSET_DIR" -o "$BUILD_DIR/icon.icns"
    
    if [ $? -eq 0 ]; then
        echo "✅ 生成 macOS 图标: $BUILD_DIR/icon.icns"
    else
        echo "❌ 生成 .icns 失败"
    fi
    
    # 清理临时文件
    rm -rf "$ICONSET_DIR"
    echo ""
fi

# Windows: 生成 .ico 文件
echo "🪟 生成 Windows .ico 文件..."

if [ "$USE_IMAGEMAGICK" = true ]; then
    convert "$BUILD_DIR/icon-16.png" "$BUILD_DIR/icon-32.png" "$BUILD_DIR/icon-48.png" "$BUILD_DIR/icon-64.png" "$BUILD_DIR/icon-128.png" "$BUILD_DIR/icon-256.png" "$BUILD_DIR/icon.ico"
else
    # 使用 rsvg-convert + convert 组合
    convert "$BUILD_DIR/icon-16.png" "$BUILD_DIR/icon-32.png" "$BUILD_DIR/icon-48.png" "$BUILD_DIR/icon-64.png" "$BUILD_DIR/icon-128.png" "$BUILD_DIR/icon-256.png" "$BUILD_DIR/icon.ico"
fi

if [ $? -eq 0 ]; then
    echo "✅ 生成 Windows 图标: $BUILD_DIR/icon.ico"
else
    echo "❌ 生成 .ico 失败"
fi
echo ""

# 清理临时文件
echo "🧹 清理临时文件..."
rm -f "$BUILD_DIR/icon-"*.png
echo ""

# 完成
echo "🎉 图标生成完成！"
echo ""
echo "生成的文件："
ls -lh "$BUILD_DIR"/*.{png,icns,ico} 2>/dev/null || true
echo ""
echo "📝 注意事项："
echo "  - macOS: 使用 build/icon.icns"
echo "  - Windows: 使用 build/icon.ico"
echo "  - Linux: 使用 build/icon.png"
