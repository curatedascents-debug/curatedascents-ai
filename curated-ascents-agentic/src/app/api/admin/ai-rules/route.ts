import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aiBusinessRules } from "@/db/schema";
import { eq, and, desc, sql, count } from "drizzle-orm";
import { verifyAdminSession, adminUnauthorizedResponse } from "@/lib/auth/admin-api-auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/ai-rules
 * List all rules with optional filters + stats
 */
export async function GET(req: NextRequest) {
  const session = await verifyAdminSession(req);
  if (!session) return adminUnauthorizedResponse();

  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const appliesTo = searchParams.get("appliesTo");
    const isActive = searchParams.get("isActive");

    const conditions = [];
    if (category) conditions.push(eq(aiBusinessRules.category, category as any));
    if (appliesTo) conditions.push(eq(aiBusinessRules.appliesTo, appliesTo as any));
    if (isActive !== null && isActive !== undefined && isActive !== "") {
      conditions.push(eq(aiBusinessRules.isActive, isActive === "true"));
    }

    const rules = await db
      .select()
      .from(aiBusinessRules)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(aiBusinessRules.priority, aiBusinessRules.category);

    // Stats
    const allRules = await db.select().from(aiBusinessRules);
    const total = allRules.length;
    const active = allRules.filter(r => r.isActive).length;
    const byCategory: Record<string, number> = {};
    for (const r of allRules) {
      byCategory[r.category] = (byCategory[r.category] || 0) + 1;
    }

    return NextResponse.json({
      rules,
      stats: { total, active, inactive: total - active, byCategory },
    });
  } catch (error) {
    console.error("Error fetching AI rules:", error);
    return NextResponse.json({ error: "Failed to fetch rules" }, { status: 500 });
  }
}

/**
 * POST /api/admin/ai-rules
 * Create a new rule
 */
export async function POST(req: NextRequest) {
  const session = await verifyAdminSession(req);
  if (!session) return adminUnauthorizedResponse();

  try {
    const body = await req.json();
    const { ruleKey, ruleTitle, ruleText, category, appliesTo, priority, country, serviceType, isActive } = body;

    if (!ruleKey || !ruleTitle || !ruleText || !category) {
      return NextResponse.json({ error: "ruleKey, ruleTitle, ruleText, and category are required" }, { status: 400 });
    }

    // Check uniqueness
    const existing = await db
      .select({ id: aiBusinessRules.id })
      .from(aiBusinessRules)
      .where(eq(aiBusinessRules.ruleKey, ruleKey))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: `Rule key "${ruleKey}" already exists` }, { status: 409 });
    }

    const [rule] = await db
      .insert(aiBusinessRules)
      .values({
        ruleKey,
        ruleTitle,
        ruleText,
        category,
        appliesTo: appliesTo || "all",
        priority: priority ?? 100,
        isActive: isActive ?? true,
        country: country || null,
        serviceType: serviceType || null,
        createdBy: "admin",
      })
      .returning();

    return NextResponse.json({ rule }, { status: 201 });
  } catch (error) {
    console.error("Error creating AI rule:", error);
    return NextResponse.json({ error: "Failed to create rule" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/ai-rules
 * Update a rule by id
 */
export async function PATCH(req: NextRequest) {
  const session = await verifyAdminSession(req);
  if (!session) return adminUnauthorizedResponse();

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Build update set
    const updateSet: Record<string, any> = { updatedAt: new Date() };
    if (updates.ruleTitle !== undefined) updateSet.ruleTitle = updates.ruleTitle;
    if (updates.ruleText !== undefined) updateSet.ruleText = updates.ruleText;
    if (updates.category !== undefined) updateSet.category = updates.category;
    if (updates.appliesTo !== undefined) updateSet.appliesTo = updates.appliesTo;
    if (updates.priority !== undefined) updateSet.priority = updates.priority;
    if (updates.isActive !== undefined) updateSet.isActive = updates.isActive;
    if (updates.country !== undefined) updateSet.country = updates.country || null;
    if (updates.serviceType !== undefined) updateSet.serviceType = updates.serviceType || null;

    const [rule] = await db
      .update(aiBusinessRules)
      .set(updateSet)
      .where(eq(aiBusinessRules.id, id))
      .returning();

    if (!rule) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    return NextResponse.json({ rule });
  } catch (error) {
    console.error("Error updating AI rule:", error);
    return NextResponse.json({ error: "Failed to update rule" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/ai-rules
 * Delete a rule by id
 */
export async function DELETE(req: NextRequest) {
  const session = await verifyAdminSession(req);
  if (!session) return adminUnauthorizedResponse();

  try {
    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get("id") || "0");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const [deleted] = await db
      .delete(aiBusinessRules)
      .where(eq(aiBusinessRules.id, id))
      .returning({ id: aiBusinessRules.id });

    if (!deleted) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedId: deleted.id });
  } catch (error) {
    console.error("Error deleting AI rule:", error);
    return NextResponse.json({ error: "Failed to delete rule" }, { status: 500 });
  }
}
