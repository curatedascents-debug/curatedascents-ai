/**
 * Social Media Formatter
 * Formats blog posts for different social media platforms
 */

export type SocialPlatform = "instagram" | "facebook" | "linkedin" | "twitter_x";

export interface SocialPost {
  text: string;
  hashtags: string[];
  imageUrl?: string;
  platform: SocialPlatform;
}

export interface PlatformLimits {
  maxTextLength: number;
  maxHashtags: number;
  supportsLinks: boolean;
  tone: "casual" | "professional" | "visual";
}

const PLATFORM_LIMITS: Record<SocialPlatform, PlatformLimits> = {
  instagram: {
    maxTextLength: 2200,
    maxHashtags: 30,
    supportsLinks: false, // Links in bio only
    tone: "visual",
  },
  facebook: {
    maxTextLength: 63206,
    maxHashtags: 5,
    supportsLinks: true,
    tone: "casual",
  },
  linkedin: {
    maxTextLength: 3000,
    maxHashtags: 5,
    supportsLinks: true,
    tone: "professional",
  },
  twitter_x: {
    maxTextLength: 280,
    maxHashtags: 4,
    supportsLinks: true,
    tone: "casual",
  },
};

/**
 * Format a blog post for a specific social media platform
 */
export function formatForPlatform(
  post: {
    title: string;
    excerpt: string;
    slug: string;
    destination?: string;
    contentType?: string;
    featuredImage?: string;
  },
  platform: SocialPlatform,
  baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || "https://curatedascents.com"
): SocialPost {
  const limits = PLATFORM_LIMITS[platform];
  const postUrl = `${baseUrl}/blog/${post.slug}`;
  const hashtags = suggestHashtags(post, platform);

  let text = "";

  switch (platform) {
    case "instagram":
      text = formatForInstagram(post, postUrl, hashtags);
      break;
    case "facebook":
      text = formatForFacebook(post, postUrl);
      break;
    case "linkedin":
      text = formatForLinkedIn(post, postUrl);
      break;
    case "twitter_x":
      text = formatForTwitter(post, postUrl, hashtags);
      break;
  }

  // Ensure text doesn't exceed platform limit
  if (text.length > limits.maxTextLength) {
    text = text.substring(0, limits.maxTextLength - 3) + "...";
  }

  return {
    text,
    hashtags: hashtags.slice(0, limits.maxHashtags),
    imageUrl: post.featuredImage,
    platform,
  };
}

function formatForInstagram(
  post: { title: string; excerpt: string; destination?: string },
  postUrl: string,
  hashtags: string[]
): string {
  const emoji = getDestinationEmoji(post.destination);

  const lines = [
    `${emoji} ${post.title}`,
    "",
    post.excerpt,
    "",
    "Ready to explore? Link in bio!",
    "",
    "---",
    "",
    hashtags.map(h => `#${h}`).join(" "),
  ];

  return lines.join("\n");
}

function formatForFacebook(
  post: { title: string; excerpt: string; destination?: string },
  postUrl: string
): string {
  const emoji = getDestinationEmoji(post.destination);

  const lines = [
    `${emoji} ${post.title}`,
    "",
    post.excerpt,
    "",
    `Read more: ${postUrl}`,
    "",
    "#CuratedAscents #LuxuryTravel #HimalayanAdventures",
  ];

  return lines.join("\n");
}

function formatForLinkedIn(
  post: { title: string; excerpt: string; destination?: string; contentType?: string },
  postUrl: string
): string {
  const intro = getLinkedInIntro(post.contentType);

  const lines = [
    intro,
    "",
    `**${post.title}**`,
    "",
    post.excerpt,
    "",
    `Read the full article: ${postUrl}`,
    "",
    "#LuxuryTravel #AdventureTravel #TravelIndustry #Himalaya",
  ];

  return lines.join("\n");
}

function formatForTwitter(
  post: { title: string; excerpt: string },
  postUrl: string,
  hashtags: string[]
): string {
  // Twitter has strict 280 char limit
  const hashtagStr = hashtags.slice(0, 2).map(h => `#${h}`).join(" ");
  const urlLength = 23; // t.co shortens all URLs to 23 chars
  const maxTextLength = 280 - urlLength - hashtagStr.length - 4; // 4 for spaces and newlines

  let text = post.title;

  if (text.length > maxTextLength) {
    text = text.substring(0, maxTextLength - 3) + "...";
  }

  return `${text}\n\n${postUrl}\n\n${hashtagStr}`;
}

/**
 * Generate suggested hashtags for a platform
 */
export function suggestHashtags(
  post: {
    title?: string;
    destination?: string;
    contentType?: string;
  },
  platform: SocialPlatform
): string[] {
  const hashtags: string[] = [];
  const limits = PLATFORM_LIMITS[platform];

  // Brand hashtags
  hashtags.push("CuratedAscents");

  // Destination hashtags
  if (post.destination) {
    const dest = post.destination.toLowerCase();

    if (dest.includes("nepal") || dest.includes("kathmandu") || dest.includes("everest")) {
      hashtags.push("Nepal", "VisitNepal", "Himalaya");
      if (dest.includes("everest")) hashtags.push("Everest", "EverestBaseCamp");
      if (dest.includes("annapurna")) hashtags.push("Annapurna", "AnnapurnaCircuit");
    }
    if (dest.includes("bhutan")) {
      hashtags.push("Bhutan", "VisitBhutan", "KingdomOfBhutan");
    }
    if (dest.includes("tibet") || dest.includes("lhasa")) {
      hashtags.push("Tibet", "Lhasa", "TibetanPlateau");
    }
    if (dest.includes("india") || dest.includes("ladakh") || dest.includes("sikkim")) {
      hashtags.push("India", "IncredibleIndia");
      if (dest.includes("ladakh")) hashtags.push("Ladakh");
      if (dest.includes("sikkim")) hashtags.push("Sikkim");
    }
  }

  // Content type hashtags
  switch (post.contentType) {
    case "destination_guide":
      hashtags.push("TravelGuide", "TravelTips");
      break;
    case "travel_tips":
      hashtags.push("TravelTips", "TravelAdvice");
      break;
    case "packing_list":
      hashtags.push("PackingTips", "TravelPacking");
      break;
    case "cultural_insights":
      hashtags.push("Culture", "Traditions");
      break;
    case "seasonal_content":
      hashtags.push("BestTimeToTravel", "TravelSeason");
      break;
    case "trip_report":
      hashtags.push("TravelStory", "TravelExperience");
      break;
  }

  // General travel hashtags
  hashtags.push("LuxuryTravel", "AdventureTravel", "TravelPhotography");

  // Platform-specific hashtags
  if (platform === "instagram") {
    hashtags.push("InstaTravel", "TravelGram", "Wanderlust");
  }
  if (platform === "linkedin") {
    hashtags.push("TravelIndustry", "TourismIndustry");
  }

  // Remove duplicates and limit
  return [...new Set(hashtags)].slice(0, limits.maxHashtags);
}

function getDestinationEmoji(destination?: string): string {
  if (!destination) return "🏔️";

  const dest = destination.toLowerCase();
  if (dest.includes("nepal")) return "🇳🇵";
  if (dest.includes("bhutan")) return "🇧🇹";
  if (dest.includes("tibet")) return "🏔️";
  if (dest.includes("india")) return "🇮🇳";
  if (dest.includes("everest")) return "⛰️";

  return "🏔️";
}

function getLinkedInIntro(contentType?: string): string {
  switch (contentType) {
    case "destination_guide":
      return "New on the blog: Your comprehensive guide is here.";
    case "travel_tips":
      return "Planning your next adventure? Here are essential tips from our experts.";
    case "packing_list":
      return "What to pack for your Himalayan adventure? We've got you covered.";
    case "cultural_insights":
      return "Understanding local culture is key to meaningful travel experiences.";
    case "seasonal_content":
      return "Timing is everything when planning your trip.";
    case "trip_report":
      return "Real stories from real travelers. Here's what one of our clients experienced.";
    default:
      return "New on the CuratedAscents blog:";
  }
}

/**
 * Generate social posts for all platforms
 */
export function generateAllSocialPosts(
  post: {
    title: string;
    excerpt: string;
    slug: string;
    destination?: string;
    contentType?: string;
    featuredImage?: string;
  },
  platforms: SocialPlatform[] = ["instagram", "facebook", "linkedin", "twitter_x"]
): SocialPost[] {
  return platforms.map((platform) => formatForPlatform(post, platform));
}
