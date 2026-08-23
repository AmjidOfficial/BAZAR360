# Bazar360 Media Intelligence Specification

## Goal
Make user-uploaded vehicle, profile and showroom media look clean and consistent without changing the source media or inventing content.

## Source of truth
- Preserve the original uploaded file.
- Generated derivatives are separate objects.
- Never overwrite the original during crop, resize, compression or AI processing.
- Media metadata must retain its authoritative owner and listing/showroom relationship.

## Automatic processing
For supported uploads:
1. Validate MIME type and size.
2. Detect orientation and rotate safely.
3. Generate responsive derivatives for card, gallery and full detail use.
4. Detect the visual focal point when reliable.
5. Use object-fit/object-position or generated crops that keep the vehicle/profile subject visible.
6. Compress for the target display without unnecessary quality loss.
7. Generate a stable thumbnail for list views.
8. Preserve ordering selected by the user unless an AI recommendation is explicitly accepted.

## Vehicle gallery
- First image is the primary listing image only when selected by the user or accepted from a clearly marked recommendation.
- Do not infer vehicle facts from images and write them into Firestore automatically.
- Do not create fake images or synthetic vehicle photos for marketplace listings.
- Do not replace real uploaded images with AI-generated media.

## Profiles and showrooms
- Profile photos remain attached to the authoritative user profile.
- Showroom logo/banner remain attached to the authoritative showroom record.
- Cropping must keep faces/logos readable where detection is reliable.

## Delivery
- Use responsive image URLs/sizes.
- Lazy-load below-the-fold media.
- Use thumbnails for cards.
- Load full-resolution assets only when needed.
- Avoid loading an entire gallery before the first view is interactive.

## Security
- Uploads require correct authentication and ownership checks.
- Verification documents and private inspection media are not public.
- File type and size validation is enforced at the storage boundary.

## AI boundary
AI may recommend ordering, crop, focal point, alt text, title and presentation. AI must not invent vehicle condition, mileage, price, registration, ownership, verification, review or other marketplace facts.

## Failure behavior
If detection fails, use a safe deterministic crop/fit strategy. Never block listing creation solely because AI processing failed.

## Release gate
Media processing is a NO-GO if originals can be lost, ownership can be bypassed, synthetic marketplace media can replace user uploads, or full-resolution assets are loaded unnecessarily on list views.
