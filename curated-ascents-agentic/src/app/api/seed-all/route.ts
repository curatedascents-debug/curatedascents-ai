import { NextResponse } from 'next/server';
import { db } from '@/db';
import {
  suppliers,
  destinations,
  hotels,
  hotelRoomRates,
  transportation,
  guides,
  porters,
  flightsDomestic,
  helicopterSharing,
  helicopterCharter,
  permitsFees,
  miscellaneousServices,
  packages,
  blogCategories,
  blogPosts,
} from '@/db/schema';
import {
  sampleSuppliers,
  sampleDestinations,
  sampleHotels,
  sampleHotelRates,
  sampleTransportation,
  sampleGuides,
  samplePorters,
  sampleFlights,
  sampleHelicopterSharing,
  sampleHelicopterCharter,
  samplePermitsFees,
  sampleMiscellaneous,
  samplePackages,
} from '@/db/seed-data';

export async function GET() {
  try {
    console.log('Starting comprehensive database seed...');

    // 1. Seed Suppliers
    const insertedSuppliers = await db.insert(suppliers).values(
      sampleSuppliers.map(s => ({
        name: s.name,
        type: s.type,
        country: s.country,
        city: s.city,
      }))
    ).returning();
    console.log(`Inserted ${insertedSuppliers.length} suppliers`);

    // 2. Seed Destinations
    const insertedDestinations = await db.insert(destinations).values(
      sampleDestinations.map(d => ({
        country: d.country,
        region: d.region,
        city: d.city,
        altitude: d.altitude,
      }))
    ).returning();
    console.log(`Inserted ${insertedDestinations.length} destinations`);

    // Create lookup maps
    const destinationMap = new Map(
      insertedDestinations.map(d => [d.city, d.id])
    );
    const supplierMap = new Map(
      insertedSuppliers.map(s => [s.name, s.id])
    );

    // 3. Seed Hotels
    const insertedHotels = await db.insert(hotels).values(
      sampleHotels.map(h => ({
        name: h.name,
        supplierId: supplierMap.get("Dwarika's Group") || null,
        destinationId: destinationMap.get(h.destinationCity) || null,
        starRating: h.starRating,
        category: h.category,
        description: h.description,
        amenities: h.amenities,
      }))
    ).returning();
    console.log(`Inserted ${insertedHotels.length} hotels`);

    // Create hotel lookup
    const hotelMap = new Map(
      insertedHotels.map(h => [h.name, h.id])
    );

    // 4. Seed Hotel Room Rates
    const hotelRateValues = sampleHotelRates.map(r => ({
      hotelId: hotelMap.get(r.hotelName)!,
      roomType: r.roomType,
      mealPlan: r.mealPlan,
      costSingle: r.costSingle?.toString(),
      sellSingle: r.sellSingle?.toString(),
      costDouble: r.costDouble?.toString(),
      sellDouble: r.sellDouble?.toString(),
      costExtraBed: r.costExtraBed?.toString(),
      sellExtraBed: r.sellExtraBed?.toString(),
      inclusions: r.inclusions,
      currency: 'USD',
    }));
    
    const insertedRates = await db.insert(hotelRoomRates).values(hotelRateValues).returning();
    console.log(`Inserted ${insertedRates.length} hotel room rates`);

    // 5. Seed Transportation
    const insertedTransport = await db.insert(transportation).values(
      sampleTransportation.map(t => ({
        vehicleType: t.vehicleType,
        vehicleName: t.vehicleName,
        capacity: t.capacity,
        routeFrom: t.routeFrom,
        routeTo: t.routeTo,
        distanceKm: t.distanceKm,
        durationHours: t.durationHours?.toString(),
        costPrice: t.costPrice?.toString(),
        sellPrice: t.sellPrice?.toString(),
        inclusions: t.inclusions,
      }))
    ).returning();
    console.log(`Inserted ${insertedTransport.length} transportation options`);

    // 6. Seed Guides
    const insertedGuides = await db.insert(guides).values(
      sampleGuides.map(g => ({
        guideType: g.guideType,
        destination: g.destination,
        languages: g.languages,
        specializations: g.specializations,
        experienceYears: g.experienceYears,
        costPerDay: g.costPerDay?.toString(),
        sellPerDay: g.sellPerDay?.toString(),
        inclusions: g.inclusions,
        exclusions: g.exclusions,
        maxGroupSize: g.maxGroupSize,
      }))
    ).returning();
    console.log(`Inserted ${insertedGuides.length} guides`);

    // 7. Seed Porters
    const insertedPorters = await db.insert(porters).values(
      samplePorters.map(p => ({
        region: p.region,
        maxWeightKg: p.maxWeightKg,
        costPerDay: p.costPerDay?.toString(),
        sellPerDay: p.sellPerDay?.toString(),
        inclusions: p.inclusions,
        exclusions: p.exclusions,
      }))
    ).returning();
    console.log(`Inserted ${insertedPorters.length} porters`);

    // 8. Seed Domestic Flights
    const insertedFlights = await db.insert(flightsDomestic).values(
      sampleFlights.map(f => ({
        airlineName: f.airlineName,
        flightSector: f.flightSector,
        departureCity: f.departureCity,
        arrivalCity: f.arrivalCity,
        flightDuration: f.flightDuration,
        baggageAllowanceKg: f.baggageAllowanceKg,
        costPrice: f.costPrice?.toString(),
        sellPrice: f.sellPrice?.toString(),
        inclusions: f.inclusions,
      }))
    ).returning();
    console.log(`Inserted ${insertedFlights.length} domestic flights`);

    // 9. Seed Helicopter Sharing
    const insertedHeliSharing = await db.insert(helicopterSharing).values(
      sampleHelicopterSharing.map(h => ({
        routeName: h.routeName,
        routeFrom: h.routeFrom,
        routeTo: h.routeTo,
        flightDuration: h.flightDuration,
        helicopterType: h.helicopterType,
        seatsAvailable: h.seatsAvailable,
        minPassengers: h.minPassengers,
        costPerSeat: h.costPerSeat?.toString(),
        sellPerSeat: h.sellPerSeat?.toString(),
        inclusions: h.inclusions,
      }))
    ).returning();
    console.log(`Inserted ${insertedHeliSharing.length} helicopter sharing options`);

    // 10. Seed Helicopter Charter
    const insertedHeliCharter = await db.insert(helicopterCharter).values(
      sampleHelicopterCharter.map(h => ({
        routeName: h.routeName,
        routeFrom: h.routeFrom,
        routeTo: h.routeTo,
        flightDuration: h.flightDuration,
        helicopterType: h.helicopterType,
        maxPassengers: h.maxPassengers,
        costPerCharter: h.costPerCharter?.toString(),
        sellPerCharter: h.sellPerCharter?.toString(),
        inclusions: h.inclusions,
      }))
    ).returning();
    console.log(`Inserted ${insertedHeliCharter.length} helicopter charter options`);

    // 11. Seed Permits & Fees
    const insertedPermits = await db.insert(permitsFees).values(
      samplePermitsFees.map(p => ({
        name: p.name,
        type: p.type,
        country: p.country,
        region: p.region,
        applicableTo: p.applicableTo,
        costPrice: p.costPrice?.toString(),
        sellPrice: p.sellPrice?.toString(),
        description: p.description,
        processingTime: p.processingTime,
      }))
    ).returning();
    console.log(`Inserted ${insertedPermits.length} permits/fees`);

    // 12. Seed Miscellaneous Services
    const insertedMisc = await db.insert(miscellaneousServices).values(
      sampleMiscellaneous.map(m => ({
        name: m.name,
        category: m.category,
        destination: m.destination,
        description: m.description,
        duration: m.duration,
        minParticipants: m.minParticipants,
        costPrice: m.costPrice?.toString(),
        sellPrice: m.sellPrice?.toString(),
        priceType: m.priceType,
        inclusions: m.inclusions,
      }))
    ).returning();
    console.log(`Inserted ${insertedMisc.length} miscellaneous services`);

    // 13. Seed Packages
    const insertedPackages = await db.insert(packages).values(
      samplePackages.map(p => ({
        name: p.name,
        packageType: p.packageType,
        country: p.country,
        region: p.region,
        durationDays: p.durationDays,
        durationNights: p.durationNights,
        difficulty: p.difficulty,
        maxAltitude: p.maxAltitude,
        groupSizeMin: p.groupSizeMin,
        groupSizeMax: p.groupSizeMax,
        itinerarySummary: p.itinerarySummary,
        costPrice: p.costPrice?.toString(),
        sellPrice: p.sellPrice?.toString(),
        singleSupplement: p.singleSupplement?.toString(),
        inclusions: p.inclusions,
        exclusions: p.exclusions,
        isFixedDeparture: p.isFixedDeparture,
        departureDates: p.departureDates,
      }))
    ).returning();
    console.log(`Inserted ${insertedPackages.length} packages`);

    // 14. Seed Blog Categories
    const blogCategoryData = [
      { name: 'Destination Guides', slug: 'destination-guides', description: 'In-depth guides to our travel destinations', color: '#10b981', icon: 'map', displayOrder: 1 },
      { name: 'Travel Tips', slug: 'travel-tips', description: 'Expert advice for your journey', color: '#3b82f6', icon: 'lightbulb', displayOrder: 2 },
      { name: 'Packing Lists', slug: 'packing-lists', description: 'Essential packing guides for every trip', color: '#8b5cf6', icon: 'backpack', displayOrder: 3 },
      { name: 'Cultural Insights', slug: 'cultural-insights', description: 'Discover local traditions and customs', color: '#f59e0b', icon: 'globe', displayOrder: 4 },
      { name: 'Seasonal Content', slug: 'seasonal-content', description: 'Best times to visit and seasonal highlights', color: '#ef4444', icon: 'calendar', displayOrder: 5 },
      { name: 'Adventure Stories', slug: 'adventure-stories', description: 'Real stories from the trail', color: '#06b6d4', icon: 'mountain', displayOrder: 6 },
    ];

    let insertedBlogCategories: { id: number }[] = [];
    try {
      insertedBlogCategories = await db.insert(blogCategories).values(blogCategoryData).returning({ id: blogCategories.id });
      console.log(`Inserted ${insertedBlogCategories.length} blog categories`);
    } catch {
      // Categories may already exist from previous seed
      const existing = await db.select({ id: blogCategories.id }).from(blogCategories).orderBy(blogCategories.displayOrder);
      insertedBlogCategories = existing;
      console.log(`Using ${insertedBlogCategories.length} existing blog categories`);
    }

    // 15. Seed Blog Posts (12 posts across 6 categories)
    const catIds = insertedBlogCategories.map(c => c.id);
    const now = new Date();
    const blogPostData = [
      // Destination Guides (cat 0)
      {
        title: 'The Ultimate Guide to Everest Base Camp Trek',
        slug: 'ultimate-guide-everest-base-camp-trek-2025',
        excerpt: 'Everything you need to know about trekking to the foot of the world\'s highest peak — routes, seasons, fitness, lodges, and insider tips.',
        content: `# The Ultimate Guide to Everest Base Camp Trek\n\nThe Everest Base Camp trek is the quintessential Himalayan adventure. At 5,364 meters, standing beneath the Khumbu Icefall with Everest towering above is a moment that changes lives.\n\n## Why Trek to Everest Base Camp?\n\nEvery year, thousands of trekkers from around the world make the pilgrimage to EBC. The journey isn't just about the destination — it's the Sherpa villages, ancient monasteries, and jaw-dropping mountain panoramas along the way.\n\n## The Classic Route\n\n**Day 1-2:** Fly from Kathmandu to Lukla (2,860m) and trek to Phakding.\n**Day 3-4:** Ascend through rhododendron forests to Namche Bazaar (3,440m), the Sherpa capital.\n**Day 5:** Acclimatization day in Namche with views of Everest, Ama Dablam, and Thamserku.\n**Day 6-8:** Trek through Tengboche Monastery, Dingboche, and up to Lobuche.\n**Day 9:** The big day — Gorak Shep to Everest Base Camp (5,364m).\n**Day 10:** Optional sunrise at Kala Patthar (5,545m) for the best Everest views.\n**Day 11-13:** Descend back to Lukla.\n\n## Best Season\n\n**Pre-monsoon (March-May):** Warmer temperatures, rhododendrons in bloom. Busier on the trail.\n**Post-monsoon (September-November):** Crystal-clear skies, stable weather. The most popular season.\n\n## Fitness Requirements\n\nYou don't need to be an athlete, but good cardiovascular fitness is essential. We recommend:\n- Start training 3-4 months before departure\n- Focus on hiking with a weighted pack\n- Include stair climbing and cardio sessions\n- Practice at altitude if possible\n\n## Luxury Lodges\n\nGone are the days of basic teahouses. Our luxury EBC trek features premium lodges with private rooms, hot showers, and gourmet meals. Highlights include Yeti Mountain Home in Namche and Everest Summit Lodges along the route.\n\n## What Makes Our Trek Different\n\n- **Private guides** with 10+ years of Everest experience\n- **Luxury lodge accommodation** throughout\n- **Helicopter return option** — skip the 3-day descent\n- **Porter support** — trek with just a daypack\n- **24/7 satellite phone** for emergencies`,
        categoryId: catIds[0],
        featuredImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200',
        featuredImageAlt: 'Everest Base Camp with prayer flags and Khumbu Icefall',
        contentType: 'destination_guide',
        tags: ['everest', 'trekking', 'nepal', 'base camp', 'luxury trek'],
        keywords: ['everest base camp trek', 'EBC trek guide', 'nepal trekking', 'luxury everest trek'],
        readTimeMinutes: 8,
      },
      {
        title: 'Bhutan: The Last Shangri-La — A Complete Travel Guide',
        slug: 'bhutan-complete-travel-guide',
        excerpt: 'Discover the Thunder Dragon Kingdom — from Tiger\'s Nest to hidden valleys, ancient festivals, and Bhutan\'s unique approach to happiness.',
        content: `# Bhutan: The Last Shangri-La\n\nBhutan is unlike anywhere else on Earth. This tiny Himalayan kingdom measures success not by GDP, but by Gross National Happiness. With a policy of "high value, low impact" tourism, every visit feels exclusive.\n\n## Must-Visit Destinations\n\n### Paro Valley\nHome to the iconic Tiger\'s Nest Monastery (Taktsang), perched impossibly on a cliff at 3,120m. The 2-hour hike through pine forests is rewarded with one of Asia\'s most photographed sights.\n\n### Thimphu\nThe world\'s only capital without traffic lights. Visit the Memorial Chorten, the giant Buddha Dordenma statue, and the weekend market for local crafts.\n\n### Punakha\nThe old winter capital, set at the confluence of two rivers. Punakha Dzong is arguably the most beautiful fortress-monastery in Bhutan.\n\n### Bumthang Valley\nBhutan\'s spiritual heartland. Ancient temples, Swiss-style cheese factories, and stunning hiking trails through alpine meadows.\n\n## Festival Season\n\nBhutanese tshechus (festivals) are living museums of masked dance and spiritual tradition. The Paro and Thimphu tshechus are the most accessible, featuring elaborate mask dances dating back centuries.\n\n## Sustainable Development Fee\n\nBhutan charges a daily Sustainable Development Fee (SDF) of $100/day for international tourists. This funds free healthcare, education, and environmental conservation.\n\n## Our Luxury Bhutan Experiences\n\n- Stay at Amankora lodges across five valleys\n- Private audience with a Buddhist lama\n- Traditional hot stone bath in a farmhouse\n- Helicopter transfer to remote Gangtey Valley`,
        categoryId: catIds[0],
        featuredImage: 'https://images.unsplash.com/photo-1578556881786-851d4b79cb73?w=1200',
        featuredImageAlt: 'Tiger\'s Nest Monastery in Paro, Bhutan',
        contentType: 'destination_guide',
        tags: ['bhutan', 'cultural travel', 'luxury', 'tigers nest', 'festivals'],
        keywords: ['bhutan travel guide', 'tigers nest monastery', 'bhutan luxury tour', 'paro valley'],
        readTimeMinutes: 7,
      },
      // Travel Tips (cat 1)
      {
        title: '10 Essential Tips for Your First Himalayan Trek',
        slug: 'essential-tips-first-himalayan-trek',
        excerpt: 'First time trekking in the Himalayas? Our expert guides share the tips they wish every trekker knew before setting off.',
        content: `# 10 Essential Tips for Your First Himalayan Trek\n\nAfter guiding thousands of trekkers through Nepal, Tibet, and Bhutan, our expedition leaders have distilled their wisdom into these essential tips.\n\n## 1. Acclimatize Properly\n\nAltitude sickness doesn't discriminate — it affects the ultra-fit and casual hikers equally. Follow the golden rule: **climb high, sleep low**. Never ascend more than 500m in sleeping altitude per day above 3,000m.\n\n## 2. Invest in Quality Boots\n\nYour boots are your most important gear. Break them in for at least 3-4 weeks before your trek. Waterproof, ankle-supporting boots with a stiff sole are non-negotiable.\n\n## 3. Layer, Layer, Layer\n\nHimalayan weather changes rapidly. You might start the day at -5°C and be trekking in sunshine by noon. A base layer, insulating mid-layer, and waterproof shell system works best.\n\n## 4. Hydrate Aggressively\n\nDrink 3-4 litres per day at altitude. Dehydration mimics altitude sickness symptoms and makes you more susceptible to it. Add electrolyte tablets to your water.\n\n## 5. Train Your Descents\n\nMost trekkers focus on uphill training and forget that descending is what destroys knees. Practice long downhill hikes with a weighted pack.\n\n## 6. Pack Light, Pack Right\n\nWith porter support on our treks, you only carry a daypack. Essential daypack items: water, snacks, rain jacket, sun protection, camera, and personal medications.\n\n## 7. Respect the Culture\n\nAlways walk clockwise around Buddhist monuments. Remove shoes before entering monasteries. Ask permission before photographing people.\n\n## 8. Carry Cash\n\nATMs disappear once you leave major towns. Carry enough Nepali rupees for personal expenses, tips, and emergency purchases.\n\n## 9. Trust Your Guide\n\nIf your guide says it\'s time to descend due to weather or altitude concerns, listen. They have years of mountain experience and your safety is their priority.\n\n## 10. Embrace the Pace\n\n"Bistaari, bistaari" (slowly, slowly) is the Nepali mantra. The Himalayas reward patience. Walk at a sustainable pace and enjoy every moment.`,
        categoryId: catIds[1],
        featuredImage: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200',
        featuredImageAlt: 'Trekkers on a Himalayan mountain trail',
        contentType: 'travel_tips',
        tags: ['trekking tips', 'himalaya', 'beginners', 'altitude', 'preparation'],
        keywords: ['himalayan trekking tips', 'first time trekking nepal', 'altitude sickness prevention'],
        readTimeMinutes: 6,
      },
      {
        title: 'How to Choose the Right Trek for Your Fitness Level',
        slug: 'choose-right-trek-fitness-level',
        excerpt: 'From gentle cultural walks to challenging high-altitude crossings — find the perfect Himalayan trek matched to your fitness and experience.',
        content: `# How to Choose the Right Trek for Your Fitness Level\n\nThe Himalayas offer treks for every ability level. Here\'s how to find your perfect match.\n\n## Easy: Cultural & Valley Treks (No experience needed)\n\n### Ghorepani Poon Hill (4-5 days)\n- Max altitude: 3,210m\n- Daily walking: 4-6 hours\n- Highlights: Sunrise over Annapurna and Dhaulagiri ranges\n- Perfect for: First-time trekkers, families, photography enthusiasts\n\n### Bhutan\'s Druk Path (5 days)\n- Max altitude: 3,750m\n- Daily walking: 5-6 hours\n- Highlights: Ancient monasteries, alpine lakes, Himalayan views\n- Perfect for: Cultural travelers who enjoy moderate hiking\n\n## Moderate: Classic Himalayan Treks (Good fitness required)\n\n### Everest Base Camp (12-14 days)\n- Max altitude: 5,364m\n- Daily walking: 5-7 hours\n- Highlights: Sherpa culture, Khumbu region, Everest views\n- Perfect for: Determined hikers with 3+ months training\n\n### Annapurna Circuit (14-18 days)\n- Max altitude: 5,416m (Thorong La Pass)\n- Daily walking: 5-8 hours\n- Highlights: Diverse landscapes from jungle to desert\n- Perfect for: Experienced day-hikers ready for multi-day challenge\n\n## Challenging: High Passes & Remote Routes (Experience essential)\n\n### Manaslu Circuit (14-16 days)\n- Max altitude: 5,106m (Larkya La)\n- Daily walking: 6-8 hours\n- Highlights: Remote villages, restricted area permit, fewer crowds\n- Perfect for: Seasoned trekkers wanting authentic experience\n\n### Upper Mustang (10-12 days)\n- Max altitude: 3,800m\n- Daily walking: 5-7 hours\n- Highlights: Tibetan culture, cave monasteries, desert landscapes\n- Perfect for: Cultural adventurers with good fitness\n\n## Our Recommendation\n\nNot sure where to start? Chat with our Expedition Architect — our AI-powered trip planner will match you with the perfect trek based on your fitness, interests, and travel dates.`,
        categoryId: catIds[1],
        featuredImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200',
        featuredImageAlt: 'Mountain trail with varying difficulty levels',
        contentType: 'travel_tips',
        tags: ['trek selection', 'fitness', 'difficulty levels', 'nepal treks', 'beginners'],
        keywords: ['easy himalayan treks', 'best trek for beginners', 'himalayan trek difficulty'],
        readTimeMinutes: 6,
      },
      // Packing Lists (cat 2)
      {
        title: 'The Complete Everest Base Camp Packing List',
        slug: 'complete-everest-base-camp-packing-list',
        excerpt: 'A gear expert\'s definitive packing list for EBC — what to bring, what to skip, and what your porter will carry.',
        content: `# The Complete Everest Base Camp Packing List\n\nPacking for EBC is a balance between being prepared for extreme conditions and keeping your load manageable. Here\'s our field-tested list.\n\n## Clothing Layers\n\n### Base Layer\n- 2x merino wool or synthetic long-sleeve tops\n- 2x base layer bottoms\n- 4x trekking socks (merino blend)\n- 4x underwear (moisture-wicking)\n\n### Mid Layer\n- 1x fleece jacket (200-weight)\n- 1x lightweight down jacket (for evenings and higher altitude)\n- 1x trekking pants (zip-off recommended)\n- 1x warm trekking pants (for above 4,000m)\n\n### Outer Layer\n- 1x waterproof/breathable jacket (Gore-Tex or similar)\n- 1x waterproof pants\n- 1x warm down parka (for Gorak Shep and EBC days)\n\n## Footwear\n- Waterproof trekking boots (broken in!)\n- Camp shoes or sandals\n- 1x pair of gaiters (optional but useful in snow)\n\n## Accessories\n- Warm beanie hat\n- Sun hat with brim\n- Buff/neck gaiter\n- 2x pairs gloves (liner + insulated)\n- Sunglasses with UV protection (Category 3-4)\n\n## Gear\n- 30-35L daypack\n- Sleeping bag (-15°C rated for spring/autumn)\n- Trekking poles (collapsible)\n- Headlamp + spare batteries\n- Water bottles (2x 1L, Nalgene-style)\n- Water purification (SteriPen or tablets)\n\n## Electronics\n- Camera + spare batteries (cold drains them fast)\n- Power bank (20,000mAh minimum)\n- Phone with offline maps\n- Universal adapter\n\n## Toiletries & Health\n- Sunscreen SPF 50+\n- Lip balm with SPF\n- Hand sanitizer\n- Wet wipes (biodegradable)\n- Personal medications\n- Diamox (consult your doctor)\n- Basic first aid kit\n\n## What NOT to Bring\n- Cotton clothing (absorbs sweat, dries slowly)\n- Jeans\n- Heavy books (use a Kindle)\n- Excessive electronics\n- Full-size toiletries\n\n## Pro Tip\nWith our luxury treks, porters carry your main duffel (up to 15kg). You only need your daypack during trekking hours. This makes the experience dramatically more comfortable.`,
        categoryId: catIds[2],
        featuredImage: 'https://images.unsplash.com/photo-1501554728187-ce583db33af7?w=1200',
        featuredImageAlt: 'Trekking gear laid out for packing',
        contentType: 'packing_list',
        tags: ['packing list', 'everest', 'gear', 'trekking equipment', 'EBC'],
        keywords: ['everest base camp packing list', 'what to pack for EBC', 'trekking gear list nepal'],
        readTimeMinutes: 7,
      },
      {
        title: 'What to Pack for a Luxury Bhutan Trip',
        slug: 'what-to-pack-luxury-bhutan-trip',
        excerpt: 'Bhutan\'s dress codes, mountain weather, and cultural etiquette require thoughtful packing. Our complete guide for the Thunder Dragon Kingdom.',
        content: `# What to Pack for a Luxury Bhutan Trip\n\nBhutan combines mountain hiking with temple visits, hot-stone baths, and fine dining — your suitcase needs to be versatile.\n\n## Essential Clothing\n\n### For Dzong & Temple Visits\n- Long pants or skirts (knees must be covered)\n- Long-sleeve shirts or blouses\n- Modest, smart-casual outfits\n- Shoes that slip on/off easily (you\'ll remove them often)\n\n### For Trekking & Outdoor Activities\n- Comfortable hiking pants\n- Moisture-wicking base layers\n- Light fleece or softshell jacket\n- Waterproof rain jacket\n- Sturdy walking shoes or light hiking boots\n\n### For Evenings at Luxury Lodges\n- Smart casual dinner wear\n- Light sweater or pashmina (lodges can be cool)\n- Comfortable indoor shoes\n\n## Weather Considerations\n\n**Spring (March-May):** Days 15-25°C, nights 5-10°C. Rhododendrons in bloom.\n**Autumn (September-November):** Days 15-22°C, nights 3-8°C. Clearest skies.\n**Winter (December-February):** Days 10-15°C, nights -5 to 5°C. Few tourists.\n\n## Cultural Items\n- Small gifts for monastery visits (incense, fruit)\n- A respectful attitude — Bhutanese take their culture seriously\n- Camera with good zoom (monasteries often restrict interior photography)\n\n## Luxury Lodge Amenities\n\nOur partner lodges (Amankora, COMO Uma) provide:\n- Robes and slippers\n- Premium toiletries\n- Hot water bottles for beds\n- Laundry service (usually returned same day)\n\nThis means you can pack lighter than you think!\n\n## Health & Documents\n- Passport with 6+ months validity\n- Bhutan visa (we arrange this for you)\n- Travel insurance documents\n- Prescription medications\n- Altitude medication if visiting higher valleys`,
        categoryId: catIds[2],
        featuredImage: 'https://images.unsplash.com/photo-1608377229419-3b5168b6c3da?w=1200',
        featuredImageAlt: 'Tiger\'s Nest monastery on cliffside in Bhutan',
        contentType: 'packing_list',
        tags: ['bhutan', 'packing', 'luxury travel', 'cultural dress code'],
        keywords: ['bhutan packing list', 'what to wear in bhutan', 'bhutan dress code temples'],
        readTimeMinutes: 5,
      },
      // Cultural Insights (cat 3)
      {
        title: 'Understanding Sherpa Culture: More Than Mountain Guides',
        slug: 'understanding-sherpa-culture',
        excerpt: 'The Sherpa people are far more than Everest guides. Discover their rich Buddhist traditions, mountain philosophy, and evolving identity.',
        content: `# Understanding Sherpa Culture: More Than Mountain Guides\n\nWhen most people hear "Sherpa," they think of Everest guides carrying impossible loads. But the Sherpa are an ancient Tibetan Buddhist community with a rich culture that long predates mountaineering.\n\n## Origins\n\nThe Sherpa migrated from eastern Tibet to Nepal\'s Solukhumbu region around 600 years ago. Their name means "people from the east" (Shar = east, Pa = people). They brought with them Tibetan Buddhism, yak herding traditions, and an intimate knowledge of mountain life.\n\n## Spiritual Life\n\nBuddhism permeates every aspect of Sherpa life. Mani stones carved with sacred mantras line every trail. Prayer flags flutter on every pass, carrying blessings on the wind. The monastery at Tengboche, rebuilt after a 1989 fire, is the spiritual heart of the Khumbu.\n\n### Key Traditions\n\n- **Losar** — Sherpa New Year, celebrated with masked dances and feasting\n- **Dumji** — A multi-day festival honoring Guru Rinpoche\n- **Mani Rimdu** — The famous masked dance festival at Tengboche Monastery\n\n## The Mountaineering Legacy\n\nTenzing Norgay\'s 1953 Everest summit with Edmund Hillary changed the Sherpa world forever. Today, Sherpa climbers hold most Everest records. Kami Rita Sherpa has summited Everest 30 times.\n\nBut mountaineering is also dangerous — more than 100 Sherpa have died on Everest. The community has a complex relationship with an industry that provides livelihoods but also demands enormous sacrifice.\n\n## Modern Sherpa Life\n\nToday\'s Khumbu Sherpas are entrepreneurs, lodge owners, and community leaders. Many have been educated abroad and returned to develop sustainable tourism. The younger generation balances tradition with modernity — you\'ll find monks with iPhones and yak herders with solar panels.\n\n## How Travelers Can Show Respect\n\n1. Learn a few Sherpa phrases: "Tashi Delek" (greeting), "Thuji Che" (thank you)\n2. Always walk clockwise around mani stones and chortens\n3. Ask before photographing people or ceremonies\n4. Tip generously — it\'s a major income source\n5. Support Sherpa-owned lodges and businesses`,
        categoryId: catIds[3],
        featuredImage: 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=1200',
        featuredImageAlt: 'Sherpa village with monastery and mountain backdrop',
        contentType: 'cultural_insight',
        tags: ['sherpa', 'culture', 'nepal', 'buddhism', 'everest'],
        keywords: ['sherpa culture', 'sherpa people nepal', 'khumbu sherpa traditions'],
        readTimeMinutes: 7,
      },
      {
        title: 'Sacred Festivals of the Himalayas You Can Witness',
        slug: 'sacred-festivals-himalayas',
        excerpt: 'From Bhutan\'s masked dances to Nepal\'s Dashain celebrations — time your visit to experience the Himalaya\'s most spectacular festivals.',
        content: `# Sacred Festivals of the Himalayas You Can Witness\n\nThe Himalayan calendar is rich with festivals that offer travelers an authentic window into living traditions. Here are the most spectacular celebrations you can experience.\n\n## Nepal\n\n### Dashain (September/October)\nNepal\'s biggest festival spans 15 days. Families reunite, elders give blessings with red tika on foreheads, and bamboo swings appear in every village. The energy is infectious.\n\n### Tihar / Deepawali (October/November)\nThe festival of lights. Day 1 honors crows, Day 2 dogs (with flower garlands!), Day 3 features stunning oil lamp displays, and Day 4 celebrates the bond between brothers and sisters.\n\n### Holi (March)\nThe festival of colors. Kathmandu\'s Durbar Square becomes a joyful battlefield of colored powder and water. Wear white — it won\'t stay white for long.\n\n## Bhutan\n\n### Paro Tshechu (March/April)\nThe most famous Bhutanese festival. Three days of sacred mask dances performed by monks in elaborate costumes. The highlight: the unfurling of a giant thangka (religious painting) at dawn.\n\n### Thimphu Tshechu (September/October)\nThe capital\'s biggest celebration draws thousands. Besides mask dances, you\'ll see atsara (clowns) entertaining crowds and locals in their finest kira and gho.\n\n### Black-Necked Crane Festival (November)\nIn Gangtey Valley, locals celebrate the arrival of endangered black-necked cranes from Tibet. School children perform crane dances — utterly charming.\n\n## Tibet\n\n### Saga Dawa (May/June)\nThe holiest month in Tibetan Buddhism, celebrating Buddha\'s birth, enlightenment, and passing. Pilgrims walk the Barkhor circuit around Jokhang Temple thousands of times.\n\n### Shoton Festival (August)\nThe "Yogurt Festival" in Lhasa features a giant thangka unveiling at Drepung Monastery, Tibetan opera performances, and picnics in Norbulingka park.\n\n## Planning Tips\n\n- Book 6-12 months ahead for festival dates — accommodation fills quickly\n- Festival dates follow lunar calendars and shift yearly\n- Our team tracks exact dates and can build your itinerary around them\n- Combine festivals with trekking or cultural tours for the ultimate experience`,
        categoryId: catIds[3],
        featuredImage: 'https://images.unsplash.com/photo-1503641926155-5c17619b79d0?w=1200',
        featuredImageAlt: 'Prayer flags with snowy Tibetan monastery',
        contentType: 'cultural_insight',
        tags: ['festivals', 'culture', 'nepal', 'bhutan', 'tibet', 'traditions'],
        keywords: ['himalayan festivals', 'bhutan tshechu', 'nepal dashain', 'tibet saga dawa'],
        readTimeMinutes: 6,
      },
      // Seasonal Content (cat 4)
      {
        title: 'Nepal in Autumn: Why October is the Perfect Month to Visit',
        slug: 'nepal-autumn-october-best-month',
        excerpt: 'Crystal-clear skies, comfortable temperatures, and festival celebrations — here\'s why autumn is Nepal\'s golden season.',
        content: `# Nepal in Autumn: Why October is the Perfect Month\n\nAsk any Nepal veteran when to visit, and the answer is almost always the same: October. Here\'s why.\n\n## The Weather\n\nThe monsoon retreats by late September, leaving behind washed skies of extraordinary clarity. October days are warm (15-25°C in Kathmandu, 5-15°C on treks) with minimal rainfall. The visibility is unmatched — you can see mountain ranges 200km away.\n\n## The Mountains\n\nPost-monsoon air is dust-free and crystal clear. This is when photographers get those iconic shots — Machapuchare reflected in Phewa Lake, the Annapurna range glowing pink at sunrise, Everest\'s plume visible from Namche Bazaar.\n\n## The Festivals\n\nOctober brings Nepal\'s two biggest celebrations:\n\n- **Dashain** (usually October): 15 days of family reunions, blessings, and joy\n- **Tihar** (October/November): The festival of lights, with oil lamps illuminating every home\n\nWitnessing these festivals adds an unforgettable cultural dimension to your trip.\n\n## The Trekking\n\n### Everest Region\nOctober is prime season. Expect 6-8 hours of sunshine daily, stable weather windows, and the Khumbu at its most photogenic.\n\n### Annapurna Region\nThe circuit and sanctuary treks are at their best. Rhododendron forests are green from the monsoon, and the passes are snow-free.\n\n### Off-the-Beaten-Path\nManaslu, Dolpo, and Upper Mustang are accessible and uncrowded compared to the main routes.\n\n## Wildlife\n\nChitwan National Park is excellent in October. The jungle is lush, rivers are manageable for canoe trips, and tiger sightings peak as animals come to water sources.\n\n## What to Expect\n\n- **Crowds:** This is peak season. Book 3-6 months ahead.\n- **Prices:** Higher than off-season, but worth every penny.\n- **Flights:** Lukla flights operate reliably. Domestic flights are consistent.\n\n## Our October Recommendation\n\nCombine a 12-day Everest Base Camp luxury trek with 3 days in Kathmandu during Dashain. It\'s the ultimate Nepal experience.`,
        categoryId: catIds[4],
        featuredImage: 'https://images.unsplash.com/photo-1571401835393-8c5f35328320?w=1200',
        featuredImageAlt: 'Prayer flags with Machapuchare peak in Nepal',
        contentType: 'seasonal',
        tags: ['autumn', 'october', 'nepal', 'best time to visit', 'weather'],
        keywords: ['nepal in october', 'best time to visit nepal', 'nepal autumn trekking season'],
        readTimeMinutes: 6,
      },
      {
        title: 'Spring Trekking in the Himalayas: A Season of Flowers and Views',
        slug: 'spring-trekking-himalayas-flowers',
        excerpt: 'March through May brings blooming rhododendrons, migrating birds, and warm days to the Himalayan trails. Plan your spring expedition here.',
        content: `# Spring Trekking in the Himalayas\n\nSpring (March-May) is the Himalaya\'s second great trekking season. While autumn gets more attention, spring has its own magic.\n\n## The Rhododendron Show\n\nNepal\'s national flower puts on a spectacular display from March through April. Entire hillsides blaze red, pink, and white. The best displays are on the Ghorepani-Poon Hill trek and in the Annapurna region between 2,500m and 4,000m.\n\n## Weather Patterns\n\n**March:** Cool mornings, warm afternoons. Some haze at lower altitudes. Snow still present above 4,500m.\n**April:** The sweet spot. Warm days, manageable nights, flowers in full bloom. Excellent visibility.\n**May:** Getting warm at lower altitudes. Higher routes still comfortable. Pre-monsoon clouds build in afternoons but rarely rain.\n\n## Best Spring Treks\n\n### Annapurna Base Camp (10-12 days)\nThe rhododendron forests en route are legendary in spring. The sanctuary is framed by blooming valleys and snow-capped peaks.\n\n### Langtang Valley (7-10 days)\nClose to Kathmandu, Langtang offers spring wildflowers, cheese factories, and glacier views without the crowds.\n\n### Everest Base Camp\nSpring EBC is busier than autumn but offers warmer temperatures and the chance to see expedition teams preparing for May summit attempts.\n\n## Wildlife in Spring\n\n- Danphe (Himalayan Monal) — Nepal\'s iridescent national bird is most visible in spring\n- Migrating birds fill Chitwan and Bardia national parks\n- Red pandas are more active in Langtang and eastern Nepal\n\n## Festivals\n\n- **Holi** (March): Festival of colors\n- **Bisket Jatra** (April): Bhaktapur\'s spectacular New Year celebration\n- **Buddha Jayanti** (May): Celebrations at Lumbini, Buddha\'s birthplace\n\n## What to Pack Extra\n\n- Antihistamines (pollen can be intense)\n- Rain layer (afternoon showers increase in May)\n- Camera with macro lens (for flower photography)`,
        categoryId: catIds[4],
        featuredImage: 'https://images.unsplash.com/photo-1486911278844-a81c5267e227?w=1200',
        featuredImageAlt: 'Rhododendron forests blooming on Himalayan trail',
        contentType: 'seasonal',
        tags: ['spring', 'rhododendrons', 'nepal', 'march', 'april', 'trekking'],
        keywords: ['spring trekking nepal', 'nepal in march april', 'rhododendron trek himalaya'],
        readTimeMinutes: 5,
      },
      // Adventure Stories (cat 5)
      {
        title: 'Sunrise at Kala Patthar: A Moment That Changes Everything',
        slug: 'sunrise-kala-patthar-everest',
        excerpt: 'Our guide recounts the predawn climb to 5,545m and the life-changing sunrise that reveals the full majesty of Everest.',
        content: `# Sunrise at Kala Patthar: A Moment That Changes Everything\n\n*By Pemba Dorje, Senior Expedition Leader*\n\nAfter 28 years of guiding in the Khumbu, I\'ve stood on Kala Patthar over 200 times. And every single sunrise still takes my breath away.\n\n## The Wake-Up Call\n\n3:30 AM. Gorak Shep. -15°C.\n\nMy headlamp cuts through the frozen darkness as I knock on each client\'s door. "Good morning! Hot tea is ready." The groans are universal — no one wants to leave their sleeping bag at this hour, at this altitude.\n\nBut I know what awaits them.\n\n## The Climb\n\nKala Patthar rises 380m above Gorak Shep. In the dark, with headlamps bobbing like fireflies, we pick our way up the rocky ridge. At 5,400m, every step requires three breaths. Conversation stops. The world shrinks to the circle of your headlamp and the rhythm of your breathing.\n\nI watch my clients carefully. After 12 days of trekking, fatigue is real. But something keeps them moving — the same thing that brought them 10,000 kilometers from home.\n\n## The Moment\n\nAt 5,545m, we stop. The sky is navy blue, fading to purple on the eastern horizon. Stars are still visible overhead.\n\nThen it begins.\n\nThe first light touches the summit of Everest — a sliver of gold on the highest point on Earth. Within minutes, the entire pyramid is blazing orange against the deep blue sky. Nuptse\'s massive wall catches the light next, then Changtse, then the Khumbu Icefall.\n\nI turn to look at my clients. Every single time, I see the same thing: tears.\n\nNot from the cold. Not from exhaustion. From the overwhelming realization that they\'re standing at the top of the world, watching the sun illuminate a peak that humans have dreamed about for centuries.\n\n## Why It Matters\n\nPeople ask me why I keep doing this job after 28 years. This moment is my answer. Watching someone\'s life change in the span of a sunrise — there\'s no better feeling in the world.\n\nThe trek to get here is hard. The altitude hurts. The cold bites. But standing on Kala Patthar as Everest turns gold, every hardship dissolves into pure, overwhelming gratitude.\n\n## Practical Notes\n\n- Depart Gorak Shep between 3:30-4:00 AM\n- Allow 2-2.5 hours for the ascent\n- Dress for extreme cold: down parka, insulated gloves, balaclava\n- Bring spare camera batteries inside your jacket (cold kills batteries)\n- The descent takes about 1 hour back to Gorak Shep for breakfast`,
        categoryId: catIds[5],
        featuredImage: 'https://images.unsplash.com/photo-1504619504099-a8644da0a966?w=1200',
        featuredImageAlt: 'Golden sunrise over Mount Everest from Kala Patthar',
        contentType: 'trip_report',
        tags: ['everest', 'kala patthar', 'sunrise', 'personal story', 'guide story'],
        keywords: ['kala patthar sunrise', 'everest sunrise viewpoint', 'EBC trek highlight'],
        readTimeMinutes: 6,
      },
      {
        title: 'A Week in Upper Mustang: Journey to Nepal\'s Forbidden Kingdom',
        slug: 'week-upper-mustang-forbidden-kingdom',
        excerpt: 'Beyond the Annapurnas lies a hidden Tibetan kingdom of ochre cliffs, ancient caves, and a living culture untouched by time.',
        content: `# A Week in Upper Mustang: Nepal\'s Forbidden Kingdom\n\n*By Tashi Wangmo, Cultural Expedition Specialist*\n\nUpper Mustang was closed to foreigners until 1992. Even now, only a few thousand visitors each year make the journey. This is the story of my favourite trek.\n\n## Day 1: Jomsom to Kagbeni\n\nThe gateway to the forbidden kingdom. Kagbeni sits where the Kali Gandaki gorge — the deepest in the world — begins to narrow. Red mud houses, fluttering prayer flags, and a medieval atmosphere. The "Do Not Enter" sign for the restricted area creates a frisson of excitement.\n\n## Day 2-3: Into the Rain Shadow\n\nPast the checkpoint, the landscape transforms dramatically. Gone are the green valleys of the Annapurna region. Welcome to a high-altitude desert that looks more like Utah than Nepal. Ochre and red cliffs tower above, carved by millions of years of wind.\n\nWe stay in traditional Mustangi homes. The hospitality is humbling — butter tea appears within minutes of arrival, and the warmth of a yak-dung fire is surprisingly comforting.\n\n## Day 4: Lo Manthang\n\nThe walled capital of the ancient Kingdom of Lo. Population: about 800. The four-story royal palace still stands, though the monarchy officially ended in 2008. We explore four ancient monasteries, each containing priceless wall paintings that rival anything in Lhasa.\n\nThe King — now a "Raja" without formal power — still lives here. With the right introduction, an audience is possible.\n\n## Day 5: Sky Caves\n\nAbove Lo Manthang, thousands of caves riddle the cliffs — some natural, some hand-carved. Archaeological excavations have found 2,000-year-old manuscripts and human remains. The scale is staggering — entire cliff faces are honeycomb with ancient dwellings.\n\n## Day 6-7: The Return\n\nWe take a different route back, passing through Ghar Gompa (the oldest monastery in Mustang) and the stunning red cliff landscapes near Dhakmar.\n\n## Why Upper Mustang\n\nIn a world where overtourism threatens many destinations, Mustang remains authentic. The $500 restricted area permit keeps numbers low. The culture is living, not performed. And the landscapes are genuinely otherworldly.\n\n## Essential Details\n\n- **Permit:** $500 for first 10 days, $50/day after\n- **Best season:** March-November (rain shadow = dry even in monsoon)\n- **Difficulty:** Moderate (max altitude ~3,800m)\n- **Minimum group:** 2 people (permit requirement)\n- **Accommodation:** Traditional guesthouses and upgraded lodges`,
        categoryId: catIds[5],
        featuredImage: 'https://images.unsplash.com/photo-1571401835393-8c5f35328320?w=1200',
        featuredImageAlt: 'Red cliffs and ancient walled city of Lo Manthang, Upper Mustang',
        contentType: 'trip_report',
        tags: ['upper mustang', 'forbidden kingdom', 'nepal', 'off the beaten path', 'cultural trek'],
        keywords: ['upper mustang trek', 'lo manthang nepal', 'forbidden kingdom trek', 'mustang restricted area'],
        readTimeMinutes: 7,
      },
    ];

    let insertedBlogPosts: { id: number }[] = [];
    for (const post of blogPostData) {
      try {
        const [inserted] = await db.insert(blogPosts).values({
          ...post,
          status: 'published',
          publishedAt: new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date in last 90 days
          authorName: 'CuratedAscents Team',
          metaTitle: post.title,
          metaDescription: post.excerpt,
        }).onConflictDoUpdate({
          target: blogPosts.slug,
          set: {
            featuredImage: post.featuredImage,
            featuredImageAlt: post.featuredImageAlt,
          },
        }).returning({ id: blogPosts.id });
        insertedBlogPosts.push(inserted);
      } catch (err) {
        console.log(`Failed to upsert blog post "${post.slug}": ${err}`);
      }
    }
    console.log(`Upserted ${insertedBlogPosts.length} blog posts`);

    // Summary
    const summary = {
      success: true,
      message: 'Database seeded successfully!',
      counts: {
        suppliers: insertedSuppliers.length,
        destinations: insertedDestinations.length,
        hotels: insertedHotels.length,
        hotelRoomRates: insertedRates.length,
        transportation: insertedTransport.length,
        guides: insertedGuides.length,
        porters: insertedPorters.length,
        domesticFlights: insertedFlights.length,
        helicopterSharing: insertedHeliSharing.length,
        helicopterCharter: insertedHeliCharter.length,
        permitsFees: insertedPermits.length,
        miscellaneousServices: insertedMisc.length,
        packages: insertedPackages.length,
        blogCategories: insertedBlogCategories.length,
        blogPosts: insertedBlogPosts.length,
      },
      total: insertedSuppliers.length + insertedDestinations.length + insertedHotels.length +
             insertedRates.length + insertedTransport.length + insertedGuides.length +
             insertedPorters.length + insertedFlights.length + insertedHeliSharing.length +
             insertedHeliCharter.length + insertedPermits.length + insertedMisc.length +
             insertedPackages.length + insertedBlogCategories.length + insertedBlogPosts.length,
    };

    return NextResponse.json(summary);

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to seed database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}