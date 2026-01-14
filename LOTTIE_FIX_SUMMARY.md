# Lottie Step-1 NaN Error Fix

## Problem
The browser console was showing SVG path errors with NaN values when rendering the Step-1 Lottie animation:
```
Error: <path> attribute d: Expected number, " MNaN,NaN CNaN,NaN_".
```

## Root Cause
The Step-1.json file contained embedded base64-encoded PNG images (assets #2 and #4) that happened to include the character sequence "NaN" within the binary data. While this was harmless in the JSON itself, it appeared to cause issues when Lottie-web rendered the animation, especially in combination with Osano's cookie consent script.

## Solution
1. **Extracted embedded images**: Converted embedded base64 images to external PNG files
   - Asset #2 → `asset-2.png` (19KB)
   - Asset #4 → `asset-4.png` (17KB)

2. **Updated Step-1.json**: Modified the Lottie file to reference external PNG files instead of embedded base64 data
   - Reduced file size from 655KB to 607KB (7.3% smaller)
   - Removed the problematic "NaN" strings from the JSON

3. **Automated asset copying**: Updated `bin/build.js` to automatically copy Lottie assets (PNG and JSON files) to `dist/assets/lottie/` during both production builds and development serving

## Files Changed
- ✅ `assets/lottie/Step-1.json` - Replaced with cleaned version
- ✅ `assets/lottie/asset-2.png` - New external image file
- ✅ `assets/lottie/asset-4.png` - New external image file
- ✅ `bin/build.js` - Added automatic asset copying
- 📦 `assets/lottie/Step-1-original-backup.json` - Backup of original file

## Testing
After the fix:
1. Build the project: `pnpm build`
2. Assets will be automatically copied to `dist/assets/lottie/`
3. The Step-1 Lottie animation should render without NaN errors in the browser console

## Notes
- The original Step-1.json file has been backed up as `Step-1-original-backup.json`
- A fully sanitized version is also available as `Step-1-sanitized.json` (if needed)
- All other Lottie files (Step-3.json, footer animations) remain unchanged and are valid
