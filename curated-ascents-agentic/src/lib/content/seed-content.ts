/**
 * Seed Default Content Templates
 * Run via API or manually to create starter templates
 */

import { db } from "@/db";
import { contentTemplates, destinationContent, destinations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createContentTemplate, createDestinationContent } from "./content-engine";

export async function seedDefaultContentTemplates() {
  // Check if templates already exist
  const existing = await db.select().from(contentTemplates).limit(1);
  if (existing.length > 0) {
    console.log("Content templates already exist, skipping seed");
    return { templatesSeeded: 0, contentSeeded: 0 };
  }

  const templates = [
    // Email Templates
    {
      name: "Quote Introduction",
      slug: "quote-intro",
      category: "email",
      subcategory: "quote",
      subject: "Your Custom {{destination}} Adventure Awaits, {{firstName}}!",
      content: `Dear {{firstName}},

Thank you for your interest in exploring {{destination}} with CuratedAscents.

We've crafted a personalized journey just for you, combining the best of what this incredible region has to offer. From stunning landscapes to authentic cultural experiences, every detail has been thoughtfully planned.

{{quoteHighlights}}

Your quote is valid for 14 days, and our team is standing by to answer any questions.

Ready to embark on the adventure of a lifetime? Simply reply to this email or click below to proceed.

{{callToAction}}

Warm regards,
The CuratedAscents Team`,
      availableTokens: [
        { token: "{{firstName}}", description: "Client's first name" },
        { token: "{{destination}}", description: "Primary destination" },
        { token: "{{quoteHighlights}}", description: "Key highlights from the quote" },
        { token: "{{callToAction}}", description: "Personalized call to action" },
      ],
    },
    {
      name: "Booking Confirmation",
      slug: "booking-confirmation",
      category: "email",
      subcategory: "booking",
      subject: "Your {{destination}} Adventure is Confirmed!",
      content: `Dear {{firstName}},

Wonderful news! Your booking has been confirmed, and your Himalayan adventure awaits!

**Booking Reference:** {{bookingReference}}
**Travel Dates:** {{travelDates}}
**Travelers:** {{travelers}}

What happens next:
1. You'll receive your detailed travel documents within 48 hours
2. Our team will send pre-departure information 2 weeks before your trip
3. Your on-ground coordinator will reach out 3 days before arrival

If you have any questions in the meantime, don't hesitate to reach out.

We're excited to create an unforgettable experience for you!

Warm regards,
The CuratedAscents Team`,
      availableTokens: [
        { token: "{{firstName}}", description: "Client's first name" },
        { token: "{{destination}}", description: "Primary destination" },
        { token: "{{bookingReference}}", description: "Booking reference number" },
        { token: "{{travelDates}}", description: "Travel date range" },
        { token: "{{travelers}}", description: "Number of travelers" },
      ],
    },
    {
      name: "Welcome Email",
      slug: "welcome-new-client",
      category: "email",
      subcategory: "nurture",
      subject: "Welcome to CuratedAscents, {{firstName}}!",
      content: `Dear {{firstName}},

Welcome to CuratedAscents! We're thrilled you're considering the Himalayas for your next adventure.

As specialists in Nepal, Bhutan, Tibet, and India, we've helped thousands of travelers experience the magic of this incredible region. Whether you dream of trekking to Everest Base Camp, exploring ancient monasteries, or encountering rare wildlife, we're here to make it happen.

Here's what makes us different:
- **Expert Knowledge:** Our team has collectively spent decades exploring these mountains
- **Personalized Service:** Every journey is custom-crafted to your preferences
- **24/7 Support:** We're with you before, during, and after your trip

Ready to start planning? Simply reply to this email or start a conversation on our website.

Your adventure awaits!

Warm regards,
The CuratedAscents Team`,
      availableTokens: [
        { token: "{{firstName}}", description: "Client's first name" },
      ],
    },
    {
      name: "Pre-Departure Reminder",
      slug: "pre-departure-7day",
      category: "email",
      subcategory: "booking",
      subject: "7 Days Until Your {{destination}} Adventure!",
      content: `Dear {{firstName}},

Your adventure to {{destination}} is just 7 days away! Here's a quick checklist to ensure you're ready:

**Documents:**
- [ ] Passport (valid for 6+ months)
- [ ] Visa (if required)
- [ ] Travel insurance documents
- [ ] Printed itinerary and vouchers

**Essentials:**
- [ ] Appropriate clothing for the season
- [ ] Comfortable walking shoes
- [ ] Any personal medications
- [ ] Camera and chargers

**Your Emergency Contacts:**
- Local Coordinator: {{coordinatorName}} - {{coordinatorPhone}}
- 24/7 Support: {{supportNumber}}

We'll send your final briefing 24 hours before departure.

Excited for your journey!

Warm regards,
The CuratedAscents Team`,
      availableTokens: [
        { token: "{{firstName}}", description: "Client's first name" },
        { token: "{{destination}}", description: "Primary destination" },
        { token: "{{coordinatorName}}", description: "Local coordinator name" },
        { token: "{{coordinatorPhone}}", description: "Coordinator phone" },
        { token: "{{supportNumber}}", description: "Support phone number" },
      ],
    },
    {
      name: "Post-Trip Thank You",
      slug: "post-trip-thanks",
      category: "email",
      subcategory: "feedback",
      subject: "Thank You for Traveling with Us, {{firstName}}!",
      content: `Dear {{firstName}},

Welcome back from {{destination}}! We hope your journey exceeded all expectations.

We'd love to hear about your experience. Your feedback helps us continually improve and assists future travelers in planning their adventures.

{{feedbackLink}}

As a token of our appreciation, you've earned {{loyaltyPoints}} loyalty points! These can be redeemed on your next booking.

Already dreaming of your next adventure? We're here whenever you're ready to start planning.

Thank you for choosing CuratedAscents.

Warm regards,
The CuratedAscents Team

P.S. If you have any photos you'd like to share, we'd love to see them!`,
      availableTokens: [
        { token: "{{firstName}}", description: "Client's first name" },
        { token: "{{destination}}", description: "Destination visited" },
        { token: "{{feedbackLink}}", description: "Link to feedback survey" },
        { token: "{{loyaltyPoints}}", description: "Points earned" },
      ],
    },
    // PDF Templates
    {
      name: "Quote Cover Letter",
      slug: "quote-cover-letter",
      category: "pdf",
      subcategory: "quote",
      content: `Dear {{clientName}},

Thank you for considering CuratedAscents for your journey to {{destinations}}.

We have carefully crafted this proposal based on your interests in {{interests}} and your preference for {{travelStyle}} experiences.

This {{duration}} journey includes:
{{includesHighlights}}

The enclosed proposal contains:
- Day-by-day itinerary with narrative descriptions
- Accommodation details with photos
- Pricing breakdown
- Terms and conditions

We look forward to making your dream adventure a reality.

Warm regards,

{{agentName}}
Your Personal Expedition Architect
CuratedAscents`,
      availableTokens: [
        { token: "{{clientName}}", description: "Full client name" },
        { token: "{{destinations}}", description: "List of destinations" },
        { token: "{{interests}}", description: "Client interests" },
        { token: "{{travelStyle}}", description: "Travel style preference" },
        { token: "{{duration}}", description: "Trip duration" },
        { token: "{{includesHighlights}}", description: "Key inclusions" },
        { token: "{{agentName}}", description: "Agent name" },
      ],
    },
  ];

  let templatesSeeded = 0;
  for (const template of templates) {
    try {
      await createContentTemplate(template);
      templatesSeeded++;
      console.log(`Created template: ${template.name}`);
    } catch (error) {
      console.error(`Failed to create template ${template.name}:`, error);
    }
  }

  // Seed some destination content
  const destContent = [
    {
      destinationName: "Kathmandu",
      contentType: "destination_overview",
      title: "Kathmandu - Cultural Heart of Nepal",
      content: `Kathmandu, Nepal's vibrant capital, is a city where ancient temples stand beside modern cafes, and sacred rituals unfold on bustling street corners. The Kathmandu Valley, a UNESCO World Heritage Site, contains seven monument zones showcasing exceptional Newari architecture and over 130 important monuments.

The city serves as the gateway to Himalayan adventures while offering its own rich tapestry of experiences. Durbar Square's royal palaces, Swayambhunath's watchful Buddha eyes, and Pashupatinath's sacred cremation ghats each tell stories spanning millennia.

Despite rapid modernization, Kathmandu retains its spiritual essence. Morning prayers echo from neighborhood temples, street vendors sell fresh marigold garlands, and sadhus share wisdom in ancient courtyards. This is a city that rewards slow exploration and open hearts.`,
      summary: "Nepal's spiritual capital blending ancient temples, vibrant culture, and Himalayan gateway experiences.",
      highlights: [
        "Seven UNESCO World Heritage monument zones",
        "Swayambhunath and Boudhanath stupas",
        "Durbar Square royal palaces",
        "Pashupatinath Temple rituals",
        "Thamel's vibrant streets",
      ],
    },
    {
      destinationName: "Everest",
      contentType: "destination_overview",
      title: "Everest Region - Roof of the World",
      content: `The Everest region, known locally as Khumbu, offers the ultimate Himalayan experience. Here, the world's highest peak rises to 8,848 meters, surrounded by an amphitheater of mountains that have inspired adventurers for generations.

But Everest is more than a mountain—it's home to the legendary Sherpa people, whose warmth and resilience have enabled countless mountaineering achievements. Their monasteries perch on impossibly steep hillsides, prayer flags flutter in thin air, and ancient trade routes connect remote communities.

Whether you're trekking to Base Camp, flying over the summit, or simply gazing at Everest from Lukla's tiny airstrip, this is a landscape that forever changes those who witness it. The journey here is challenging, but the rewards—both physical and spiritual—are beyond measure.`,
      summary: "Home to the world's highest peak and the legendary Sherpa culture in the heart of the Himalayas.",
      highlights: [
        "Mount Everest (8,848m) - highest peak on Earth",
        "Everest Base Camp trek",
        "Tengboche Monastery",
        "Sherpa culture and hospitality",
        "Namche Bazaar - gateway town",
      ],
    },
  ];

  let contentSeeded = 0;
  for (const content of destContent) {
    try {
      // Find destination ID
      const [dest] = await db
        .select()
        .from(destinations)
        .where(eq(destinations.city, content.destinationName))
        .limit(1);

      if (dest) {
        await createDestinationContent({
          destinationId: dest.id,
          contentType: content.contentType,
          title: content.title,
          content: content.content,
          summary: content.summary,
          highlights: content.highlights,
        });
        contentSeeded++;
        console.log(`Created content for: ${content.destinationName}`);
      }
    } catch (error) {
      console.error(`Failed to create content for ${content.destinationName}:`, error);
    }
  }

  return { templatesSeeded, contentSeeded };
}
