# Testing Instructions - Lottie Step-1 Fix

## What Was Changed

1. **Step-1.json cleaned**: Removed embedded base64 images containing "NaN" strings
2. **Direct import**: Step-1.json is now imported directly into the JavaScript bundle
3. **External assets**: Images extracted to `asset-2.png` and `asset-4.png` in `/assets/lottie/`
4. **Build automation**: Assets automatically copied to `dist/assets/lottie/` during build

## Files Modified

- ✅ `src/home-new.js` - Now imports Step-1.json directly
- ✅ `bin/build.js` - Added JSON loader and asset copying
- ✅ `assets/lottie/Step-1.json` - Cleaned version (backup saved)

## Build Results

- Bundle size: 3.19 MB (includes Step-1.json data)
- No "MNaN" or "CNaN" patterns found in output
- External PNG assets available at `/assets/lottie/`

## How to Test

### 1. Deploy the built files

Upload to your site:
- `dist/home-new.js`
- `dist/assets/lottie/asset-2.png`
- `dist/assets/lottie/asset-4.png`

### 2. Check browser console

Open your browser's Developer Tools (F12) and check the Console tab for:

**BEFORE (errors):**
```
Error: <path> attribute d: Expected number, " MNaN,NaN CNaN,NaN_".
```

**AFTER (no errors):**
- No NaN errors should appear
- Lottie animations should render smoothly

### 3. Verify animations work

- Desktop Step 1 animation (scroll to steps section)
- Mobile Step 1 animation (on mobile viewport)
- Both should play without errors

### 4. Check asset loading

In the Network tab, verify:
- `asset-2.png` loads successfully (19KB)
- `asset-4.png` loads successfully (17KB)
- Status: 200 OK

## Rollback (if needed)

If you need to revert:
```bash
cd /Users/basvanstraaten/Documents/GitHub/fay/assets/lottie
mv Step-1.json Step-1-cleaned.json
mv Step-1-original-backup.json Step-1.json
pnpm build
```

## Success Criteria

✅ No NaN errors in browser console
✅ Step 1 animations play correctly
✅ PNG assets load with 200 status
✅ No performance degradation
✅ No Osano conflicts

