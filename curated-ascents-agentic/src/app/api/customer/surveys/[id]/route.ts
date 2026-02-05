/**
 * Customer Survey API
 * GET /api/customer/surveys/[id] - Get survey for completion
 * POST /api/customer/surveys/[id] - Submit survey response
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getSurveyForCompletion,
  submitSurveyResponse,
} from "@/lib/customer-success/feedback-engine";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const surveyId = parseInt(id);

    const survey = await getSurveyForCompletion(surveyId);

    if (!survey) {
      return NextResponse.json(
        { error: "Survey not found" },
        { status: 404 }
      );
    }

    if (survey.isCompleted) {
      return NextResponse.json({
        survey,
        message: "Thank you! This survey has already been completed.",
      });
    }

    // Return survey with questions
    return NextResponse.json({
      survey,
      questions: getSurveyQuestions(survey.surveyType),
    });
  } catch (error) {
    console.error("Error fetching survey:", error);
    return NextResponse.json(
      { error: "Failed to fetch survey" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const surveyId = parseInt(id);
    const body = await request.json();

    const {
      npsScore,
      overallRating,
      responses,
      testimonial,
      canUseAsTestimonial,
    } = body;

    // Validate required fields
    if (npsScore === undefined && overallRating === undefined) {
      return NextResponse.json(
        { error: "At least npsScore or overallRating is required" },
        { status: 400 }
      );
    }

    // Validate ranges
    if (npsScore !== undefined && (npsScore < 0 || npsScore > 10)) {
      return NextResponse.json(
        { error: "npsScore must be between 0 and 10" },
        { status: 400 }
      );
    }
    if (overallRating !== undefined && (overallRating < 1 || overallRating > 5)) {
      return NextResponse.json(
        { error: "overallRating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const result = await submitSurveyResponse(surveyId, {
      npsScore,
      overallRating,
      responses,
      testimonial,
      canUseAsTestimonial,
    });

    return NextResponse.json({
      success: true,
      pointsAwarded: result.pointsAwarded,
      message: `Thank you for your feedback! You've earned ${result.pointsAwarded} loyalty points.`,
    });
  } catch (error) {
    console.error("Error submitting survey:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to submit survey" },
      { status: 500 }
    );
  }
}

/**
 * Get survey questions based on type
 */
function getSurveyQuestions(surveyType: string) {
  const baseQuestions = [
    {
      id: "overallRating",
      question: "How would you rate your overall experience?",
      type: "rating",
      required: true,
      min: 1,
      max: 5,
    },
    {
      id: "npsScore",
      question: "How likely are you to recommend CuratedAscents to friends and family?",
      type: "nps",
      required: true,
      min: 0,
      max: 10,
    },
  ];

  const detailedQuestions = [
    { id: "guideRating", question: "How would you rate your guide(s)?", type: "rating", required: false },
    { id: "accommodationRating", question: "How would you rate your accommodations?", type: "rating", required: false },
    { id: "transportRating", question: "How would you rate transportation services?", type: "rating", required: false },
    { id: "itineraryRating", question: "How well did the itinerary meet your expectations?", type: "rating", required: false },
    { id: "valueForMoney", question: "How would you rate the value for money?", type: "rating", required: false },
    { id: "highlights", question: "What were the highlights of your trip?", type: "text", required: false },
    { id: "improvements", question: "What could we improve?", type: "text", required: false },
  ];

  const testimonialQuestion = {
    id: "testimonial",
    question: "Would you like to share a testimonial about your experience?",
    type: "testimonial",
    required: false,
    helpText: "Your words help future travelers make confident decisions.",
  };

  switch (surveyType) {
    case "post_trip":
      return [...baseQuestions, ...detailedQuestions, testimonialQuestion];
    case "nps":
      return baseQuestions;
    case "quick_feedback":
      return [baseQuestions[0]];
    case "review_request":
      return [...baseQuestions, testimonialQuestion];
    default:
      return baseQuestions;
  }
}
