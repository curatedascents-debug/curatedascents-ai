/**
 * Admin WhatsApp Templates API
 * Manage message templates
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { whatsappTemplates } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

/**
 * GET - List all templates
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status'); // draft, pending, approved, rejected

    const templates = await db
      .select({
        id: whatsappTemplates.id,
        templateName: whatsappTemplates.templateName,
        templateId: whatsappTemplates.templateId,
        category: whatsappTemplates.category,
        language: whatsappTemplates.language,
        headerType: whatsappTemplates.headerType,
        bodyText: whatsappTemplates.bodyText,
        footerText: whatsappTemplates.footerText,
        buttons: whatsappTemplates.buttons,
        variableCount: whatsappTemplates.variableCount,
        status: whatsappTemplates.status,
        usageCount: whatsappTemplates.usageCount,
        lastUsedAt: whatsappTemplates.lastUsedAt,
        description: whatsappTemplates.description,
        createdAt: whatsappTemplates.createdAt,
        updatedAt: whatsappTemplates.updatedAt,
      })
      .from(whatsappTemplates)
      .orderBy(desc(whatsappTemplates.createdAt));

    // Filter by status if provided
    const filteredTemplates = status
      ? templates.filter((t) => t.status === status)
      : templates;

    return NextResponse.json({
      templates: filteredTemplates,
    });
  } catch (error) {
    console.error('[Admin WhatsApp Templates] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new template
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      templateName,
      category,
      language = 'en',
      headerType,
      headerContent,
      bodyText,
      footerText,
      buttons,
      variableDescriptions,
      description,
    } = body;

    // Validate required fields
    if (!templateName || !bodyText) {
      return NextResponse.json(
        { error: 'templateName and bodyText are required' },
        { status: 400 }
      );
    }

    // Count variables in body text ({{1}}, {{2}}, etc.)
    const variableMatches = bodyText.match(/\{\{\d+\}\}/g) || [];
    const variableCount = variableMatches.length;

    // Check for duplicate template name
    const [existing] = await db
      .select({ id: whatsappTemplates.id })
      .from(whatsappTemplates)
      .where(eq(whatsappTemplates.templateName, templateName))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: 'Template with this name already exists' },
        { status: 400 }
      );
    }

    const [template] = await db
      .insert(whatsappTemplates)
      .values({
        templateName,
        category: category || 'utility',
        language,
        headerType,
        headerContent,
        bodyText,
        footerText,
        buttons: buttons || null,
        variableCount,
        variableDescriptions: variableDescriptions || null,
        status: 'draft',
        description,
      })
      .returning();

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error) {
    console.error('[Admin WhatsApp Templates] Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update a template
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Recalculate variable count if body text changed
    if (updateData.bodyText) {
      const variableMatches = updateData.bodyText.match(/\{\{\d+\}\}/g) || [];
      updateData.variableCount = variableMatches.length;
    }

    const [updated] = await db
      .update(whatsappTemplates)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(whatsappTemplates.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      template: updated,
    });
  } catch (error) {
    console.error('[Admin WhatsApp Templates] Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a template
 */
export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = parseInt(searchParams.get('id') || '');

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const [deleted] = await db
      .delete(whatsappTemplates)
      .where(eq(whatsappTemplates.id, id))
      .returning({ id: whatsappTemplates.id });

    if (!deleted) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedId: deleted.id,
    });
  } catch (error) {
    console.error('[Admin WhatsApp Templates] Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
