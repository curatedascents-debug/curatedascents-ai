/**
 * Testimonials API
 * GET /api/admin/testimonials - List testimonials
 * PUT /api/admin/testimonials - Approve/reject testimonial
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getPendingTestimonials,
  getApprovedTestimonials,
  approveTestimonial,
} from "@/lib/customer-success/feedback-engine";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "pending"; // pending, approved, all
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 20;
    const destination = searchParams.get("destination") || undefined;

    let testimonials;

    if (status === "pending") {
      testimonials = await getPendingTestimonials();
    } else if (status === "approved") {
      testimonials = await getApprovedTestimonials({ limit, destination });
    } else {
      // Get both
      const pending = await getPendingTestimonials();
      const approved = await getApprovedTestimonials({ limit, destination });
      testimonials = {
        pending,
        approved,
      };
    }

    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { surveyId, approved } = body;

    if (surveyId === undefined || approved === undefined) {
      return NextResponse.json(
        { error: "surveyId and approved (boolean) are required" },
        { status: 400 }
      );
    }

    await approveTestimonial(surveyId, approved);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating testimonial:", error);
    return NextResponse.json(
      { error: "Failed to update testimonial" },
      { status: 500 }
    );
  }
}
