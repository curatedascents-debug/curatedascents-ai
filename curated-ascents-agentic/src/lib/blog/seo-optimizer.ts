/**
 * SEO Optimizer for blog posts
 * Analyzes content for SEO best practices and generates optimized metadata
 */

export interface SEOAnalysis {
  score: number; // 0-100
  issues: SEOIssue[];
  suggestions: string[];
}

export interface SEOIssue {
  type: "error" | "warning" | "info";
  message: string;
  field?: string;
}

export interface SEOMetadata {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  slug: string;
  readTimeMinutes: number;
}

/**
 * Analyze blog post content for SEO best practices
 */
export function analyzeSEO(
  title: string,
  content: string,
  keywords: string[] = []
): SEOAnalysis {
  const issues: SEOIssue[] = [];
  const suggestions: string[] = [];
  let score = 100;

  // Title analysis
  if (!title || title.length === 0) {
    issues.push({ type: "error", message: "Title is missing", field: "title" });
    score -= 20;
  } else {
    if (title.length < 30) {
      issues.push({ type: "warning", message: "Title is too short (< 30 chars)", field: "title" });
      score -= 5;
    }
    if (title.length > 60) {
      issues.push({ type: "warning", message: "Title is too long for SEO (> 60 chars)", field: "title" });
      score -= 5;
    }
  }

  // Content analysis
  if (!content || content.length === 0) {
    issues.push({ type: "error", message: "Content is empty", field: "content" });
    score -= 30;
  } else {
    const wordCount = content.split(/\s+/).length;

    if (wordCount < 300) {
      issues.push({ type: "warning", message: "Content is too short (< 300 words)", field: "content" });
      score -= 10;
      suggestions.push("Consider expanding the content to at least 1000 words for better SEO");
    }

    // Check for headings
    const hasH2 = /##\s+/.test(content);
    const hasH3 = /###\s+/.test(content);

    if (!hasH2) {
      issues.push({ type: "warning", message: "No H2 headings found", field: "content" });
      score -= 5;
      suggestions.push("Add H2 headings to structure your content");
    }

    // Check for links
    const hasLinks = /\[([^\]]+)\]\([^)]+\)/.test(content);
    if (!hasLinks) {
      issues.push({ type: "info", message: "No links found in content" });
      suggestions.push("Consider adding internal or external links");
    }

    // Check for images
    const hasImages = /!\[([^\]]*)\]\([^)]+\)/.test(content);
    if (!hasImages) {
      issues.push({ type: "info", message: "No images found in content" });
      suggestions.push("Add images with alt text to improve engagement and SEO");
    }
  }

  // Keyword analysis
  if (keywords.length === 0) {
    issues.push({ type: "warning", message: "No keywords defined" });
    score -= 10;
    suggestions.push("Add target keywords for better SEO");
  } else {
    const contentLower = content.toLowerCase();
    const titleLower = title.toLowerCase();

    // Check if primary keyword is in title
    if (!titleLower.includes(keywords[0].toLowerCase())) {
      issues.push({ type: "warning", message: "Primary keyword not in title" });
      score -= 5;
      suggestions.push("Include your primary keyword in the title");
    }

    // Check keyword density
    keywords.forEach((keyword) => {
      const keywordLower = keyword.toLowerCase();
      const regex = new RegExp(keywordLower, "gi");
      const matches = contentLower.match(regex);
      const count = matches ? matches.length : 0;
      const wordCount = content.split(/\s+/).length;
      const density = (count / wordCount) * 100;

      if (density < 0.5) {
        issues.push({ type: "info", message: `Keyword "${keyword}" has low density (${density.toFixed(2)}%)` });
      } else if (density > 3) {
        issues.push({ type: "warning", message: `Keyword "${keyword}" may be over-used (${density.toFixed(2)}%)` });
        score -= 3;
      }
    });
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  return { score, issues, suggestions };
}

/**
 * Generate suggested keywords based on topic and destination
 */
export function suggestKeywords(
  topic: string,
  destination?: string,
  contentType?: string
): string[] {
  const keywords: string[] = [];

  // Base keywords from topic
  const topicWords = topic.toLowerCase().split(/\s+/);
  keywords.push(topic.toLowerCase());

  // Add destination-specific keywords
  if (destination) {
    const destLower = destination.toLowerCase();
    keywords.push(destLower);
    keywords.push(`${destLower} travel`);
    keywords.push(`${destLower} trip`);
    keywords.push(`visit ${destLower}`);

    // Destination-specific variations
    if (destLower.includes("nepal") || destLower.includes("kathmandu")) {
      keywords.push("nepal travel guide", "himalayan adventure", "trekking nepal");
    }
    if (destLower.includes("bhutan")) {
      keywords.push("bhutan travel guide", "kingdom of bhutan", "bhutan tourism");
    }
    if (destLower.includes("tibet") || destLower.includes("lhasa")) {
      keywords.push("tibet travel", "tibetan plateau", "lhasa tour");
    }
    if (destLower.includes("india") || destLower.includes("ladakh") || destLower.includes("sikkim")) {
      keywords.push("india travel guide", "himalayan india");
    }
  }

  // Add content type specific keywords
  if (contentType) {
    switch (contentType) {
      case "destination_guide":
        keywords.push("travel guide", "complete guide", "ultimate guide");
        break;
      case "travel_tips":
        keywords.push("travel tips", "travel advice", "travel planning");
        break;
      case "packing_list":
        keywords.push("packing list", "what to pack", "packing guide");
        break;
      case "cultural_insights":
        keywords.push("culture", "customs", "traditions", "local culture");
        break;
      case "seasonal_content":
        keywords.push("best time to visit", "weather", "seasons");
        break;
      case "trip_report":
        keywords.push("travel experience", "travel story", "adventure");
        break;
    }
  }

  // Add general luxury travel keywords
  keywords.push("luxury travel", "adventure travel", "curated experiences");

  // Remove duplicates and return
  return [...new Set(keywords)].slice(0, 15);
}

/**
 * Generate an optimized meta description (max 155 characters)
 */
export function generateMetaDescription(
  content: string,
  maxLength: number = 155
): string {
  // Strip markdown formatting
  let stripped = content
    .replace(/#+\s/g, "")          // Headers
    .replace(/\*\*([^*]+)\*\*/g, "$1")  // Bold
    .replace(/\*([^*]+)\*/g, "$1")      // Italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")  // Links
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")    // Images
    .replace(/`[^`]+`/g, "")       // Code
    .replace(/\n+/g, " ")          // Newlines
    .replace(/\s+/g, " ")          // Multiple spaces
    .trim();

  // Get first paragraph or meaningful chunk
  const sentences = stripped.split(/[.!?]+/);
  let description = "";

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if ((description + " " + trimmed + ".").length <= maxLength) {
      description = description ? `${description} ${trimmed}.` : `${trimmed}.`;
    } else {
      break;
    }
  }

  // If still empty, take first maxLength chars
  if (!description && stripped) {
    description = stripped.substring(0, maxLength - 3).trim() + "...";
  }

  return description;
}

/**
 * Generate a URL-safe slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 100); // Limit slug length
}

/**
 * Calculate estimated read time in minutes
 */
export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/**
 * Generate excerpt from content
 */
export function generateExcerpt(content: string, maxLength: number = 200): string {
  // Strip markdown formatting
  const stripped = content
    .replace(/#+\s/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
    .replace(/`[^`]+`/g, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (stripped.length <= maxLength) return stripped;

  // Cut at word boundary
  const truncated = stripped.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + "...";
  }

  return truncated + "...";
}

/**
 * Generate all SEO metadata for a blog post
 */
export function generateSEOMetadata(
  title: string,
  content: string,
  destination?: string,
  contentType?: string
): SEOMetadata {
  return {
    metaTitle: title.length > 60 ? title.substring(0, 57) + "..." : title,
    metaDescription: generateMetaDescription(content),
    keywords: suggestKeywords(title, destination, contentType),
    slug: generateSlug(title),
    readTimeMinutes: calculateReadTime(content),
  };
}
