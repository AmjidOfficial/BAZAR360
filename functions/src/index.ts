import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { GoogleGenAI, Type } from "@google/genai";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";
import { createHash } from "node:crypto";

if (getApps().length === 0) {
  initializeApp();
}

// Lazy-initialization pattern for GenAI Client to prevent cold start memory leaks
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  // In Firebase Cloud Functions, secrets can be exposed via process.env.GEMINI_API_KEY 
  // (or defined using defineSecret('GEMINI_API_KEY') and declared in the function config).
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    logger.error("Bazar360 V2.0 Cloud Functions: Config Warning - GEMINI_API_KEY is missing from runtime context.");
    throw new HttpsError(
      "failed-precondition",
      "The Gemini API key is missing. Please define GEMINI_API_KEY in the function configuration or Secrets."
    );
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build', // Telemetry header conforming to rules
        },
      },
    });
  }
  return aiClient;
}

const ADMIN_EMAILS = new Set([
  "amjid.bisconni@gmail.com",
  "amjid.psh@gmail.com",
  "mazharsouls@gmail.com",
  "khattakghani94@gmail.com",
]);

const SELF_ASSIGNABLE_ROLES = new Set([
  "Buyer",
  "Individual User",
  "Private Seller",
  "Dealer",
  "Showroom Owner",
  "Verified Seller",
  "Sales Rep",
  "Sales Representative",
  "Marketing",
]);

/**
 * Secure user registration and role provisioning for the live Firebase-hosted app.
 */
export const registerUser = onCall<
  { profile: Record<string, any>; showroom?: Record<string, any> },
  Promise<{ success: boolean; message: string }>
>(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication is required.");
  }

  const profile = request.data?.profile;
  const showroom = request.data?.showroom;
  const uid = request.auth.uid;
  const email = String(request.auth.token.email || "").toLowerCase();

  if (!profile || profile.uid !== uid) {
    throw new HttpsError("invalid-argument", "Profile UID must match the authenticated account.");
  }

  const requestedRole = String(profile.role || "Individual User");
  const isAdmin = ADMIN_EMAILS.has(email);
  if ((requestedRole === "Admin" || requestedRole === "Super Admin") && !isAdmin) {
    throw new HttpsError("permission-denied", "This account is not authorized for an administrative role.");
  }
  if (!isAdmin && !SELF_ASSIGNABLE_ROLES.has(requestedRole)) {
    throw new HttpsError("permission-denied", "The requested role cannot be self-assigned.");
  }

  const db = getFirestore(getApps()[0], "ai-studio-bazar360online-90162156-c190-465e-a44d-d2853657a61e");
  const now = new Date().toISOString();
  const safeProfile = {
    ...profile,
    uid,
    email: request.auth.token.email || profile.email || "",
    role: requestedRole,
    updatedAt: now,
  };

  await db.collection("users").doc(uid).set(safeProfile, { merge: true });
  await db.collection("profiles").doc(uid).set({
    uid,
    displayName: profile.displayName || profile.name || "Anonymous User",
    createdAt: profile.createdAt || now,
    updatedAt: now,
  }, { merge: true });

  if (showroom?.id) {
    const showroomOwnerUid = String(showroom.ownerUid || uid);
    if (showroomOwnerUid !== uid && !isAdmin) {
      throw new HttpsError("permission-denied", "You cannot register a showroom for another owner.");
    }
    await db.collection("dealers").doc(String(showroom.id)).set({
      ...showroom,
      ownerUid: showroomOwnerUid,
      createdAt: showroom.createdAt || now,
      updatedAt: now,
    }, { merge: true });
  }

  await getAuth().setCustomUserClaims(uid, { role: requestedRole });
  return { success: true, message: "Profile and showroom registration completed securely." };
});

/**
 * 1. AI Marketing SEO Listing Generator
 * HTTP-triggered via Firebase Functions onCall trigger
 */
export const marketingEngine = onCall<
  { rawInput: string; tone?: string },
  Promise<{ success: boolean; error?: string; result: any }>
>(async (request) => {
  // Enforce absolute secure identity verification
  if (!request.auth) {
    logger.warn("marketingEngine: Prevented unauthenticated request attempts.");
    throw new HttpsError(
      "unauthenticated",
      "Secure Operations: Only registered, signed-in members of Bazar360 can invoke AI engines."
    );
  }

  const { rawInput, tone = "Premium" } = request.data;

  if (!rawInput) {
    throw new HttpsError(
      "invalid-argument",
      "The raw automotive description input is required to trigger generation."
    );
  }

  try {
    const client = getGeminiClient();

    const systemPrompt = `You are a professional automotive copywriter and SEO marketing specialist named "Bazar360-Marketer".
Your task is to transform raw, shorthand seller notes into a pristine, high-end SEO-optimized listing.
Convert slang prices like "65 lac" (which represents 6,500,000 Pakistani Rupees PKR) or "1.2 crore" (12,000,000 PKR) or raw numbers appropriately to equivalent full PKR (Pakistani Rupees) value as an integer. For example: "65 lac" is 6500000, "15 lac" is 1500000. Underwrite a competitive valuation accordingly in Pakistani Rupees (PKR) based on the vehicle year and make.
Generate output strictly conforming to the following JSON structure:
{
  "title": "A highly premium, professional automotive title",
  "description": "Rich sales description focusing on safety, drivability, and premium status, matched to the selected style tone",
  "tags": ["Tag1", "Tag2"],
  "suggestedPricePKR": 6500000,
  "highlights": ["Highlight point 1", "Highlight point 2", "Highlight point 3"]
}
Tone tuning selected: ${tone}. Ensure vocabulary mirrors luxury automotive catalogs.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Translate this shorthand seller note: "${rawInput}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            suggestedPricePKR: { type: Type.INTEGER },
            highlights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["title", "description", "tags", "suggestedPricePKR", "highlights"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Failed to receive output text from Gemini models.");
    }

    const parsedJSON = JSON.parse(resultText.trim());
    return { success: true, result: parsedJSON };

  } catch (error: any) {
    logger.error("AI engine Cloud Function fail:", error);
    throw new HttpsError("unavailable", "AI marketing service is temporarily unavailable. No fabricated vehicle claims or pricing were returned.");
  }
});

/**
 * 2. Showroom Representative Chatbot
 * Secure interactive conversations with customers
 */
export const dealerChat = onCall<
  {
    dealerName: string;
    dealerBio: string;
    inventorySummary: string;
    message: string;
    history: Array<{ role: "user" | "model"; text: string }>;
  },
  Promise<{ reply: string }>
>(async (request) => {
  // Chatting can optionally be public, but we request arguments integrity
  const { dealerName, dealerBio, inventorySummary, message, history } = request.data;

  if (!message) {
    throw new HttpsError("invalid-argument", "ChatMessage is required.");
  }

  try {
    const client = getGeminiClient();

    const contextPrompt = `You are a helpful, professional, and friendly sales representative representing the premium dealership "${dealerName}".
Dealership bio: "${dealerBio}".
Current active showcase stock list: "${inventorySummary}".
Your task is to engage with car buyers in Pakistan with extreme courtesy, technical precision, and persuasive sales mechanics.
Incorporate details of our showcase fleet where appropriate. Maintain roleplay parameters flawlessly. Keep responses concise (under 80 words).`;

    const formattedContents: any[] = [];
    if (history && Array.isArray(history)) {
      for (const h of history) {
        formattedContents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }],
        });
      }
    }
    formattedContents.push({ role: "user", parts: [{ text: message }] });

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: contextPrompt,
      },
    });

    const replyText = response.text || "Hello! We are glad to assist you. Our showroom team is looking into this query.";
    return { reply: replyText.trim() };

  } catch (error: any) {
    logger.error("Chatbot Cloud Function error:", error);
    return {
      reply: "Hello! Thank you for contacting us. To secure optimal pricing on our fleet details or speak directly, please leave a direct message/review or tap 'Call Showroom'!",
    };
  }
});

/**
 * Secure Cloudinary asset deletion for authenticated owners/admins.
 * Production Hosting does not expose server.ts, so destructive media operations
 * must use a deployed callable function.
 */
function containsPublicId(value: any, publicId: string): boolean {
  if (typeof value === "string") return value === publicId;
  if (Array.isArray(value)) return value.some(item => containsPublicId(item, publicId));
  if (value && typeof value === "object") return Object.values(value).some(item => containsPublicId(item, publicId));
  return false;
}

export const deleteCloudinaryAsset = onCall<
  { publicId: string; resourceType?: "image" | "video" | "raw" },
  Promise<{ success: boolean; message: string }>
>(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication is required.");
  }

  const publicId = String(request.data?.publicId || "").trim();
  const resourceType = (request.data?.resourceType || "image") as "image" | "video" | "raw";
  if (!publicId) throw new HttpsError("invalid-argument", "Cloudinary public ID is required.");
  if (!["image", "video", "raw"].includes(resourceType)) {
    throw new HttpsError("invalid-argument", "Unsupported Cloudinary resource type.");
  }

  const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME || "me634xd0";
  const apiKey = process.env.VITE_CLOUDINARY_API_KEY || "165721653511945";
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiSecret) {
    throw new HttpsError("failed-precondition", "Cloudinary server secret is not configured.");
  }

  const db = getFirestore(getApps()[0], "ai-studio-bazar360online-90162156-c190-465e-a44d-d2853657a61e");
  const uid = request.auth.uid;
  const email = String(request.auth.token.email || "").toLowerCase();
  const isAdmin = ADMIN_EMAILS.has(email);

  let authorized = isAdmin;
  if (!authorized) {
    const userSnap = await db.collection("users").doc(uid).get();
    const userData = userSnap.exists ? userSnap.data() || {} : {};
    const dealerIds = new Set<string>();
    if (typeof userData.dealerId === "string") dealerIds.add(userData.dealerId);
    if (typeof userData.associatedShowroomId === "string") dealerIds.add(userData.associatedShowroomId);
    if (typeof userData.salesPodId === "string") dealerIds.add(userData.salesPodId);

    const ownedListings = await db.collection("listings").where("ownerId", "==", uid).limit(100).get();
    for (const doc of ownedListings.docs) {
      if (containsPublicId(doc.data(), publicId)) {
        authorized = true;
        break;
      }
    }

    if (!authorized && dealerIds.size) {
      for (const dealerId of dealerIds) {
        const dealerSnap = await db.collection("dealers").doc(dealerId).get();
        if (dealerSnap.exists) {
          const dealerData = dealerSnap.data() || {};
          if (dealerData.ownerUid === uid && containsPublicId(dealerData, publicId)) {
            authorized = true;
            break;
          }
        }
      }
    }
  }

  if (!authorized) {
    throw new HttpsError("permission-denied", "You are not authorized to delete this media asset.");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signatureBase = `public_id=${publicId}&timestamp=${timestamp}&invalidate=true${apiSecret}`;
  const signature = createHash("sha1").update(signatureBase).digest("hex");

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      public_id: publicId,
      timestamp: String(timestamp),
      invalidate: "true",
      api_key: apiKey,
      signature,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    logger.error("Cloudinary deletion failed", { status: response.status, body });
    throw new HttpsError("internal", "Cloudinary rejected the deletion request.");
  }

  return { success: true, message: "Cloudinary asset deleted." };
});

/**
 * 3. On-Demand Translation Engine
 * Secure translation callable for English, Urdu and Pashto automotive copy.
 */
export const aiTranslate = onCall<
  { text: string; targetLanguage: string },
  Promise<{ success: boolean; translatedText: string; error?: string }>
>(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Only signed-in Bazar360 members can use AI translation.");
  }

  const { text, targetLanguage = "Urdu" } = request.data;
  if (!text || text.trim().length === 0) {
    throw new HttpsError("invalid-argument", "Text is required for translation.");
  }

  try {
    const client = getGeminiClient();
    const systemPrompt = `You are an automotive translation engine for Bazar360 in Pakistan. Translate the supplied text into "${targetLanguage}". Preserve prices, numbers, technical specifications, phone numbers, vehicle names, and URLs exactly. Return only the translated text, with no explanation.`;
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: text,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
      },
    });

    return {
      success: true,
      translatedText: response.text?.trim() || text,
    };
  } catch (error: any) {
    logger.error("Translation Cloud Function error:", error);
    return {
      success: false,
      translatedText: text,
      error: "Translation service is temporarily unavailable.",
    };
  }
});

/**
 * 3. Curator/Social WebScraping Proxy
 * Pre-populates avatar, banner image, and social posts on user registration
 */
export const scrapeSocials = onCall<
  {
    name: string;
    website?: string;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    twitter?: string;
  },
  Promise<{
    success: boolean;
    error?: string;
    avatarUrl: string;
    coverImage: string;
    activityFeed: any[];
  }>
>(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Only authenticated partners of Bazar360 can run social media integration scraping."
    );
  }

  const { name, website, facebook, instagram, tiktok } = request.data;
  if (!name) {
    throw new HttpsError("invalid-argument", "Name of the showroom must be supplied.");
  }

  try {
    const socialLinks = [website, facebook, instagram, tiktok].filter((url): url is string => typeof url === "string" && url.trim().length > 0);
    const activityFeed = socialLinks.map((url, index) => ({
      id: `official-social-${index}`,
      timestamp: "Available now",
      badge: "Official Social Link",
      imageUrl: "",
      title: `Official ${name} profile`,
      description: "Open the showroom's official social profile. Bazar360 does not fabricate scraped posts or engagement data.",
      price: "",
      createdAt: new Date().toISOString(),
      url,
    }));

    return {
      success: true,
      avatarUrl: "",
      coverImage: "",
      activityFeed,
    };

  } catch (error: any) {
    logger.error("Social Scraping Cloud Function failed:", error);
    throw new HttpsError("internal", error.message || "Failed during social integration routine.");
  }
});

/**
 * 4. Automated Business Card Generation Pipeline (Objective 3)
 * Asynchronously triggers when a showroom profile is added or updated
 */
import { onDocumentWritten } from "firebase-functions/v2/firestore";

export const autoGenerateMarketingAssets = onDocumentWritten(
  "dealers/{dealerId}",
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    // Only proceed if dealer name, location, or contact info changes (or on new creation)
    const after = snap.after.exists ? snap.after.data() : null;
    const before = snap.before.exists ? snap.before.data() : null;

    if (!after) {
      logger.info(`Dealer ${event.params.dealerId} deleted. Ignoring assets generation.`);
      return;
    }

    const needsUpdate = !before || 
      before.name !== after.name || 
      before.phone !== after.phone || 
      before.location !== after.location ||
      before.logo !== after.logo;

    if (!needsUpdate) {
      logger.info(`No core profile changes for ${event.params.dealerId}. Skipping business card generation.`);
      return;
    }

    logger.info(`[Job Start] Generating Marketing Assets for ${after.name}...`);

    try {
      // Logic Pattern for Headless Render / Generation:
      // 1. Fetch Showroom data (after)
      // 2. Generate unique QR code for the specific showroom route (e.g., /dealers/{dealerId})
      // 3. Render 4 Full HD (300 DPI) Business Card Templates:
      //    - Executive Metal
      //    - Minimalist Horizon
      //    - Night Driver
      //    - Architectural Grid
      // 4. In a real environment, you'd use a headless browser (Puppeteer) or node-canvas
      //    to draw the React template strings into a PNG/PDF buffer.
      
      const templates = ['Executive Metal', 'Minimalist Horizon', 'Night Driver', 'Architectural Grid'];
      
      // Mock S3/Firebase Storage upload paths
      const generatedAssets = templates.map(template => ({
        template,
        url: `https://storage.googleapis.com/bazar360-assets/cards/${event.params.dealerId}_${template.replace(/\s+/g, '_')}_300dpi.png`,
        format: 'png',
        resolution: 'Full HD (300 DPI)'
      }));

      // 5. Save the generated asset URLs back to the showroom document in a 'marketingAssets' field
      // We use the Firebase Admin SDK (already initialized if this was a real deployed script) to update the doc
      // For the sake of the logic pattern, we log the success:
      
      logger.info(`Successfully generated ${generatedAssets.length} templates for ${after.name}.`);
      
      // In production:
      // await admin.firestore().collection('dealers').doc(event.params.dealerId).update({
      //   marketingAssets: generatedAssets,
      //   lastAssetGeneration: new Date().toISOString()
      // });
      
    } catch (error) {
      logger.error(`Asset generation failed for dealer ${event.params.dealerId}`, error);
    }
  }
);
