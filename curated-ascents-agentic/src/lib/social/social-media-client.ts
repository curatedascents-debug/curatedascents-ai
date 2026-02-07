/**
 * Social Media API Client
 * Posts content to Facebook, Instagram, LinkedIn, and Twitter/X
 */

import crypto from "crypto";

interface PostResult {
  success: boolean;
  error?: string;
  postId?: string;
}

// ─── Facebook ──────────────────────────────────────────────────────────────────

async function postToFacebook(
  text: string,
  imageUrl?: string | null
): Promise<PostResult> {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;

  if (!token || !pageId) {
    return { success: false, error: "Facebook credentials not configured (FACEBOOK_PAGE_ACCESS_TOKEN, FACEBOOK_PAGE_ID)" };
  }

  try {
    const baseUrl = `https://graph.facebook.com/v19.0/${pageId}`;

    let url: string;
    let body: Record<string, string>;

    if (imageUrl) {
      url = `${baseUrl}/photos`;
      body = { url: imageUrl, caption: text, access_token: token };
    } else {
      url = `${baseUrl}/feed`;
      body = { message: text, access_token: token };
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `Facebook API error: ${err}` };
    }

    const data = await res.json();
    return { success: true, postId: data.id || data.post_id };
  } catch (err) {
    return { success: false, error: `Facebook error: ${err instanceof Error ? err.message : "Unknown"}` };
  }
}

// ─── Instagram ─────────────────────────────────────────────────────────────────

async function postToInstagram(
  text: string,
  imageUrl?: string | null
): Promise<PostResult> {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID;

  if (!token || !accountId) {
    return { success: false, error: "Instagram credentials not configured (FACEBOOK_PAGE_ACCESS_TOKEN, INSTAGRAM_ACCOUNT_ID)" };
  }

  if (!imageUrl) {
    return { success: false, error: "Instagram requires an image URL" };
  }

  try {
    // Step 1: Create media container
    const containerRes = await fetch(
      `https://graph.facebook.com/v19.0/${accountId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: text,
          access_token: token,
        }),
      }
    );

    if (!containerRes.ok) {
      const err = await containerRes.text();
      return { success: false, error: `Instagram container error: ${err}` };
    }

    const containerData = await containerRes.json();
    const containerId = containerData.id;

    // Step 2: Publish the container
    const publishRes = await fetch(
      `https://graph.facebook.com/v19.0/${accountId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: token,
        }),
      }
    );

    if (!publishRes.ok) {
      const err = await publishRes.text();
      return { success: false, error: `Instagram publish error: ${err}` };
    }

    const publishData = await publishRes.json();
    return { success: true, postId: publishData.id };
  } catch (err) {
    return { success: false, error: `Instagram error: ${err instanceof Error ? err.message : "Unknown"}` };
  }
}

// ─── LinkedIn ──────────────────────────────────────────────────────────────────

async function postToLinkedIn(
  text: string
): Promise<PostResult> {
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  const orgId = process.env.LINKEDIN_ORG_ID;

  if (!token || !orgId) {
    return { success: false, error: "LinkedIn credentials not configured (LINKEDIN_ACCESS_TOKEN, LINKEDIN_ORG_ID)" };
  }

  try {
    const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: `urn:li:organization:${orgId}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text },
            shareMediaCategory: "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `LinkedIn API error: ${err}` };
    }

    const data = await res.json();
    return { success: true, postId: data.id };
  } catch (err) {
    return { success: false, error: `LinkedIn error: ${err instanceof Error ? err.message : "Unknown"}` };
  }
}

// ─── Twitter/X (OAuth 1.0a HMAC-SHA1) ─────────────────────────────────────────

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join("&");

  const baseString = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(sortedParams),
  ].join("&");

  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  return crypto.createHmac("sha1", signingKey).update(baseString).digest("base64");
}

async function postToTwitter(
  text: string
): Promise<PostResult> {
  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
    return { success: false, error: "Twitter credentials not configured (TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET)" };
  }

  try {
    const url = "https://api.twitter.com/2/tweets";
    const nonce = crypto.randomBytes(16).toString("hex");
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const oauthParams: Record<string, string> = {
      oauth_consumer_key: apiKey,
      oauth_nonce: nonce,
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: timestamp,
      oauth_token: accessToken,
      oauth_version: "1.0",
    };

    const signature = generateOAuthSignature(
      "POST",
      url,
      oauthParams,
      apiSecret,
      accessTokenSecret
    );

    const authHeader =
      "OAuth " +
      Object.entries({ ...oauthParams, oauth_signature: signature })
        .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
        .join(", ");

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `Twitter API error: ${err}` };
    }

    const data = await res.json();
    return { success: true, postId: data.data?.id };
  } catch (err) {
    return { success: false, error: `Twitter error: ${err instanceof Error ? err.message : "Unknown"}` };
  }
}

// ─── Main Dispatcher ───────────────────────────────────────────────────────────

export async function postToSocialMedia(
  platform: string,
  text: string,
  imageUrl?: string | null,
  hashtags?: string[] | null
): Promise<PostResult> {
  // Append hashtags to text if provided
  const fullText = hashtags && hashtags.length > 0
    ? `${text}\n\n${hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ")}`
    : text;

  switch (platform.toLowerCase()) {
    case "facebook":
      return postToFacebook(fullText, imageUrl);
    case "instagram":
      return postToInstagram(fullText, imageUrl);
    case "linkedin":
      return postToLinkedIn(fullText);
    case "twitter":
    case "x":
      // Twitter has 280 char limit — truncate if needed
      const tweetText = fullText.length > 280 ? fullText.substring(0, 277) + "..." : fullText;
      return postToTwitter(tweetText);
    default:
      return { success: false, error: `Unsupported platform: ${platform}` };
  }
}
