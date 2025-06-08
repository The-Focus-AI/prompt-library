# Generating PWA Icons

This guide shows different ways to create the required icons for your PWA.

## Required Icon Sizes

Create PNG icons in these sizes:
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

## Method 1: Using PWA Asset Generator (Recommended)

Install the tool:
```bash
npm install -g pwa-asset-generator
```

Create a source image (at least 512x512) and run:
```bash
pwa-asset-generator logo.png icons/ --icon-only --type png
```

## Method 2: Using ImageMagick

If you have ImageMagick installed:
```bash
# Create icons directory
mkdir -p icons

# Generate all sizes from a source image
for size in 72 96 128 144 152 192 384 512; do
    convert logo.png -resize ${size}x${size} icons/icon-${size}.png
done
```

## Method 3: Online Tools

- [PWA Builder](https://www.pwabuilder.com/imageGenerator)
- [Real Favicon Generator](https://realfavicongenerator.net/)
- [Favicon.io](https://favicon.io/)

## Method 4: Simple Design with CSS

For a quick start, you can create a simple icon using HTML/CSS:

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 512px;
            width: 512px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: Arial, sans-serif;
        }
        .icon {
            color: white;
            font-size: 200px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="icon">P</div>
</body>
</html>
```

Then take screenshots at different sizes or use a tool to convert to PNG.

## Design Tips

1. **Keep it Simple** - Icons should be recognizable at small sizes
2. **Use Bold Colors** - Ensure good contrast
3. **Avoid Text** - Except for single letters or numbers
4. **Test on Different Backgrounds** - Icons should work on various backgrounds
5. **Make it Square** - All icons should be square aspect ratio

## Quick Icon Template

If you need a quick solution, create a 512x512 PNG with:
- Background: #2196F3 (or your brand color)
- Foreground: White "P" or prompt icon
- Padding: 20% on all sides

Then use any of the methods above to generate all sizes.