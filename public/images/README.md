# MLA Posture Image Instructions

## Where to Add Your Image

Place your MLA (Myofunctional Lower Arch) posture image in this directory with the following name:

**Filename:** `mla-posture.jpg`

**Full path:** `/public/images/mla-posture.jpg`

## Image Requirements

### Recommended Specifications:
- **Format:** JPG, PNG, or WebP
- **Dimensions:** Minimum 800x600 pixels (4:3 aspect ratio recommended)
- **File size:** Less than 500KB for optimal loading performance
- **Quality:** High quality, clear image showing proper posture

### Image Content Guidelines:
The image should clearly demonstrate:
1. Proper head positioning (straight and forward-facing)
2. Neutral facial expression
3. Correct distance from camera
4. Good lighting setup
5. MLA posture principles

## Steps to Add Your Image

1. **Prepare your image:**
   - Ensure it meets the requirements above
   - Rename it to `mla-posture.jpg` (or `.png`, `.webp`)

2. **Add to this directory:**
   ```
   /home/runner/work/OptiFit/OptiFit/public/images/mla-posture.jpg
   ```

3. **Update the component if using a different format:**
   - If you use PNG or WebP instead of JPG, update the image path in:
   - File: `/src/components/PostureGuide.tsx`
   - Line: Change `src="/images/mla-posture.jpg"` to your format (e.g., `.png` or `.webp`)

4. **Test the image:**
   - Run the development server: `npm run dev`
   - Navigate to the face scanning step
   - Verify the image displays correctly

## Placeholder Image

If you don't have the image ready yet, the component will show a gradient background with a broken image icon. This is normal and will be replaced once you add your actual image.

## Alternative: Using Next.js Image Optimization

If your image is larger than 500KB, Next.js will automatically optimize it. However, for best performance:
- Pre-optimize large images using tools like TinyPNG or ImageOptim
- Consider WebP format for smaller file sizes with same quality

## Need Help?

- The PostureGuide component is located at: `/src/components/PostureGuide.tsx`
- The component is integrated into: `/src/components/FaceScanner.tsx`
- For styling adjustments, modify the component's Tailwind classes
