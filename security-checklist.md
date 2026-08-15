# Bazar360 Production Security & Infrastructure Checklist

This checklist ensures the production environment for **bazar360.online** is secure, optimized, and ready for the Pakistan market.

## 1. Environment & API Keys
- [ ] **Google GenAI (Gemini) Key**: Ensure `GEMINI_API_KEY` is set in the Firebase App Hosting / Cloud Functions environment. **NEVER** prefix with `VITE_`.
- [ ] **Firebase Client Config**: `VITE_FIREBASE_CONFIG` is public by design, but ensure **API Restrictions** are enabled in the Google Cloud Console (restrict to `bazar360.online` domain).
- [ ] **ReCaptcha v3**: Ensure `VITE_RECAPTCHA_SITE_KEY` is correctly set and the backend validates tokens via `server.ts`.
- [ ] **Admin Service Account**: If using Firebase Admin SDK, store the JSON credential as a secret in Google Cloud Secret Manager, not in the codebase.

## 2. Infrastructure (Firebase)
- [ ] **Custom Domain**: Link `bazar360.online` in Firebase Hosting settings. Update DNS records (A and TXT) at your registrar.
- [ ] **Global CDN**: Firebase Hosting automatically provides a global CDN. Verify that assets are being cached (check `Cache-Control` headers in DevTools).
- [ ] **Firestore Security Rules**: Deploy [firestore.rules](firestore.rules) to production. Verify RBAC logic (Admin vs. User) via the Simulator.
- [ ] **App Check**: Enforce reCAPTCHA Enterprise or v3 in the Firebase Console to prevent bot abuse on Firestore and Auth.

## 3. Performance Optimization (Pakistan Region)
- [ ] **Image Optimization**: Use WebP format for all vehicle images.
- [ ] **Lazy Loading**: Ensure `VehicleCard` and heavy components use React.lazy or dynamic imports.
- [ ] **Asset Bundling**: Run `npm run build` to ensure tree-shaking and minification are applied.
- [ ] **Font Caching**: Preload "Inter" and "Space Grotesk" from Google Fonts to avoid FOIT (Flash of Invisible Text).

## 4. Monitoring & Analytics
- [ ] **Firebase Analytics**: Track `vehicle_view`, `dealer_contact`, and `search_query` events.
- [ ] **Performance Monitoring**: Monitor TTI (Time to Interactive) and FID (First Input Delay) for users in Pakistan.
- [ ] **Error Tracking**: Integrate Sentry or use Firebase Crashlytics to catch runtime exceptions.

## 5. DNS Propagation (bazar360.online)
1. Go to your domain registrar (e.g., GoDaddy, Namecheap).
2. Add **A records** pointing to the IP addresses provided in the Firebase Console.
3. Add a **TXT record** for domain ownership verification.
4. Wait 24-48 hours for global propagation.

---
*Maintained by Bazar360 DevOps Team*
