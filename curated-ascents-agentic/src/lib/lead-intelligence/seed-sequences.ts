/**
 * Seed Default Nurture Sequences
 * Run via API or manually to create starter sequences
 */

import { createNurtureSequence, getActiveSequences } from "./nurture-engine";

export async function seedDefaultNurtureSequences() {
  // Check if sequences already exist
  const existing = await getActiveSequences();
  if (existing.length > 0) {
    console.log(`Skipping nurture sequence seed: ${existing.length} sequences already exist`);
    return { seeded: 0, existing: existing.length };
  }

  const sequences = [
    {
      name: "Welcome Series",
      description: "Onboarding sequence for new leads from chat",
      triggerType: "new_lead" as const,
      triggerConditions: {
        minScore: 0,
        maxScore: 100,
      },
      emails: [
        {
          dayOffset: 0,
          subject: "Welcome to CuratedAscents, {name}!",
          templateId: "welcome_series_1",
        },
        {
          dayOffset: 3,
          subject: "Discover Your Perfect Himalayan Adventure",
          templateId: "destination_inspiration",
          conditions: { minScore: 10 },
        },
        {
          dayOffset: 7,
          subject: "Ready to Start Planning?",
          templateId: "quote_followup",
          conditions: { minScore: 20 },
        },
      ],
    },
    {
      name: "Abandoned Conversation Recovery",
      description: "Re-engage leads who stopped chatting mid-conversation",
      triggerType: "abandoned_conversation" as const,
      triggerConditions: {
        minScore: 20,
        maxScore: 70,
        daysInactive: 2,
        excludeStatuses: ["converted", "lost", "dormant"],
      },
      emails: [
        {
          dayOffset: 0,
          subject: "We're Still Here for You",
          templateId: "destination_inspiration",
        },
        {
          dayOffset: 4,
          subject: "Your Adventure Awaits",
          templateId: "quote_followup",
          conditions: { minScore: 30 },
        },
        {
          dayOffset: 10,
          subject: "Last Chance: Special Offer Inside",
          templateId: "last_chance",
        },
      ],
    },
    {
      name: "Post-Quote Nurture",
      description: "Follow up with leads who received a quote but haven't booked",
      triggerType: "post_quote" as const,
      triggerConditions: {
        hasQuote: true,
      },
      emails: [
        {
          dayOffset: 1,
          subject: "Questions About Your Quote?",
          templateId: "quote_followup",
        },
        {
          dayOffset: 5,
          subject: "Limited Availability Alert",
          templateId: "destination_inspiration",
        },
        {
          dayOffset: 10,
          subject: "Your Quote Expires Soon",
          templateId: "last_chance",
        },
      ],
    },
    {
      name: "High-Value Lead Fast Track",
      description: "Premium treatment for leads scoring 80+",
      triggerType: "high_value_lead" as const,
      triggerConditions: {
        minScore: 80,
      },
      emails: [
        {
          dayOffset: 0,
          subject: "A Personal Note from Our Team",
          templateId: "welcome_series_1",
        },
        {
          dayOffset: 2,
          subject: "Exclusive Experiences Just for You",
          templateId: "destination_inspiration",
        },
      ],
    },
    {
      name: "Low-Score Re-engagement",
      description: "Try to activate leads who showed initial interest but went cold",
      triggerType: "post_inquiry" as const,
      triggerConditions: {
        minScore: 10,
        maxScore: 40,
      },
      emails: [
        {
          dayOffset: 0,
          subject: "Still Dreaming of the Himalayas?",
          templateId: "destination_inspiration",
        },
        {
          dayOffset: 7,
          subject: "Let Us Help You Plan",
          templateId: "quote_followup",
        },
        {
          dayOffset: 14,
          subject: "We'd Love to Hear from You",
          templateId: "last_chance",
        },
      ],
    },
  ];

  let seeded = 0;
  for (const sequence of sequences) {
    try {
      await createNurtureSequence(sequence);
      seeded++;
      console.log(`Created nurture sequence: ${sequence.name}`);
    } catch (error) {
      console.error(`Failed to create sequence ${sequence.name}:`, error);
    }
  }

  return { seeded, existing: 0 };
}
