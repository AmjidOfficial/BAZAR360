# Bazar360.online Beginner Guide

Bazar360 is a real automotive marketplace, not a static HTML demo.

## What the project uses

- React + TypeScript for the marketplace UI and interactions
- Vite for development and production builds
- Firebase Authentication and Firestore for marketplace data
- Cloudinary for vehicle and profile media
- HTML/CSS/JavaScript are produced by the React/Vite build
- Firebase Hosting is the production hosting path for `bazar360.online`

## Run it on your computer

### 1. Install Node.js

Install Node.js 22 LTS or newer from the official Node.js website.

### 2. Download the project

```bash
git clone https://github.com/AmjidOfficial/BAZAR360.git
cd BAZAR360
```

### 3. Install packages

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Open the local URL shown by Vite, normally:

```text
http://localhost:3000
```

### 5. Create a production build

```bash
npm run build
```

The production files are generated in `dist/`.

## Main marketplace areas

- Home
- Inventory / Search
- Vehicle details
- Post Ad / Sell
- Verified Showrooms
- Community / Social Feed
- Favorites / Shortlist
- Messages and notifications
- User profile and dashboard
- Automotive services
- About Us
- Services
- Contact
- WhatsApp support
- Social links

## Public navigation

The main public navigation is available from the homepage and includes Home, About Us, Services, Contact, Inventory, Showrooms and Post Ad.

## Marketplace rule

Do not replace the React marketplace with a static HTML landing page. Public pages must support the marketplace flows, real listings, authentication, seller/showroom contact, media, search and user actions.

## Design direction

The attached Stitch references are treated as the visual direction: premium automotive presentation, dark cosmic/slate surfaces, electric blue primary accents, amber/orange secondary accents, Space Grotesk headlines, Inter body text, glass-style panels, responsive cards and restrained motion.

The usability target is simple: a first-time user should be able to understand the site like Facebook within seconds, then buy, sell, contact a seller, save a vehicle, message a user or open a showroom without hunting through menus.

## Deployment

Pushes to `main` trigger the Firebase Hosting workflow. The production Firebase project configured for this repository is `bazar360-2026`.

The Vercel workflow is manual until valid Vercel deployment secrets are configured. This prevents a missing-secret Vercel job from falsely marking the main deployment pipeline as failed.
