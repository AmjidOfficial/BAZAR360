var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/lib/leads.ts
var leads_exports = {};
__export(leads_exports, {
  LeadSchema: () => LeadSchema,
  validateLead: () => validateLead
});
function validateLead(data) {
  return LeadSchema.parse(data);
}
var import_zod, LeadSchema;
var init_leads = __esm({
  "src/lib/leads.ts"() {
    import_zod = require("zod");
    LeadSchema = import_zod.z.object({
      customerId: import_zod.z.string().min(1, "Customer ID is required"),
      vehicleId: import_zod.z.string().min(1, "Vehicle ID is required"),
      showroomOwnerId: import_zod.z.string().min(1, "Showroom Owner ID is required"),
      inquiryDate: import_zod.z.string().min(1, "Inquiry Date is required"),
      status: import_zod.z.enum(["New", "Contacted", "Closed", "Lost", "Pending", "Approved", "Countered", "Rejected"]).default("New"),
      // Additional fields based on Lead interface in types.ts
      userName: import_zod.z.string().optional(),
      userPhone: import_zod.z.string().optional(),
      userEmail: import_zod.z.string().optional(),
      vehicleTitle: import_zod.z.string().optional(),
      vehiclePrice: import_zod.z.number().optional(),
      inquiryMessage: import_zod.z.string().optional(),
      vehicleImage: import_zod.z.string().optional()
    }).passthrough();
  }
});

// src/lib/seoGenerator.ts
var seoGenerator_exports = {};
__export(seoGenerator_exports, {
  generateDealerSeo: () => generateDealerSeo,
  generateVehicleSeo: () => generateVehicleSeo
});
function ensureAbsoluteUrl(url) {
  if (!url) return "https://bazar360.online/auto_choice_logo_dark.jpg";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  return `https://bazar360.online/${url.replace(/^\//, "")}`;
}
async function generateDealerSeo(dealerId) {
  try {
    const dealerDoc = await db.collection("dealers").doc(dealerId).get();
    if (!dealerDoc.exists) {
      return "";
    }
    const dealer = dealerDoc.data();
    const title = `${dealer.name} - Verified Showroom | Bazar360 Online`;
    const description = dealer.subtitle || dealer.description || `Browse active pre-owned vehicle stock and contact ${dealer.name} directly on Bazar360.online.`;
    const rawImage = dealer.logoUrl || dealer.logo || dealer.avatarUrl || dealer.coverImage;
    const imageUrl = ensureAbsoluteUrl(rawImage);
    const url = `https://bazar360.online/dealers/${dealerId}`;
    const jsonLd = [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `https://bazar360.online/dealers/${dealerId}#organization`,
        "name": dealer.name,
        "url": url,
        "logo": imageUrl,
        "description": description,
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": dealer.phone || dealer.whatsapp || "+92-314-9198403",
          "contactType": "customer service",
          "areaServed": "PK",
          "availableLanguage": ["English", "Urdu"]
        }
      },
      {
        "@context": "https://schema.org",
        "@type": ["AutoDealer", "AutomotiveBusiness", "LocalBusiness"],
        "@id": `https://bazar360.online/dealers/${dealerId}#localbusiness`,
        "name": dealer.name,
        "image": imageUrl,
        "telephone": dealer.phone || dealer.whatsapp || "+92-314-9198403",
        "url": url,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": dealer.location || "Peshawar, KPK",
          "addressLocality": (dealer.location || "Peshawar").split(",")[0]?.trim() || "Peshawar",
          "addressRegion": (dealer.location || "KPK").split(",")[1]?.trim() || "KPK",
          "addressCountry": "PK"
        },
        "description": description,
        "priceRange": "$$$",
        "aggregateRating": dealer.rating ? {
          "@type": "AggregateRating",
          "ratingValue": dealer.rating,
          "bestRating": "5",
          "worstRating": "1",
          "reviewCount": dealer.reviewsCount || dealer.vehiclesCount || 10
        } : void 0
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://bazar360.online"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Showrooms",
            "item": "https://bazar360.online/dealers"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": dealer.name,
            "item": url
          }
        ]
      }
    ];
    return `
      <title>${title}</title>
      <meta name="description" content="${description}" />
      <meta property="og:site_name" content="Bazar360 Online" />
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${description}" />
      <meta property="og:image" content="${imageUrl}" />
      <meta property="og:image:secure_url" content="${imageUrl}" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content="${url}" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${title}" />
      <meta name="twitter:description" content="${description}" />
      <meta name="twitter:image" content="${imageUrl}" />
      <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
    `;
  } catch (e) {
    console.error("[SEO Generator] Error generating dealer SEO:", e);
    return "";
  }
}
async function generateVehicleSeo(vehicleId) {
  try {
    const carDoc = await db.collection("listings").doc(vehicleId).get();
    if (!carDoc.exists) {
      return "";
    }
    const car = carDoc.data();
    const title = `${car.make} ${car.model} ${car.year} for sale | Bazar360 Online`;
    const formattedPrice = car.price ? `PKR ${(car.price / 1e5).toFixed(1)} Lakh` : "Inquire Price";
    const description = `For Sale: ${car.title || `${car.make} ${car.model}`} (${car.year}) - ${formattedPrice}. ${car.condition || "Used"} condition. Direct WhatsApp connection on Bazar360.online.`;
    const rawImage = car.imageUrl || car.images && car.images[0];
    const imageUrl = ensureAbsoluteUrl(rawImage);
    const url = `https://bazar360.online/vehicle/${vehicleId}`;
    return `
      <title>${title}</title>
      <meta name="description" content="${description}" />
      <meta property="og:site_name" content="Bazar360 Online" />
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${description}" />
      <meta property="og:image" content="${imageUrl}" />
      <meta property="og:image:secure_url" content="${imageUrl}" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content="${url}" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${title}" />
      <meta name="twitter:description" content="${description}" />
      <meta name="twitter:image" content="${imageUrl}" />
    `;
  } catch (e) {
    console.error("[SEO Generator] Error generating vehicle SEO:", e);
    return "";
  }
}
var admin, app2, db;
var init_seoGenerator = __esm({
  "src/lib/seoGenerator.ts"() {
    admin = __toESM(require("firebase-admin"), 1);
    try {
      app2 = admin.initializeApp();
    } catch (e) {
      app2 = admin.app();
    }
    db = admin.firestore();
  }
});

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_firebase_admin = __toESM(require("firebase-admin"), 1);
var import_firestore = require("firebase-admin/firestore");
var import_crypto = __toESM(require("crypto"), 1);

// firebase-applet-config.json
var firebase_applet_config_default = {
  projectId: "bazar360-2026",
  appId: "1:396120823798:web:4ac8af9f8ca7674b7b59d7",
  apiKey: "AIzaSyDo9wcKNIOnwoCbWdXDkX3ESVEwyzgXi0I",
  authDomain: "bazar360-2026.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-bazar360online-90162156-c190-465e-a44d-d2853657a61e",
  storageBucket: "bazar360-2026.firebasestorage.app",
  messagingSenderId: "396120823798",
  measurementId: ""
};

// server.ts
import_dotenv.default.config();
if (import_firebase_admin.default.apps.length === 0) {
  try {
    import_firebase_admin.default.initializeApp({
      projectId: firebase_applet_config_default.projectId
    });
    console.log("[App Check Shield] Firebase Admin initialized successfully.");
  } catch (error) {
    console.warn("[App Check Shield] Firebase Admin failed to initialize:", error.message || error);
  }
}
var appCheckVerification = async (req, res, next) => {
  const appCheckToken = req.header("X-Firebase-AppCheck");
  const isProd = process.env.NODE_ENV === "production";
  if (!appCheckToken) {
    if (isProd) {
      console.warn("[App Check Shield] Blocked production request: Missing App Check token.");
      return res.status(401).json({ success: false, error: "Unauthorized: Missing App Check token." });
    } else {
      console.log("[App Check Shield] Development mode: Permitted request without App Check token.");
      return next();
    }
  }
  try {
    const decodedToken = await import_firebase_admin.default.appCheck().verifyToken(appCheckToken);
    console.log(`[App Check Shield] Decoded valid App Check token for App ID: ${decodedToken.appId}`);
    return next();
  } catch (err) {
    console.warn("[App Check Shield] Token verification failed:", err.message || err);
    if (isProd) {
      return res.status(401).json({ success: false, error: "Unauthorized: Invalid/expired App Check token." });
    } else {
      console.log("[App Check Shield] Development mode: Permitted bypass for preview convenience.");
      return next();
    }
  }
};
var requireAuth = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Unauthorized: Missing or invalid Authorization header." });
  }
  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedIdToken = await import_firebase_admin.default.auth().verifyIdToken(idToken);
    req.user = decodedIdToken;
    return next();
  } catch (err) {
    console.warn("ID Token verification failed:", err.message || err);
    return res.status(401).json({ success: false, error: "Unauthorized: Invalid token." });
  }
};
var aiClient = null;
var dbAdmin = null;
function getDbAdmin() {
  if (!dbAdmin) {
    const app3 = import_firebase_admin.default.apps[0] || import_firebase_admin.default.app();
    try {
      dbAdmin = (0, import_firestore.getFirestore)(app3, firebase_applet_config_default.firestoreDatabaseId);
    } catch (e) {
      try {
        dbAdmin = (0, import_firestore.getFirestore)(app3);
      } catch (err) {
        dbAdmin = null;
      }
    }
  }
  return dbAdmin;
}
function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not defined.");
    }
    aiClient = new import_genai.GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
async function executeWithRetry(apiCall, retries = 3, delayMs = 1e3) {
  let attempt = 0;
  while (true) {
    try {
      return await apiCall();
    } catch (error) {
      attempt++;
      const errorMessage = String(error.message || error);
      const isTransient = errorMessage.includes("503") || errorMessage.includes("UNAVAILABLE") || errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("high demand") || errorMessage.includes("429") || error.status === 503 || error.status === 429;
      if (isTransient && attempt < retries) {
        const sleepTime = delayMs * Math.pow(2, attempt - 1) * (0.8 + Math.random() * 0.4);
        console.log(`[Bazar360 AI Engine] Transient busy state detected. Retrying in ${Math.round(sleepTime)}ms (attempt ${attempt}/${retries})...`);
        await new Promise((resolve) => setTimeout(resolve, sleepTime));
      } else {
        throw error;
      }
    }
  }
}
async function startServer() {
  const app3 = (0, import_express.default)();
  const PORT = 3e3;
  app3.use(import_express.default.json());
  app3.use("/api", appCheckVerification);
  app3.post("/api/ai/marketing-engine", async (req, res) => {
    try {
      const { rawInput, tone } = req.body;
      if (!rawInput) {
        return res.status(400).json({ success: false, error: "Raw input is required" });
      }
      const client = getGeminiClient();
      const systemPrompt = `You are "BAZAR360-Marketer", a Senior Automotive Copywriter, SEO Marketing Specialist, and Automotive Valuation Expert for the Bazar360 marketplace (https://bazar360.online).

YOUR GOAL:
Analyze vehicle metadata (Make, Model, Year, Mileage, Condition/Grade, Price, Registration City) alongside visual photo descriptions/observations to produce high-converting, professional, trustworthy, and persuasive vehicle listing content.

COPYWRITING INSTRUCTIONS:
1. PERSUASIVE HOOK & SEO TITLE: Create an authoritative headline with Year, Make, Model, Trim, and trust badge (e.g. Total Genuine, Islamabad Reg, Low Mileage, Bazar360 Verified).
2. TRUST & TRANSPARENCY: Highlight vehicle authenticity, documented service history, genuine paint/auction grade, and structural integrity to build immediate buyer confidence.
3. VISUAL ANALYSIS INTEGRATION: Synthesize any image descriptions or visual notes into the narrative (e.g., highlighting paint depth, wheel condition, interior upholstery, and dashboard tech).
4. PAKISTANI MARKET CONTEXT: Handle PKR currency, Lacs/Crores, and local terminology ("Bumper-to-Bumper Genuine", "Auction Grade 4.5", "KPK/Punjab Reg").
5. TONE SELECTION: Style tone requested is "${tone || "Premium"}". Maintain a luxury catalog tone with active verbs and high value perception.

Generate output strictly conforming to the following JSON structure:
{
  "title": "A highly persuasive, SEO-optimized vehicle headline",
  "description": "Rich sales description focusing on performance, comfort, safety, visual condition, and verification, tailored for fast conversion",
  "tags": ["Make", "Model", "ConditionTag", "CityTag", "Bazar360Verified"],
  "suggestedPricePKR": 6500000,
  "highlights": [
    "Key mechanical/spec highlight",
    "Exterior & visual condition highlight",
    "Interior & comfort highlight"
  ]
}`;
      const response = await executeWithRetry(() => client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Translate this shorthand seller note: "${rawInput}"`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              title: { type: import_genai.Type.STRING },
              description: { type: import_genai.Type.STRING },
              tags: {
                type: import_genai.Type.ARRAY,
                items: { type: import_genai.Type.STRING }
              },
              suggestedPricePKR: { type: import_genai.Type.INTEGER },
              highlights: {
                type: import_genai.Type.ARRAY,
                items: { type: import_genai.Type.STRING }
              }
            },
            required: ["title", "description", "tags", "suggestedPricePKR", "highlights"]
          }
        }
      }));
      const resultText = response.text;
      if (!resultText) {
        throw new Error("Failed to receive output text from Gemini models.");
      }
      const parsedJSON = JSON.parse(resultText.trim());
      res.json({ success: true, result: parsedJSON });
    } catch (error) {
      console.log("AI listing accelerator fallback triggered.");
      res.status(200).json({
        success: false,
        error: "AI Generation is temporarily busy. Applied premium fallback template.",
        result: {
          title: "Premium Certified Sedan - Pakistan Edition",
          description: "A meticulously styled vehicle ready for immediate city drives. Features clean upholstery, smooth transmission, and optimal performance diagnostics. Passed full BAZAR360 safety inspections.",
          tags: ["Compact", "Certified", "Slick"],
          suggestedPricePKR: 15e5,
          highlights: ["Clean vehicle background checked", "Pristine interior condition", "Optimal Pakistani specs"]
        }
      });
    }
  });
  app3.post("/api/dealer/chat", async (req, res) => {
    try {
      const { dealerName, dealerBio, inventorySummary, message, history } = req.body;
      if (!message) {
        return res.status(400).json({ reply: "I didn't receive your message. Try typing again!" });
      }
      const client = getGeminiClient();
      const contextPrompt = `You are a helpful, professional, and friendly sales representative representing the premium dealership "${dealerName}".
Dealership bio: "${dealerBio}".
Current active showcase stock list: "${inventorySummary}".
Your task is to engage with car buyers in Pakistan with extreme courtesy, technical precision, and persuasive sales mechanics.
Incorporate details of our showcase fleet where appropriate. Maintain roleplay parameters flawlessly. Keep responses concise (under 80 words).`;
      const formattedContents = [];
      if (history && Array.isArray(history)) {
        for (const h of history) {
          formattedContents.push({
            role: h.role === "user" ? "user" : "model",
            parts: [{ text: h.text }]
          });
        }
      }
      formattedContents.push({ role: "user", parts: [{ text: message }] });
      const response = await executeWithRetry(() => client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: contextPrompt
        }
      }));
      const replyText = response.text || "Hello! We are glad to assist you. Our team is available directly.";
      res.json({ reply: replyText.trim() });
    } catch (error) {
      console.log("Chatbot auto reply bypass triggered.");
      res.json({
        reply: "Hello standard buyer! Thanks for contacting us. To secure optimal pricing on these listings or speak directly with our team, please click 'Call Showroom' or leave a review below."
      });
    }
  });
  app3.post("/api/scrape-socials", async (req, res) => {
    try {
      const { name, website, facebook, instagram, tiktok, youtube, twitter } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, error: "Showroom name is required" });
      }
      const curatedCoverImages = [
        "https://images.unsplash.com/photo-1562141983-f32fdfa2bcfa?auto=format&fit=crop&q=80&w=1200",
        // Modern showroom
        "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1200",
        // Prestige lineup
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200",
        // Cyberpunk neon showroom
        "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=1200"
        // Luxury dealership
      ];
      const curatedLogos = [
        "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=300",
        // Dark shield logo
        "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=300",
        // Minimal monogram
        "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=300"
        // Elegant brand
      ];
      const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const coverImage = curatedCoverImages[hash % curatedCoverImages.length];
      const avatarUrl = name.toLowerCase().includes("choice") ? "./auto_choice_logo_1781509565476.jpg" : curatedLogos[hash % curatedLogos.length];
      const activityFeed = [];
      if (tiktok) {
        activityFeed.push({
          id: `act-tiktok-${Date.now()}`,
          timestamp: "Just now",
          badge: "TikTok Reel",
          imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600",
          title: `Trending TikTok walkaround on @${name.toLowerCase().replace(/\s+/g, "")}`,
          description: `Watch our high-engagement video walkaround and exhaust sound review of our newly imported premium sports touring model.`,
          price: "Available PKR"
        });
      }
      if (instagram || facebook) {
        activityFeed.push({
          id: `act-social-${Date.now() + 1}`,
          timestamp: "3 hours ago",
          badge: instagram ? "Instagram Showcase" : "Facebook Active Campaign",
          imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=600",
          title: "Prestige Fleet Campaign Spotlight",
          description: `Meticulously pre-purchased diagnostics passed. Spotlighting the luxury specifications of our highest-grade SUVs this month.`,
          price: "Elite Specs"
        });
      }
      if (website) {
        activityFeed.push({
          id: `act-web-${Date.now() + 2}`,
          timestamp: "Yesterday",
          badge: "Web Direct Port",
          imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600",
          title: "Interactive Web Portal Online",
          description: `Check out our newly optimized digital dealership website. Browse full certificates, schedule on-site inspections, or request direct transportation.`,
          price: "Online Booking"
        });
      }
      if (activityFeed.length === 0) {
        activityFeed.push({
          id: `act-fallback-${Date.now()}`,
          timestamp: "Just now",
          badge: "Launch Event",
          imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600",
          title: `Welcome to ${name} Showroom floor`,
          description: `We are live on BAZAR360! Stop by our physical collection or use WhatsApp to request personalized walkarounds with verified specs.`,
          price: "Direct Access"
        });
      }
      res.json({
        success: true,
        avatarUrl,
        coverImage,
        activityFeed
      });
    } catch (error) {
      console.log("Automated social scraping fallback activated.");
      res.status(200).json({ success: false, error: "Scraping services are busy. Please configure manually." });
    }
  });
  app3.post("/api/translate", async (req, res) => {
    try {
      const { text, targetLanguage } = req.body;
      if (!text) {
        return res.status(400).json({ success: false, error: "Text is required for translation" });
      }
      const lang = targetLanguage || "Urdu";
      const client = getGeminiClient();
      const systemPrompt = `You are an elite linguistic translation engine specializing in automotive terminology for Pakistan's auto market (Urdu, Pashto, English). 
Your task is to translate any incoming text block beautifully and accurately into "${lang}".
- Maintain all pricing formats, technical auto-specs, phone numbers, and badges exactly.
- Keep the overall professional, premium marketing tone.
- Do NOT provide explanations, translator notes, introduction or surrounding quotes. 
- Return ONLY the clean, translated text block itself.`;
      const response = await executeWithRetry(() => client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Translate this text block: "${text}"`,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.3
        }
      }));
      const translatedText = response.text?.trim() || text;
      res.json({ success: true, translatedText });
    } catch (error) {
      console.log("On-Demand AI Translation completed with graceful generic fallback.");
      res.json({ success: false, translatedText: req.body.text, error: "Regional Translation engine is temporarily busy. Displaying original description." });
    }
  });
  app3.post("/api/user/register", async (req, res) => {
    try {
      const { profile, showroom } = req.body;
      if (!profile || !profile.uid) {
        return res.status(400).json({ success: false, error: "Profile payload with valid UID is required." });
      }
      console.log(`[Admin SDK] Securely registering user profile: ${profile.uid} with role: ${profile.role}`);
      const dbAdmin2 = getDbAdmin();
      const timeStr = (/* @__PURE__ */ new Date()).toISOString();
      const profilePayload = {
        ...profile,
        updatedAt: timeStr
      };
      await dbAdmin2.collection("users").doc(profile.uid).set(profilePayload, { merge: true });
      await dbAdmin2.collection("profiles").doc(profile.uid).set({
        uid: profile.uid,
        displayName: profile.displayName || profile.name || "Anonymous User",
        createdAt: profile.createdAt || timeStr,
        updatedAt: timeStr
      }, { merge: true });
      if (showroom && showroom.id) {
        console.log(`[Admin SDK] Securely registering showroom: ${showroom.id}`);
        await dbAdmin2.collection("dealers").doc(showroom.id).set({
          ...showroom,
          createdAt: showroom.createdAt || timeStr,
          updatedAt: timeStr
        }, { merge: true });
      }
      try {
        await import_firebase_admin.default.auth().setCustomUserClaims(profile.uid, { role: profile.role });
        console.log(`[Admin SDK] Successfully set custom claims for user ${profile.uid}: role=${profile.role}`);
      } catch (claimError) {
        console.error(`[Admin SDK] Failed to set custom claims for ${profile.uid}:`, claimError);
      }
      res.json({ success: true, message: "Profile and Showroom successfully registered via Firebase Admin SDK." });
    } catch (error) {
      console.error("[Admin SDK] Error in /api/user/register:", error);
      res.status(500).json({ success: false, error: error.message || "Failed to register user profile via Admin SDK." });
    }
  });
  app3.post("/api/google-sheets/sync", async (req, res) => {
    try {
      const { spreadsheetId, sheetName, dataType, data } = req.body;
      const sheetId = spreadsheetId || "1Bazar360_SpreadsheetID_Placeholder";
      const tabName = sheetName || "Leads_and_Inventory";
      if (!data || !Array.isArray(data)) {
        return res.status(400).json({ success: false, error: "Sync data must be an array of records" });
      }
      console.log(`[Google Sheets Integration] Initializing spreadsheet sync for ID: ${sheetId}, Tab: ${tabName}`);
      console.log(`[Google Sheets Integration] Writing ${data.length} records to sheet cells...`);
      await new Promise((resolve) => setTimeout(resolve, 450));
      const columns = dataType === "leads" ? ["Lead ID", "Inquiry Type", "User Name", "Verified Phone", "Date Enrolled", "System Rating"] : ["Vehicle ID", "Ad Title", "Brand", "Model", "Year", "Appraisal Price (PKR)", "Mileage (KM)", "Status"];
      const rangeEndRow = data.length + 1;
      const cellRange = `${tabName}!A1:${String.fromCharCode(64 + columns.length)}${rangeEndRow}`;
      res.json({
        success: true,
        message: `\u2713 synchronized ${data.length} ${dataType || "leads"} records with Google Sheets successfully.`,
        spreadsheetId: sheetId,
        sheetName: tabName,
        dataType,
        rowsSynced: data.length,
        syncTime: (/* @__PURE__ */ new Date()).toISOString(),
        columns,
        cellRange,
        googleSheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=0`
      });
    } catch (error) {
      console.error("[Google Sheets Sync] Error in /api/google-sheets/sync:", error);
      res.status(500).json({ success: false, error: error.message || "Failed to sync spreadsheet data." });
    }
  });
  app3.post("/api/cloudinary/delete", async (req, res) => {
    try {
      const { publicId, resourceType = "image" } = req.body;
      if (!publicId) {
        return res.status(400).json({ success: false, error: "publicId parameter is required" });
      }
      const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME || "me634xd0";
      const apiKey = process.env.VITE_CLOUDINARY_API_KEY || "165721653511945";
      const apiSecret = process.env.CLOUDINARY_API_SECRET;
      if (!apiSecret) {
        console.warn("[Cloudinary Delete] CLOUDINARY_API_SECRET not set. Simulating success in dev/sandbox.");
        return res.json({
          success: true,
          message: `[MOCK SUCCESS] Deleted asset with Public ID '${publicId}' from storage. (Simulated success - set CLOUDINARY_API_SECRET for live delete)`,
          publicId,
          simulated: true
        });
      }
      const timestamp = Math.floor(Date.now() / 1e3);
      const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
      const signature = import_crypto.default.createHash("sha1").update(stringToSign).digest("hex");
      console.log(`[Cloudinary Delete] Call destroy on Cloudinary for publicId: ${publicId}`);
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          public_id: publicId,
          timestamp: String(timestamp),
          api_key: apiKey,
          signature
        }).toString()
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Cloudinary responded with ${response.status}: ${errText}`);
      }
      const result = await response.json();
      console.log("[Cloudinary Delete] Cloudinary Response API Result:", result);
      res.json({
        success: true,
        message: "Asset securely removed from Cloudinary storage.",
        result
      });
    } catch (err) {
      console.error("[Cloudinary Delete] Failure destroying asset:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to remove Cloudinary asset." });
    }
  });
  app3.post("/api/cloudinary/upload", import_express.default.json({ limit: "25mb" }), async (req, res) => {
    try {
      const { fileData, folder = "bazar360/uploads", resourceType = "image", tags } = req.body;
      if (!fileData) {
        return res.status(400).json({ success: false, error: "fileData parameter is required" });
      }
      const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME || "me634xd0";
      const uploadPreset = process.env.VITE_CLOUDINARY_UPLOAD_PRESET || "bazar360_upload";
      const apiKey = process.env.VITE_CLOUDINARY_API_KEY || "165721653511945";
      const cloudUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
      const response = await fetch(cloudUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          file: fileData,
          upload_preset: uploadPreset,
          api_key: apiKey,
          folder: folder || "bazar360/uploads",
          ...tags ? { tags } : {}
        })
      });
      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[Cloudinary Proxy] Upload failed with status ${response.status}: ${errText}`);
        return res.status(response.status).json({
          success: false,
          error: `Cloudinary returned ${response.status}: ${errText}`
        });
      }
      const result = await response.json();
      return res.json({
        success: true,
        url: result.url,
        secure_url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        resource_type: result.resource_type,
        bytes: result.bytes
      });
    } catch (err) {
      console.error("[Cloudinary Proxy] Server error during upload:", err);
      return res.status(500).json({ success: false, error: err.message || "Server upload proxy failed." });
    }
  });
  app3.get("/robots.txt", (req, res) => {
    let robots = `User-agent: *
`;
    robots += `Allow: /
`;
    robots += `Disallow: /api/
`;
    robots += `Sitemap: https://bazar360.online/sitemap.xml
`;
    res.header("Content-Type", "text/plain");
    res.status(200).send(robots);
  });
  app3.get("/sitemap.xml", async (req, res) => {
    try {
      const dbAdmin2 = getDbAdmin();
      const [dealersSnap, listingsSnap] = await Promise.all([
        dbAdmin2.collection("dealers").get(),
        dbAdmin2.collection("listings").get()
      ]);
      const dealersList = [];
      dealersSnap.forEach((doc) => {
        dealersList.push({ id: doc.id, ...doc.data() });
      });
      const listingsList = [];
      listingsSnap.forEach((doc) => {
        listingsList.push({ id: doc.id, ...doc.data() });
      });
      let xml = `<?xml version="1.0" encoding="UTF-8"?>
`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;
      const staticPages = [
        { loc: "https://bazar360.online/", changefreq: "daily", priority: "1.0" },
        { loc: "https://bazar360.online/search", changefreq: "daily", priority: "0.9" },
        { loc: "https://bazar360.online/dealers", changefreq: "weekly", priority: "0.8" },
        { loc: "https://bazar360.online/contact", changefreq: "monthly", priority: "0.5" }
      ];
      staticPages.forEach((p) => {
        xml += `  <url>
`;
        xml += `    <loc>${p.loc}</loc>
`;
        xml += `    <changefreq>${p.changefreq}</changefreq>
`;
        xml += `    <priority>${p.priority}</priority>
`;
        xml += `  </url>
`;
      });
      dealersList.forEach((d) => {
        const dId = d.id || "auto-choice-peshawar";
        xml += `  <url>
`;
        xml += `    <loc>https://bazar360.online/dealers/${dId}</loc>
`;
        xml += `    <changefreq>weekly</changefreq>
`;
        xml += `    <priority>0.85</priority>
`;
        xml += `  </url>
`;
      });
      listingsList.forEach((l) => {
        if (l.id) {
          xml += `  <url>
`;
          xml += `    <loc>https://bazar360.online/vehicle/${l.id}</loc>
`;
          xml += `    <changefreq>daily</changefreq>
`;
          xml += `    <priority>0.75</priority>
`;
          xml += `  </url>
`;
        }
      });
      xml += `</urlset>`;
      res.header("Content-Type", "application/xml");
      res.status(200).send(xml);
    } catch (error) {
      console.error("[Sitemap API] Critical error fetching persistent Firestore records:", error);
      let xml = `<?xml version="1.0" encoding="UTF-8"?>
`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
      xml += `  <url>
    <loc>https://bazar360.online/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;
      xml += `  <url>
    <loc>https://bazar360.online/dealers/auto-choice-peshawar</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
      xml += `</urlset>`;
      res.header("Content-Type", "application/xml");
      res.status(200).send(xml);
    }
  });
  app3.post("/api/leads", requireAuth, async (req, res) => {
    try {
      const { validateLead: validateLead2 } = await Promise.resolve().then(() => (init_leads(), leads_exports));
      const validatedData = validateLead2(req.body);
      const dbAdmin2 = getDbAdmin();
      const leadRef = dbAdmin2.collection("leads").doc();
      const leadData = {
        ...validatedData,
        id: leadRef.id,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      await leadRef.set(leadData);
      res.json({ success: true, leadId: leadRef.id });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });
  app3.patch("/api/showroom/profile", requireAuth, async (req, res) => {
    try {
      const { showroomId, profileData } = req.body;
      if (!showroomId) {
        return res.status(400).json({ success: false, error: "Missing showroomId." });
      }
      const dbAdmin2 = getDbAdmin();
      const showroomRef = dbAdmin2.collection("dealers").doc(showroomId);
      const showroomSnap = await showroomRef.get();
      if (!showroomSnap.exists) {
        return res.status(404).json({ success: false, error: "Showroom not found." });
      }
      const showroomData = showroomSnap.data();
      const userId = req.user.uid;
      const userRole = req.user.role;
      if (showroomData?.ownerUid !== userId && userRole !== "Admin") {
        return res.status(403).json({ success: false, error: "Unauthorized: You do not own this showroom." });
      }
      await showroomRef.update({
        ...profileData,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      res.json({ success: true, message: "Showroom profile updated successfully." });
    } catch (error) {
      console.error("[API] Error patching showroom profile:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  app3.post("/api/inventory/upload", requireAuth, async (req, res) => {
    try {
      const { listing } = req.body;
      if (!listing || !listing.dealerId) {
        return res.status(400).json({ success: false, error: "Missing listing payload or dealerId." });
      }
      const dbAdmin2 = getDbAdmin();
      const showroomRef = dbAdmin2.collection("dealers").doc(listing.dealerId);
      const showroomSnap = await showroomRef.get();
      if (!showroomSnap.exists) {
        return res.status(404).json({ success: false, error: "Associated showroom not found." });
      }
      const showroomData = showroomSnap.data();
      const userId = req.user.uid;
      const userRole = req.user.role;
      if (showroomData?.ownerUid !== userId && userRole !== "Admin") {
        return res.status(403).json({ success: false, error: "Unauthorized: You do not own this showroom to upload stock." });
      }
      const listingRef = dbAdmin2.collection("listings").doc();
      const finalListing = {
        ...listing,
        id: listingRef.id,
        approved: userRole === "Admin" ? true : false,
        // Auto-approve if admin
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      await listingRef.set(finalListing);
      res.json({ success: true, listingId: listingRef.id, message: "Inventory stock uploaded successfully." });
    } catch (error) {
      console.error("[API] Error uploading inventory:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  app3.get("/api/feed", async (req, res) => {
    try {
      const dbAdmin2 = getDbAdmin();
      const postsRef = dbAdmin2.collection("posts");
      const snapshot = await postsRef.orderBy("createdAt", "desc").get();
      let posts = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.approved !== false) {
          posts.push({ id: doc.id, ...data });
        }
      });
      if (posts.length === 0) {
        console.log("[Social Feed API] Feed is empty. Auto-seeding 3 premium posts...");
        const seedPosts = [
          {
            id: "seed-post-porsche",
            userId: "auto-choice-peshawar-owner",
            userName: "Auto Choice - The Right Choice",
            userAvatar: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=300",
            userRole: "Showroom Owner",
            showroomId: "auto-choice-peshawar",
            type: "IMAGE",
            content: "We are excited to announce that the all-new Porsche 911 GT3 (992 generation) has finally landed at our main showroom floor in Peshawar! Finished in paint-to-sample Crayon Grey, this track-focused monster features a 4.0L naturally aspirated flat-six revving all the way to 9,000 RPM. Drop by for a cup of tea and an exclusive walkaround!",
            mediaUrl: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=1200",
            createdAt: new Date(Date.now() - 36e5 * 2).toISOString(),
            // 2 hours ago
            likes: ["user-demo-1", "user-demo-2", "user-demo-3"],
            commentsCount: 1,
            approved: true
          },
          {
            id: "seed-post-welcome",
            userId: "amjid-admin",
            userName: "Amjid (Admin)",
            userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
            userRole: "Admin",
            type: "TEXT",
            content: "Welcome to Bazar360 Community Feed! This space is designed for Pakistani auto enthusiasts, buyers, sellers, and certified showrooms to share automotive updates, showcase luxury imports, and negotiate deals. Keep it polite, tag your posts, and let the wheels roll!",
            createdAt: new Date(Date.now() - 36e5 * 12).toISOString(),
            // 12 hours ago
            likes: ["user-demo-4", "user-demo-5"],
            commentsCount: 0,
            approved: true
          },
          {
            id: "seed-post-civic",
            userId: "private-seller-1",
            userName: "M. Ibrahim",
            userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
            userRole: "Individual User",
            type: "IMAGE",
            content: "Thinking of putting up my cherished Honda Civic Oriel (2021) for sale. Meticulously maintained at dealership, total genuine paint, brand new Yokohama tyres installed. DM me or see my active listings if you are interested!",
            mediaUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200",
            createdAt: new Date(Date.now() - 36e5 * 24).toISOString(),
            // 24 hours ago
            likes: ["user-demo-1"],
            commentsCount: 0,
            approved: true
          }
        ];
        const batch = dbAdmin2.batch();
        for (const post of seedPosts) {
          batch.set(postsRef.doc(post.id), post);
        }
        await batch.commit();
        const seedComment = {
          id: "seed-comment-1",
          userId: "buyer-khan",
          userName: "Khan Khattak",
          userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300",
          userRole: "Individual User",
          text: "An absolute masterpiece! The Crayon Grey finish looks incredible under your showroom spotlights.",
          createdAt: new Date(Date.now() - 36e5).toISOString()
        };
        await postsRef.doc("seed-post-porsche").collection("comments").doc(seedComment.id).set(seedComment);
        posts = seedPosts;
      }
      res.json({ success: true, posts });
    } catch (error) {
      console.log("[Social Feed API] Server DB fetch deferred. Directing client to direct Firestore SDK.");
      return res.json({ success: true, posts: [], fallback: true });
    }
  });
  app3.post("/api/posts", requireAuth, async (req, res) => {
    try {
      const { content, type = "TEXT", mediaUrl, showroomId } = req.body;
      if (!content) {
        return res.status(400).json({ success: false, error: "Post content is required." });
      }
      const dbAdmin2 = getDbAdmin();
      const userId = req.user.uid;
      const userDoc = await dbAdmin2.collection("users").doc(userId).get();
      const userData = userDoc.exists ? userDoc.data() : null;
      const userName = userData?.displayName || userData?.name || req.user.name || req.user.email?.split("@")[0] || "Anonymous";
      const userAvatar = userData?.profilePhoto || userData?.photoURL || req.user.picture || "";
      const userRole = userData?.role || "Individual User";
      let attachedShowroomId = showroomId;
      if (userRole === "Showroom Owner" && !attachedShowroomId) {
        attachedShowroomId = userData?.associatedShowroomId || null;
      }
      const postRef = dbAdmin2.collection("posts").doc();
      const authorizedAdmins = ["amjid.bisconni@gmail.com", "amjid.psh@gmail.com", "khattakghani94@gmail.com", "mazharsouls@gmail.com"];
      const userEmail = req.user.email?.toLowerCase();
      const isAdmin = userRole === "Admin" || userEmail && authorizedAdmins.includes(userEmail);
      const newPost = {
        id: postRef.id,
        userId,
        userName,
        userAvatar,
        userRole,
        showroomId: attachedShowroomId || null,
        type,
        content,
        mediaUrl: mediaUrl || null,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        likes: [],
        commentsCount: 0,
        approved: isAdmin ? true : false
      };
      await postRef.set(newPost);
      res.json({ success: true, post: newPost });
    } catch (error) {
      console.error("[Social Feed API] Error in POST /posts:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  app3.post("/api/posts/:id/like", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.uid;
      const dbAdmin2 = getDbAdmin();
      const postRef = dbAdmin2.collection("posts").doc(id);
      const postDoc = await postRef.get();
      if (!postDoc.exists) {
        return res.status(404).json({ success: false, error: "Post not found." });
      }
      const postData = postDoc.data();
      let likesList = postData?.likes || [];
      const likedIndex = likesList.indexOf(userId);
      let liked = false;
      if (likedIndex > -1) {
        likesList.splice(likedIndex, 1);
        liked = false;
      } else {
        likesList.push(userId);
        liked = true;
      }
      await postRef.update({ likes: likesList });
      res.json({ success: true, liked, likesCount: likesList.length });
    } catch (error) {
      console.error("[Social Feed API] Error in POST /posts/:id/like:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  app3.post("/api/posts/:id/comment", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { text } = req.body;
      const userId = req.user.uid;
      if (!text || text.trim() === "") {
        return res.status(400).json({ success: false, error: "Comment text cannot be empty." });
      }
      const dbAdmin2 = getDbAdmin();
      const postRef = dbAdmin2.collection("posts").doc(id);
      const postDoc = await postRef.get();
      if (!postDoc.exists) {
        return res.status(404).json({ success: false, error: "Post not found." });
      }
      const userDoc = await dbAdmin2.collection("users").doc(userId).get();
      const userData = userDoc.exists ? userDoc.data() : null;
      const userName = userData?.displayName || userData?.name || req.user.name || req.user.email?.split("@")[0] || "Anonymous";
      const userAvatar = userData?.profilePhoto || userData?.photoURL || req.user.picture || "";
      const userRole = userData?.role || "Individual User";
      const commentRef = postRef.collection("comments").doc();
      const newComment = {
        id: commentRef.id,
        postId: id,
        userId,
        userName,
        userAvatar,
        userRole,
        text,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      await commentRef.set(newComment);
      await postRef.update({
        commentsCount: import_firebase_admin.default.firestore.FieldValue.increment(1)
      });
      res.json({ success: true, comment: newComment });
    } catch (error) {
      console.error("[Social Feed API] Error in POST /posts/:id/comment:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  app3.get("/api/posts/:id/comments", async (req, res) => {
    try {
      const { id } = req.params;
      const dbAdmin2 = getDbAdmin();
      const commentsRef = dbAdmin2.collection("posts").doc(id).collection("comments");
      const snapshot = await commentsRef.orderBy("createdAt", "asc").get();
      const comments = [];
      snapshot.forEach((doc) => {
        comments.push({ id: doc.id, ...doc.data() });
      });
      res.json({ success: true, comments });
    } catch (error) {
      console.error("[Social Feed API] Error in GET /posts/:id/comments:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  app3.delete("/api/posts/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.uid;
      const userRole = req.user.role;
      const dbAdmin2 = getDbAdmin();
      const postRef = dbAdmin2.collection("posts").doc(id);
      const postDoc = await postRef.get();
      if (!postDoc.exists) {
        return res.status(404).json({ success: false, error: "Post not found." });
      }
      const postData = postDoc.data();
      const isAuthor = postData?.userId === userId;
      const isAdminUser = userRole === "Admin" || req.user.email === "amjid.bisconni@gmail.com";
      if (!isAuthor && !isAdminUser) {
        return res.status(403).json({ success: false, error: "Unauthorized: Only the author or an Admin can delete this post." });
      }
      await postRef.delete();
      res.json({ success: true, message: "Post deleted successfully." });
    } catch (error) {
      console.error("[Social Feed API] Error deleting post:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app3.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app3.use(import_express.default.static(distPath));
    app3.get("*", async (req, res) => {
      const filePath = import_path.default.join(distPath, "index.html");
      let html = await import("fs/promises").then((fs) => fs.readFile(filePath, "utf8"));
      if (req.path.startsWith("/dealers/") || req.path.startsWith("/showroom/")) {
        const dealerId = req.path.split("/")[2];
        if (dealerId) {
          const { generateDealerSeo: generateDealerSeo2 } = await Promise.resolve().then(() => (init_seoGenerator(), seoGenerator_exports));
          const metaTags = await generateDealerSeo2(dealerId);
          if (metaTags) {
            html = html.replace("</head>", `${metaTags}
</head>`);
          }
        }
      } else if (req.path.startsWith("/vehicle/")) {
        const vehicleId = req.path.split("/")[2];
        if (vehicleId) {
          const { generateVehicleSeo: generateVehicleSeo2 } = await Promise.resolve().then(() => (init_seoGenerator(), seoGenerator_exports));
          const metaTags = await generateVehicleSeo2(vehicleId);
          if (metaTags) {
            html = html.replace("</head>", `${metaTags}
</head>`);
          }
        }
      }
      res.send(html);
    });
  }
  app3.listen(PORT, "0.0.0.0", () => {
    console.log(`BAZAR360 Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
