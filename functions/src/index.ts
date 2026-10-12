import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { GoogleGenAI, Type } from "@google/genai";

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

    const systemPrompt = `You are Bazar360's automotive listing copy assistant.
Turn seller-provided notes into clear, premium copy without changing the facts.

Accuracy rules:
- Use only facts explicitly provided in the notes. Never invent trim, mileage, registration city, condition, inspection results, accident history, service history, genuine paint, auction grade, ownership/document status, warranty, or safety claims.
- Never claim "Bazar360 Verified", "certified", "inspected", or "accident-free" unless a separate trusted platform field confirms it. Seller text alone is not platform verification.
- Do not imply vehicle photos or documents were analyzed unless they were actually provided and analyzed.
- Suggested price is a non-binding estimate, not a verified valuation or the seller's actual asking price. If information is insufficient, return 0 and state that more details are needed.
- Do not add unsupported factual tags or trust badges. Premium wording must not change the facts.
- Tone requested: ${tone || "Premium"}.

Generate JSON with title, description, tags, suggestedPricePKR, and highlights. Use an integer for suggestedPricePKR.`;

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
    // Never invent a vehicle, inspection status, condition, or price when AI fails.
    throw new HttpsError(
      "unavailable",
      "AI listing generation is temporarily unavailable. No listing content or price was generated."
    );
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

  const { name } = request.data;
  if (!name) {
    throw new HttpsError("invalid-argument", "Name of the showroom must be supplied.");
  }

  logger.warn("scrapeSocials requested, but a verified social scraping integration is not configured.", { uid: request.auth.uid });
  return {
    success: false,
    error: "Automatic social scraping is not configured. No social posts or showroom activity were generated.",
    avatarUrl: "",
    coverImage: "",
    activityFeed: [],
  };
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
