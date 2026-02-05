/**
 * Content Generation API
 * POST /api/admin/content/generate - Generate various types of content
 */

import { NextRequest, NextResponse } from "next/server";
import { generateQuoteNarrative, generatePersonalizedEmail } from "@/lib/content/narrative-generator";
import {
  getPersonalizedContent,
  buildClientProfile,
  personalizeEmailContent,
} from "@/lib/content/personalization-engine";
import { getContentStats } from "@/lib/content/content-engine";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Return content stats
    const stats = await getContentStats();
    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching content stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch content stats" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    switch (type) {
      case "quote_narrative": {
        const { quoteId, options } = body;

        if (!quoteId) {
          return NextResponse.json(
            { error: "quoteId is required" },
            { status: 400 }
          );
        }

        const narrative = await generateQuoteNarrative(quoteId, options || {});
        return NextResponse.json({ narrative });
      }

      case "personalized_email": {
        const { clientId, templateType, context } = body;

        if (!clientId || !templateType) {
          return NextResponse.json(
            { error: "clientId and templateType are required" },
            { status: 400 }
          );
        }

        const email = await generatePersonalizedEmail(
          clientId,
          templateType,
          context || {}
        );
        return NextResponse.json({ email });
      }

      case "personalized_content": {
        const { clientId, context } = body;

        if (!clientId) {
          return NextResponse.json(
            { error: "clientId is required" },
            { status: 400 }
          );
        }

        const content = await getPersonalizedContent({
          clientId,
          context: context || "website",
        });
        return NextResponse.json({ content });
      }

      case "client_profile": {
        const { clientId } = body;

        if (!clientId) {
          return NextResponse.json(
            { error: "clientId is required" },
            { status: 400 }
          );
        }

        const profile = await buildClientProfile(clientId);

        if (!profile) {
          return NextResponse.json(
            { error: "Client not found" },
            { status: 404 }
          );
        }

        return NextResponse.json({ profile });
      }

      case "email_personalization": {
        const { clientId, emailType, subject, body: emailBody } = body;

        if (!clientId || !subject || !emailBody) {
          return NextResponse.json(
            { error: "clientId, subject, and body are required" },
            { status: 400 }
          );
        }

        const personalized = await personalizeEmailContent(
          clientId,
          emailType || "general",
          { subject, body: emailBody }
        );
        return NextResponse.json({ email: personalized });
      }

      default:
        return NextResponse.json(
          { error: "Invalid type. Supported types: quote_narrative, personalized_email, personalized_content, client_profile, email_personalization" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate content" },
      { status: 500 }
    );
  }
}
