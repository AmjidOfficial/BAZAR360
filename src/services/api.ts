import { httpsCallable } from 'firebase/functions';
import { getToken } from 'firebase/app-check';
import { functions, appCheck, db, auth } from '../firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  runTransaction
} from 'firebase/firestore';

// Strong type definitions matching the Express payloads and response shapes
export interface MarketingEngineRequest {
  rawInput: string;
  tone?: string;
}

export interface MarketingEngineResponse {
  success: boolean;
  error?: string;
  result: {
    title: string;
    description: string;
    tags: string[];
    suggestedPricePKR: number;
    highlights: string[];
  };
}

export interface DealerChatRequest {
  dealerName: string;
  dealerBio: string;
  inventorySummary: string;
  message: string;
  history: Array<{ role: 'user' | 'model'; text: string }>;
}

export interface DealerChatResponse {
  reply: string;
}

export interface ScrapeSocialsRequest {
  name: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  twitter?: string;
}

export interface ScrapeSocialsResponse {
  success: boolean;
  error?: string;
  avatarUrl: string;
  coverImage: string;
  activityFeed: Array<{
    id: string;
    timestamp: string;
    badge: string;
    imageUrl: string;
    title: string;
    description: string;
    price: string;
  }>;
}

// Environment Detection Helper
const isGitHubPages = window.location.hostname.includes('github.io') || window.location.hostname.includes('bazar360.online');
const isProduction = process.env.NODE_ENV === 'production' || isGitHubPages;

/**
 * Safely fetches the current Firebase App Check token to protect our local backend.
 */
async function getAppCheckHeader(): Promise<Record<string, string>> {
  if (!appCheck) return {};
  try {
    const appCheckTokenResult = await getToken(appCheck, false);
    return { 'X-Firebase-AppCheck': appCheckTokenResult.token };
  } catch (error) {
    console.warn('[App Check] Failed to retrieve App Check token:', error);
    return {};
  }
}

/**
 * AI Marketing Engine Handler
 */
export async function callMarketingEngine(rawInput: string, tone = 'Premium'): Promise<MarketingEngineResponse> {
  if (isProduction) {
    console.log('BAZAR360 V2.0: Triggering Serverless Marketing Engine Cloud Function...');
    try {
      const marketingEngineFn = httpsCallable<MarketingEngineRequest, MarketingEngineResponse>(functions, 'marketingEngine');
      const response = await marketingEngineFn({ rawInput, tone });
      return response.data;
    } catch (error: any) {
      console.warn('Serverless callable failed or is unconfigured. Triggering local bypass...', error);
      throw error;
    }
  }

  // Fallback to Express backend locally in Dev container or sandbox
  console.log('BAZAR360 V2.0: Fetching from local container dev Express API...');
  const appCheckHeader = await getAppCheckHeader();
  const response = await fetch('/api/ai/marketing-engine', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...appCheckHeader
    },
    body: JSON.stringify({ rawInput, tone }),
  });
  if (!response.ok) {
    throw new Error('Local dev host API not responding or offline.');
  }
  return response.json();
}

/**
 * Showroom Representative Chatbot Handler
 */
export async function callDealerChat(
  dealerName: string,
  dealerBio: string,
  inventorySummary: string,
  message: string,
  history: Array<{ role: 'user' | 'model'; text: string }>
): Promise<DealerChatResponse> {
  if (isProduction) {
    console.log('BAZAR360 V2.0: Triggering Serverless Dealer Chatbot Cloud Function...');
    try {
      const dealerChatFn = httpsCallable<DealerChatRequest, DealerChatResponse>(functions, 'dealerChat');
      const response = await dealerChatFn({
        dealerName,
        dealerBio,
        inventorySummary,
        message,
        history,
      });
      return response.data;
    } catch (error: any) {
      console.warn('Serverless dealer chatbot callable failed. Triggering fallback dialogue...', error);
      throw error;
    }
  }

  // Fallback to Local Express dev server
  const appCheckHeader = await getAppCheckHeader();
  const response = await fetch('/api/dealer/chat', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...appCheckHeader
    },
    body: JSON.stringify({
      dealerName,
      dealerBio,
      inventorySummary,
      message,
      history,
    }),
  });
  if (!response.ok) {
    throw new Error('Local dev chatbot API offline.');
  }
  return response.json();
}

/**
 * Social Scraper and Asset Populator Handler
 */
export async function callScrapeSocials(socials: ScrapeSocialsRequest): Promise<ScrapeSocialsResponse> {
  if (isProduction) {
    console.log('BAZAR360 V2.0: Triggering Serverless Social WebScraping Cloud Function...');
    try {
      const scrapeSocialsFn = httpsCallable<ScrapeSocialsRequest, ScrapeSocialsResponse>(functions, 'scrapeSocials');
      const response = await scrapeSocialsFn(socials);
      return response.data;
    } catch (error: any) {
      console.warn('Serverless scraper callable failed. Triggering sandbox fallback engine...', error);
      throw error;
    }
  }

  // Fallback to Local Express dev server
  const appCheckHeader = await getAppCheckHeader();
  const response = await fetch('/api/scrape-socials', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...appCheckHeader
    },
    body: JSON.stringify(socials),
  });
  if (!response.ok) {
    throw new Error('Local dev scraper API offline.');
  }
  return response.json();
}

export interface AiTranslateRequest {
  text: string;
  targetLanguage: string;
}

export interface AiTranslateResponse {
  success: boolean;
  translatedText: string;
  error?: string;
}

/**
 * On-Demand Translation Handler
 */
export async function callAiTranslate(text: string, targetLanguage = 'Urdu'): Promise<AiTranslateResponse> {
  if (isProduction) {
    console.log('BAZAR360 V2.0: Triggering Serverless Translation Cloud Function...');
    try {
      const aiTranslateFn = httpsCallable<AiTranslateRequest, AiTranslateResponse>(functions, 'aiTranslate');
      const response = await aiTranslateFn({ text, targetLanguage });
      return response.data;
    } catch (error: any) {
      console.warn('Serverless translate callable failed. Triggering local/mock translation bypass...', error);
      // Fallback if callable is not deployed: simulate or use lightweight Urdu translation
      return {
        success: false,
        translatedText: text,
        error: error.message
      };
    }
  }

  // Fallback to Local Express dev server in Sandbox/Container
  const appCheckHeader = await getAppCheckHeader();
  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...appCheckHeader
    },
    body: JSON.stringify({ text, targetLanguage }),
  });
  if (!response.ok) {
    throw new Error('Local dev translation API offline.');
  }
  return response.json();
}

/**
 * Register User Profile and optional Showroom via Secure full-stack Admin SDK backend
 */
export async function callRegisterUser(
  profile: any, 
  showroom?: any
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const appCheckHeader = await getAppCheckHeader();
    const response = await fetch('/api/user/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...appCheckHeader
      },
      body: JSON.stringify({ profile, showroom }),
    });
    if (!response.ok) {
      throw new Error('Registration backend API not responding or offline.');
    }
    return response.json();
  } catch (error: any) {
    console.error('Registration API Error:', error);
    return { success: false, error: error.message || 'Failed to communicate with registration API.' };
  }
}

/**
 * Synchronize leads or inventory to Google Sheets via secure full-stack backend
 */
export async function callGoogleSheetsSync(payload: {
  spreadsheetId: string;
  sheetName: string;
  dataType: 'leads' | 'inventory';
  data: any[];
}): Promise<{ success: boolean; message?: string; error?: string; [key: string]: any }> {
  try {
    const appCheckHeader = await getAppCheckHeader();
    const response = await fetch('/api/google-sheets/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...appCheckHeader
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('Google Sheets sync backend API not responding or offline.');
    }
    return response.json();
  } catch (error: any) {
    console.error('Google Sheets Sync API Error:', error);
    return { success: false, error: error.message || 'Failed to communicate with Sheets sync API.' };
  }
}

/**
 * ==========================================
 * BAZAR360 COMMUNITY SOCIAL ENGINE API CALLS
 * ==========================================
 */

/**
 * ==========================================
 * BAZAR360 COMMUNITY SOCIAL ENGINE API CALLS
 * ==========================================
 */

const SEED_POSTS = [
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
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    likes: ["user-demo-1", "user-demo-2", "user-demo-3"],
    commentsCount: 1
  },
  {
    id: "seed-post-welcome",
    userId: "amjid-admin",
    userName: "Amjid (Admin)",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
    userRole: "Admin",
    type: "TEXT",
    content: "Welcome to Bazar360 Community Feed! This space is designed for Pakistani auto enthusiasts, buyers, sellers, and certified showrooms to share automotive updates, showcase luxury imports, and negotiate deals. Keep it polite, tag your posts, and let the wheels roll!",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    likes: ["user-demo-4", "user-demo-5"],
    commentsCount: 0
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
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    likes: ["user-demo-1"],
    commentsCount: 0
  }
];

// Direct Firestore Helpers for client bypass
async function fetchCommunityFeedDirect(): Promise<{ success: boolean; posts?: any[]; error?: string }> {
  try {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    let posts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (posts.length === 0) {
      console.log("[Client Fallback] Direct Firestore feed is empty. Seeding...");
      for (const p of SEED_POSTS) {
        await setDoc(doc(db, "posts", p.id), p);
      }
      try {
        await setDoc(doc(db, "posts", "seed-post-porsche", "comments", "seed-comment-1"), {
          id: "seed-comment-1",
          userId: "buyer-khan",
          userName: "Khan Khattak",
          userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300",
          userRole: "Individual User",
          text: "MashaAllah what a beauty! Peshawar has some serious garage goals.",
          createdAt: new Date(Date.now() - 3600000).toISOString()
        });
      } catch (err) {
        console.warn("Could not write seed comment:", err);
      }
      posts = [...SEED_POSTS];
    }

    // Filter out unapproved posts except for the author and admins
    const currentUser = auth.currentUser;
    const authorizedAdmins = ['amjid.bisconni@gmail.com', 'amjid.psh@gmail.com', 'khattakghani94@gmail.com', 'mazharsouls@gmail.com'];
    const isAdmin = currentUser?.email && authorizedAdmins.includes(currentUser.email.toLowerCase());

    posts = posts.filter((p: any) => {
      if (p.approved !== false) return true;
      if (isAdmin) return true;
      if (currentUser && p.userId === currentUser.uid) return true;
      return false;
    });

    return { success: true, posts };
  } catch (err: any) {
    console.error("[Client Fallback] Direct Firestore fetch failed:", err);
    return { success: false, error: err.message };
  }
}

async function createSocialPostDirect(payload: {
  content: string;
  type?: 'TEXT' | 'IMAGE' | 'VIDEO';
  mediaUrl?: string;
  mediaUrls?: string[];
  showroomId?: string;
}): Promise<{ success: boolean; post?: any; error?: string }> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("You must be logged in to post.");
    }
    let displayName = currentUser.displayName || "Anonymous User";
    let userRole = "Individual User";
    let photoURL = currentUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";

    try {
      const profileSnap = await getDoc(doc(db, "users", currentUser.uid));
      if (profileSnap.exists()) {
        const data = profileSnap.data();
        if (data.displayName) displayName = data.displayName;
        if (data.role) userRole = data.role;
        if (data.profilePhoto || data.photoURL) {
          photoURL = data.profilePhoto || data.photoURL;
        }
      }
    } catch (e) {
      console.warn("Could not fetch extra profile details for post author:", e);
    }

    const authorizedAdmins = ['amjid.bisconni@gmail.com', 'amjid.psh@gmail.com', 'khattakghani94@gmail.com', 'mazharsouls@gmail.com'];
    const isAdmin = (currentUser.email && authorizedAdmins.includes(currentUser.email.toLowerCase())) || userRole === 'Admin';

    const postId = "post-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9);
    const newPost = {
      id: postId,
      userId: currentUser.uid,
      userName: displayName,
      userAvatar: photoURL,
      userRole: userRole,
      showroomId: payload.showroomId || null,
      type: payload.type || 'TEXT',
      content: payload.content,
      mediaUrl: payload.mediaUrl || null,
      mediaUrls: payload.mediaUrls || null,
      createdAt: new Date().toISOString(),
      likes: [],
      commentsCount: 0,
      approved: isAdmin // auto-approved if admin, otherwise false/pending
    };

    await setDoc(doc(db, "posts", postId), newPost);
    return { success: true, post: newPost };
  } catch (err: any) {
    console.error("[Client Fallback] Direct Firestore create post failed:", err);
    return { success: false, error: err.message };
  }
}

async function toggleLikeSocialPostDirect(postId: string): Promise<{ success: boolean; liked?: boolean; likesCount?: number; error?: string }> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("You must be logged in to like posts.");
    }
    const postRef = doc(db, "posts", postId);
    let liked = false;
    let likesCount = 0;

    await runTransaction(db, async (transaction) => {
      const postSnap = await transaction.get(postRef);
      if (!postSnap.exists()) {
        throw new Error("Post does not exist.");
      }
      const data = postSnap.data();
      const likes: string[] = data.likes || [];
      const userIndex = likes.indexOf(currentUser.uid);
      if (userIndex === -1) {
        likes.push(currentUser.uid);
        liked = true;
      } else {
        likes.splice(userIndex, 1);
        liked = false;
      }
      likesCount = likes.length;
      transaction.update(postRef, { likes });
    });

    return { success: true, liked, likesCount };
  } catch (err: any) {
    console.error("[Client Fallback] Direct Firestore like toggle failed:", err);
    return { success: false, error: err.message };
  }
}

async function createSocialCommentDirect(postId: string, text: string): Promise<{ success: boolean; comment?: any; error?: string }> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("You must be logged in to comment.");
    }
    let displayName = currentUser.displayName || "Anonymous User";
    let userRole = "Individual User";
    let photoURL = currentUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";

    try {
      const profileSnap = await getDoc(doc(db, "users", currentUser.uid));
      if (profileSnap.exists()) {
        const data = profileSnap.data();
        if (data.displayName) displayName = data.displayName;
        if (data.role) userRole = data.role;
        if (data.profilePhoto || data.photoURL) {
          photoURL = data.profilePhoto || data.photoURL;
        }
      }
    } catch (e) {
      console.warn("Could not fetch extra profile details for comment author:", e);
    }

    const commentId = "comment-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9);
    const newComment = {
      id: commentId,
      postId: postId,
      userId: currentUser.uid,
      userName: displayName,
      userAvatar: photoURL,
      userRole: userRole,
      text: text,
      createdAt: new Date().toISOString()
    };

    const postRef = doc(db, "posts", postId);
    const commentRef = doc(db, "posts", postId, "comments", commentId);

    await runTransaction(db, async (transaction) => {
      const postSnap = await transaction.get(postRef);
      if (!postSnap.exists()) {
        throw new Error("Post does not exist.");
      }
      const data = postSnap.data();
      const currentCommentsCount = data.commentsCount || 0;
      transaction.set(commentRef, newComment);
      transaction.update(postRef, { commentsCount: currentCommentsCount + 1 });
    });

    return { success: true, comment: newComment };
  } catch (err: any) {
    console.error("[Client Fallback] Direct Firestore comment failed:", err);
    return { success: false, error: err.message };
  }
}

async function fetchSocialCommentsDirect(postId: string): Promise<{ success: boolean; comments?: any[]; error?: string }> {
  try {
    const q = query(collection(db, "posts", postId, "comments"), orderBy("createdAt", "asc"));
    const snap = await getDocs(q);
    const comments = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, comments };
  } catch (err: any) {
    console.error("[Client Fallback] Direct Firestore comments fetch failed:", err);
    return { success: false, error: err.message };
  }
}

async function deleteSocialPostDirect(postId: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("You must be logged in to delete.");
    }
    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) {
      throw new Error("Post not found.");
    }
    const data = postSnap.data();
    
    let isAdminUser = false;
    try {
      const profileSnap = await getDoc(doc(db, "users", currentUser.uid));
      if (profileSnap.exists() && profileSnap.data()?.role === 'Admin') {
        isAdminUser = true;
      }
    } catch (e) {}

    if (data.userId !== currentUser.uid && !isAdminUser) {
      throw new Error("Permission denied.");
    }

    await deleteDoc(postRef);
    return { success: true, message: "Post deleted successfully." };
  } catch (err: any) {
    console.error("[Client Fallback] Direct Firestore post deletion failed:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch all community posts
 */
export async function fetchCommunityFeed(): Promise<{ success: boolean; posts?: any[]; error?: string }> {
  try {
    const appCheckHeader = await getAppCheckHeader();
    const response = await fetch('/api/feed', {
      headers: {
        ...appCheckHeader
      }
    });
    if (!response.ok) {
      throw new Error('Social feed API response not OK.');
    }
    const data = await response.json();
    if (data && data.fallback) {
      console.log('[API] Server requested client-side fallback for community feed.');
      return await fetchCommunityFeedDirect();
    }
    return data;
  } catch (error: any) {
    console.warn('[API] fetchCommunityFeed REST failed, falling back to direct Firestore:', error);
    return await fetchCommunityFeedDirect();
  }
}

/**
 * Create a new social post (Requires user auth ID token)
 */
export async function createSocialPost(
  payload: { content: string; type?: 'TEXT' | 'IMAGE' | 'VIDEO'; mediaUrl?: string; mediaUrls?: string[]; showroomId?: string },
  idToken: string
): Promise<{ success: boolean; post?: any; error?: string }> {
  try {
    const appCheckHeader = await getAppCheckHeader();
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
        ...appCheckHeader
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error('REST createSocialPost failed.');
    }
    return await response.json();
  } catch (error: any) {
    console.warn('[API] createSocialPost REST failed, falling back to direct Firestore:', error);
    return await createSocialPostDirect(payload);
  }
}

/**
 * Toggle like/love on a social post
 */
export async function toggleLikeSocialPost(
  postId: string,
  idToken: string
): Promise<{ success: boolean; liked?: boolean; likesCount?: number; error?: string }> {
  try {
    const appCheckHeader = await getAppCheckHeader();
    const response = await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        ...appCheckHeader
      }
    });
    if (!response.ok) {
      throw new Error('REST toggleLikeSocialPost failed.');
    }
    return await response.json();
  } catch (error: any) {
    console.warn('[API] toggleLikeSocialPost REST failed, falling back to direct Firestore:', error);
    return await toggleLikeSocialPostDirect(postId);
  }
}

/**
 * Add a comment to a social post
 */
export async function createSocialComment(
  postId: string,
  text: string,
  idToken: string
): Promise<{ success: boolean; comment?: any; error?: string }> {
  try {
    const appCheckHeader = await getAppCheckHeader();
    const response = await fetch(`/api/posts/${postId}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
        ...appCheckHeader
      },
      body: JSON.stringify({ text })
    });
    if (!response.ok) {
      throw new Error('REST createSocialComment failed.');
    }
    return await response.json();
  } catch (error: any) {
    console.warn('[API] createSocialComment REST failed, falling back to direct Firestore:', error);
    return await createSocialCommentDirect(postId, text);
  }
}

/**
 * Fetch comments for a social post
 */
export async function fetchSocialComments(
  postId: string
): Promise<{ success: boolean; comments?: any[]; error?: string }> {
  try {
    const appCheckHeader = await getAppCheckHeader();
    const response = await fetch(`/api/posts/${postId}/comments`, {
      headers: {
        ...appCheckHeader
      }
    });
    if (!response.ok) {
      throw new Error('REST fetchSocialComments failed.');
    }
    return await response.json();
  } catch (error: any) {
    console.warn('[API] fetchSocialComments REST failed, falling back to direct Firestore:', error);
    return await fetchSocialCommentsDirect(postId);
  }
}

/**
 * Delete a social post
 */
export async function deleteSocialPost(
  postId: string,
  idToken: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const appCheckHeader = await getAppCheckHeader();
    const response = await fetch(`/api/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        ...appCheckHeader
      }
    });
    if (!response.ok) {
      throw new Error('REST deleteSocialPost failed.');
    }
    return await response.json();
  } catch (error: any) {
    console.warn('[API] deleteSocialPost REST failed, falling back to direct Firestore:', error);
    return await deleteSocialPostDirect(postId);
  }
}

