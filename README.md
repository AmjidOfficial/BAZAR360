# Bazar360.online — Auto Choice: The Right Choice 🚗💨

Welcome to the premier repository of **Bazar360.online**, Pakistan’s elite decentralized automotive marketplace, certified showroom hub, and vehicle classifieds ecosystem. Featuring its flagship automotive brand showroom division, **Auto Choice**, the platform connects buyers directly to certified dealerships and private sellers without intermediate broker commissions.

---

## 🌟 Platform Identity & Core Mission
**Bazar360.online** is architected to bring premium transparency, high-performance web accessibility, and high-fidelity media showcases to the Pakistani automotive sector. 

* **Founder & Leadership:** Fully owned and operated under the direct administration of the **Founder** (Muhammad Amjid), alongside partners Malak Mazhar and Ghani Khan.
* **Core Philosophy:** Eliminate intermediary noise by empowering verified showrooms with custom-branded storefront digital portals, interactive real-time bidding, and dynamic QR-code inventory tracking.

---

## 🛠️ Technical Stack & Architecture

### Frontend & Client Tier
* **Framework:** React 19 (TypeScript 5.8)
* **Build System:** Vite 6 (Hot-Module Replacement disabled for stable preview isolation)
* **Styling System:** Tailwind CSS v4 utilizing CSS variable custom properties for real-time showroom color palettes (e.g., Cosmic Slate, Emerald Velvet, Golden Crown, Arctic Bone).
* **Animations:** Framer Motion (imported from `motion/react`) for gorgeous, touch-responsive fluid transitions.

### Backend, Database & Storage Tier
* **Server Framework:** Express.js (Node.js/ES Module hybrid entry point compiled via `esbuild` to safe CommonJS)
* **Primary Database:** Firebase Firestore (with Offline Multi-Tab IndexedDB persistence enabled natively in the browser).
* **Identity Management:** Firebase Authentication supporting Email/Password, Google, Facebook, and LinkedIn OAuth providers.
* **App Protection:** Firebase App Check with Google reCAPTCHA v3 verification pipelines.
* **Media Management:** Cloudinary Media API for rapid, lossless, unsigned image and video uploads with real-time watermark placement.
* **Security & Audits:** Zero-trust security rule parameters enforced under `firestore.rules` (including role-based access control, field immutability, and protection from malicious payloads).

---

## 📦 Local Installation & Setup

Follow these steps to configure your local development environment:

### 1. Clone & Re-link Remote Path
If you are re-linking or setting up the local repository path:
```bash
git remote set-url origin https://github.com/AmjidOfficial/BAZAR360.git
```

### 2. Install Package Dependencies
```bash
npm install
```

### 3. Setup Environment Secrets
Create a `.env.local` file in the root directory:
```env
# reCAPTCHA v3 Verification Secret
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_v3_site_key

# Google Gemini AI Integration Key
GEMINI_API_KEY=your_gemini_api_key

# Firebase SDK Client Config Keys
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_APP_CHECK_DEBUG_TOKEN=optional_debug_token

# Cloudinary Integration Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

### 4. Run Development Server
```bash
npm run dev
```
*The application will boot a local development Express server running at `http://localhost:3000` with the hot Vite dev environment mounted.*

### 5. Production Compiles
To compile the frontend client assets and bundle the Express server into a standalone self-contained CommonJS file:
```bash
npm run build
```

---

## 🛡️ Git & Security Hygiene (`.gitignore`)
The project utilizes a pre-configured, highly restrictive `.gitignore` file. It ensures that local environment secrets (`.env`, `.env.local`), `node_modules`, standard compiled directories (`dist/`, `build/`), temporary IDE metadata files (`.idea/`, `.vscode/`), and testing outputs are **never** leaked to the remote version control.

---

## 🌐 Dynamic SEO & Metadata Engine
The custom-designed SEO component (`src/components/SEO.tsx`) handles advanced meta-tag generation:
1. **Dynamic OpenGraph/Twitter Cards:** Generates optimized preview imagery using on-the-fly Cloudinary transformation paths (resizing assets to exact 1200x630 specifications for OpenGraph previews).
2. **JSON-LD Schema Indexing:** Injects valid structural specifications (Organization, AutoDealer, FAQ, BreadcrumbList, and Vehicle) directly into the document header. This includes price currencies, showroom coordinates, item conditions, and availability statuses for search indexing.

---

## 🌍 Global Production Deployment
Bazar360 is optimized for static deployment to GitHub Pages or container deployment to Cloud Run.

The production source of truth is this `main` branch. Pushes to `main` trigger the Firebase Hosting live deployment workflow for `bazar360-2026`.

To deploy static branches to GitHub Pages:
```bash
npm run deploy
```

---
*Developed under the guidance of the Founder, Muhammad Amjid, and the Bazar360 Dev Team.*
