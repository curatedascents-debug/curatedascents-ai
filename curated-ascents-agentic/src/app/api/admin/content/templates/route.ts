/**
 * Content Templates API
 * GET /api/admin/content/templates - List templates
 * POST /api/admin/content/templates - Create template
 */

import { NextRequest, NextResponse } from "next/server";
import {
  listTemplates,
  createContentTemplate,
  getTemplateBySlug,
  getRenderedTemplate,
} from "@/lib/content/content-engine";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const slug = searchParams.get("slug");
    const render = searchParams.get("render") === "true";

    // If requesting a specific template
    if (slug) {
      const language = searchParams.get("language") || "en";
      const template = await getTemplateBySlug(slug, language);

      if (!template) {
        return NextResponse.json(
          { error: "Template not found" },
          { status: 404 }
        );
      }

      // If render requested with data
      if (render) {
        const dataParam = searchParams.get("data");
        if (dataParam) {
          try {
            const data = JSON.parse(dataParam);
            const rendered = await getRenderedTemplate(slug, data, language);
            return NextResponse.json({ template, rendered });
          } catch {
            return NextResponse.json(
              { error: "Invalid data parameter" },
              { status: 400 }
            );
          }
        }
      }

      return NextResponse.json({ template });
    }

    // List templates
    const templates = await listTemplates(
      category || undefined,
      subcategory || undefined
    );

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      category,
      subcategory,
      subject,
      content,
      htmlContent,
      plainTextContent,
      availableTokens,
      requiredTokens,
      language,
      variants,
    } = body;

    // Validate required fields
    if (!name || !slug || !category || !content) {
      return NextResponse.json(
        { error: "name, slug, category, and content are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await getTemplateBySlug(slug, language || "en");
    if (existing) {
      return NextResponse.json(
        { error: "Template with this slug already exists" },
        { status: 409 }
      );
    }

    const template = await createContentTemplate({
      name,
      slug,
      category,
      subcategory,
      subject,
      content,
      htmlContent,
      plainTextContent,
      availableTokens,
      requiredTokens,
      language,
      variants,
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}
