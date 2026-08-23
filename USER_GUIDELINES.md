# Bazar360.online — Official Platform & User Manual 📖🚘

This manual provides clear, comprehensive, step-by-step instructions for getting started, creating verified profiles, managing vehicle listings, and performing advanced remote operations on **Bazar360.online** and **Auto Choice: The Right Choice**.

---

## 👥 1. Intuitive User Roles & Permissions

Bazar360.online enforces a simple, clear, and secure Role-Based Access Control (RBAC) model:

### 🟢 Individual Buyers / Sellers
* **Target Audience:** General public, private car owners, and casual buyers.
* **Capabilities:** 
  * Access the global classifieds feed.
  * Search and filter listings using the advanced multi-parameter search engine.
  * Submit dynamic offers/bids (Bargains) in PKR/USD modes.
  * Chat directly with showroom owners or private sellers via integrated WhatsApp widgets.
  * List private vehicles (up to standard quotas) with rich media uploads.

### 🔵 Certified Showroom Partners
* **Target Audience:** Certified car showrooms, dealership networks, and heavy-machinery fleet operators.
* **Capabilities:**
  * Dedicated multi-tenant Showroom Mini-Site storefront.
  * Custom branding engine (real-time palette switching: Emerald Velvet, Cosmic Slate, Arctic Bone, Golden Crown).
  * Inventory management and digital DMS tools (bulk update prices, mark sold, duplicate list).
  * Direct inspection reports (engine, transmission, suspension, body scoring).
  * QR-code generator for physical print-ready showroom hang-tags.
  * Real-time customer leads CRM database dashboard.

### 🔴 Platform Administrators
* **Target Audience:** Designated system administrators strictly restricted to the **Founder** (Muhammad Amjid), alongside partners Malak Mazhar and Ghani Khan.
* **Capabilities:**
  * Comprehensive global administrative control deck.
  * Global delete permissions (deleting any fraudulent listing, post, or review).
  * Showroom partnership verification and approval workflows.
  * Global audit log visibility.

---

## 🔒 2. Step-by-Step User Registration & Verification

To access the platform's advanced features, follow these instructions to register and secure your profile:

### Step 1: Open the Registration Portal
* Click on the **Sign In** or **Get Started** buttons in the Top App Bar.
* Select your preferred authentication route: **Google Sign-In**, **Facebook Connect**, or conventional **Email/Password**.

### Step 2: Selecting Your Marketplace Identity
* **Buyers/Sellers:** Toggle the role choice to "Individual User" or "Buyer". Fill in your active phone number, city, and display name.
* **Showroom Partners:** Select the "Showroom Owner" or "Dealer" role. Provide your dealership business name, central location, and official business hotline.

### Step 3: Biometric Verification Setup (WebAuthn)
* To activate secure biometric key login (FaceID/TouchID):
  1. Access your **User Settings / Security** panel.
  2. Under the "WebAuthn Biometric Login" tab, click **Register Security Key**.
  3. Authorize the browser prompt using your device PIN or biometric scanner.
  4. Subsequent logins can bypass password inputs securely!

---

## 🚗 3. Listing, Editing, and Boosting Vehicle Ads

Follow this workflow to publish and maximize engagement on your car advertisements:

### Step 1: Initiating a Posting
* Navigate to your active dashboard and click **Create New Ad** or **Post a Vehicle**.
* Select the listing tier: **Standard Classified** or **Certified Showroom Listing** (only available to partners).

### Step 2: Specifications, Details & Condition Metrics
* Enter the exact vehicle details: **Make**, **Model**, **Year**, **Transmission**, **Fuel Type**, and **Odometer Mileage**.
* Specify body conditions and structural details: KPK/Punjab registered, token tax payment status, and custom engine CC.
* Set an honest pricing in PKR/USD.

### Step 3: Media Uploads (Cloudinary Pipeline)
* Drag & drop high-definition car photos directly onto the upload zone.
* The system automatically compresses, optimizes, and watermarks your photos before storing them in Cloudinary, ensuring speedy page loads.

### Step 4: Activating "Certified Showroom" Scores
* For verified showroom cars, check the **Digital Inspection Score** card:
  1. Input a scale score (1 to 10) for **Engine Health**, **Transmission Stability**, **Interior Condition**, and **Body Paint**.
  2. Upload an inspection PDF checklist if available.

### Step 5: Boosting Your Ad
* Tap the **Boost Listing** lightning button in the stock control center.
* This automatically pins your listing to the top of the global marketplace home feed, marks it with a highlighted premium border, and indexes it with priority in Search Engine Results Pages (SERPs).

---

## 🔍 4. Browsing, Storefronts, and the Multi-Parameter Filter Engine

Bazar360 makes finding your next vehicle simple with advanced discovery tools:

### Custom Showroom Mini-Sites
* Under the **Certified Showrooms** directory, click on any dealership (such as flagship **Auto Choice**).
* You will enter their dedicated storefront featuring their custom brand themes, active inventory grids, showroom location maps, active team members (lead by Malak Mazhar), and verifiable showroom ratings.

### Operating the Advanced Multi-Parameter Filter Engine
* Tap the Search tab to load the responsive **Search Explorer View**.
* Use the multi-tiered filter drawers to refine stock:
  * **Brand / Model / Year:** Easily separate newer crossovers from legacy sedans.
  * **Price Slider:** Define precise budget parameters in PKR.
  * **Mileage & CC Limits:** Filter high-efficiency hybrid cars from heavy SUVs.
  * **Location City:** Direct search for KPK, Peshawar, Islamabad, or Lahore based postings.
  * **Transmission & Fuel Type:** Instantly toggle manual vs. automatic or petrol vs. electric.

---

## 🛠️ 5. GitHub Re-Authentication & Remote Recovery Protocol

If your local development repository disconnects from the remote repository on the `AmjidOfficial` profile, follow these recovery commands:

### Method A: Re-authenticating via Personal Access Token (PAT)
Generate an active developer token in your GitHub account Settings (under Developer Settings -> Personal Access Tokens -> Tokens Classic, ensuring `repo` and `workflow` scopes are selected).

1. **Verify your current remote configuration:**
   ```bash
   git remote -v
   ```
2. **Re-link origin using your username and Personal Access Token:**
   ```bash
   git remote set-url origin https://<your_username>:<your_github_token>@github.com/AmjidOfficial/BAZAR360.git
   ```
3. **Verify the connection by fetching remote branches:**
   ```bash
   git fetch origin
   ```

### Method B: Re-authenticating via SSH Keys (Secure & Preferred)
1. **Generate a new SSH keypair (if not already configured):**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```
2. **Start the ssh-agent in the background:**
   ```bash
   eval "$(ssh-agent -s)"
   ```
3. **Add your private key to the agent:**
   ```bash
   ssh-add ~/.ssh/id_ed25519
   ```
4. **Copy your public key and add it to your GitHub Profile Settings (SSH and GPG keys):**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
5. **Change the repository remote URL to SSH mode:**
   ```bash
   git remote set-url origin git@github.com:AmjidOfficial/BAZAR360.git
   ```
6. **Test the SSH connection:**
   ```bash
   ssh -T git@github.com
   ```

---
*For direct administrative, hosting, or billing questions, contact the Bazar360 Board led by Muhammad Amjid.*
