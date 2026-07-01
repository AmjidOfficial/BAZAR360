# Authentication setup (Email + Google + Facebook + LinkedIn)

This project uses Firebase Authentication. The repository includes helper functions at `src/services/auth.ts` for Email/Password sign-up/sign-in and OAuth sign-in for Google, Facebook and LinkedIn.

Follow these steps to enable enterprise-level auth flows for production (bazar360.online) and development (localhost):

1. Firebase Project
   - Create or use the existing Firebase project in the Firebase Console.
   - In **Authentication → Sign-in method**, enable:
     - **Email/Password**
     - **Google** (enable; no additional steps if you use Firebase-managed OAuth client)
     - **Facebook** (requires App ID and App Secret from Facebook Developers)
     - **LinkedIn**: add as a **Generic OAuth provider** with provider ID `linkedin.com` (requires Client ID & Client Secret from LinkedIn Developer portal).
   - Add Authorized domains: `bazar360.online`, `localhost` (and any other staging domains).

2. Google OAuth
   - If you want to use a custom Google OAuth client, create credentials in Google Cloud Console and set them in the Firebase Authentication provider settings.
   - Set redirect URI in Google Console to: `https://<your-domain>/__/auth/handler` (for local dev use `http://localhost:3000/__/auth/handler`).

3. Facebook App
   - Create a Facebook App at https://developers.facebook.com/
   - Add a product: Facebook Login and configure Valid OAuth Redirect URIs to `https://<your-domain>/__/auth/handler` and `http://localhost:3000/__/auth/handler`.
   - Copy App ID and App Secret into the Firebase Facebook provider settings.

4. LinkedIn
   - Register an app at https://www.linkedin.com/developers/
   - Add `https://<your-domain>/__/auth/handler` and `http://localhost:3000/__/auth/handler` to Authorized Redirect URLs.
   - Copy Client ID and Client Secret into Firebase's Generic OAuth provider for `linkedin.com`.

5. Environment & `firebase-applet-config.json`
   - This repo contains `firebase-applet-config.json` used by the app. For build-time environment variables, set a local `.env.local` in the project root with at least:

```
VITE_RECAPTCHA_SITE_KEY=<your_reCAPTCHA_v3_site_key>
```

   - Ensure the Firebase config (API key, projectId, authDomain, etc.) in `firebase-applet-config.json` corresponds to your Firebase project.

6. Logo handling (preview)
   - The app's default Auto Choice logo files are referenced by `src/components/AutoChoiceLogo.tsx` as `/auto_choice_logo_1781509565476.png` (fallback `.jpg`). Put the logo file(s) in the `public/` folder so they are served at the root.

7. Using the helpers
   - Import helpers from `src/services/auth.ts`:

```ts
import authService from './services/auth';

await authService.signInWithGoogle();
await authService.signUpWithEmail(email, password);
```

8. Production notes
   - Make sure the OAuth apps are verified and live (Facebook/LinkedIn) if you target real users.
   - Add your production domain (`bazar360.online`) to Authorized domains and OAuth redirect URIs.
   - Configure App Check (reCAPTCHA v3) by providing a real `VITE_RECAPTCHA_SITE_KEY` and enabling App Check in Firebase.

If you'd like, I can also implement the frontend sign-in UI and provider buttons next. Tell me to proceed and I'll add the UI components and wire them into the existing `TopAppBar` or a dedicated `RegistrationPortal` component.
