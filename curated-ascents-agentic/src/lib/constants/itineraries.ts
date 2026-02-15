export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  accommodation: string;
  meals: string;
  altitude?: string;
}

export interface Itinerary {
  slug: string;
  title: string;
  country: string;
  duration: string;
  durationDays: number;
  difficulty: string;
  groupSize: string;
  bestMonths: string;
  startingPrice: number;
  heroImage: string;
  heroAlt: string;
  overview: string;
  highlights: string[];
  route: string;
  days: ItineraryDay[];
  included: string[];
  notIncluded: string[];
  chatMessage: string;
}

export const itineraries: Itinerary[] = [
  {
    slug: "14-day-nepal-luxury-expedition",
    title: "14-Day Nepal Luxury Expedition",
    country: "Nepal",
    duration: "14 Days / 13 Nights",
    durationDays: 14,
    difficulty: "Moderate",
    groupSize: "2–8 guests",
    bestMonths: "Mar–May, Sep–Nov",
    startingPrice: 4500,
    heroImage: "/uploads/media/nepal/landscape/everest-region5-4c22ff59.webp",
    heroAlt: "Everest region mountain landscape in Nepal",
    overview:
      "Journey through the heart of Nepal — from the ancient temples of Kathmandu to the jungles of Chitwan, the lakes of Pokhara, and the foothills of the Annapurna range. This expedition balances cultural immersion with adventure, all wrapped in five-star comfort.",
    highlights: [
      "Private helicopter flight over the Annapurna range",
      "Sunrise over the Himalayas from Sarangkot",
      "Tiger tracking in Chitwan National Park",
      "UNESCO World Heritage temples in Kathmandu Valley",
      "Luxury lakeside resort stay in Pokhara",
      "Traditional Newari cooking class with a local family",
    ],
    route: "Kathmandu → Chitwan → Pokhara → Annapurna Foothills → Kathmandu",
    days: [
      { day: 1, title: "Arrival in Kathmandu", description: "Private airport transfer to your heritage hotel. Afternoon orientation walk through Thamel. Welcome dinner at Krishnarpan, Dwarika's celebrated Newari fine-dining restaurant, set within the hotel's restored brick courtyards.", accommodation: "Dwarika's Hotel, Kathmandu", meals: "Dinner" },
      { day: 2, title: "Kathmandu Valley Heritage", description: "Private guided tour of Boudhanath Stupa, Pashupatinath Temple, and Patan Durbar Square. Afternoon Newari cooking class with a local family.", accommodation: "Dwarika's Hotel, Kathmandu", meals: "Breakfast, Lunch, Dinner" },
      { day: 3, title: "Bhaktapur & Nagarkot", description: "Explore the medieval city of Bhaktapur. Drive to Nagarkot for sunset views stretching from Everest to Annapurna across the entire Himalayan range.", accommodation: "Club Himalaya, Nagarkot", meals: "Breakfast, Lunch, Dinner" },
      { day: 4, title: "Fly to Chitwan", description: "Morning mountain sunrise. Scenic flight to Bharatpur, then private transfer to your luxury jungle lodge on the banks of the Rapti River, bordering Chitwan National Park.", accommodation: "Meghauli Serai (Taj), Chitwan", meals: "Breakfast, Lunch, Dinner" },
      { day: 5, title: "Chitwan Safari", description: "Dawn canoe ride along the Rapti River. Full-day jeep safari to track Bengal tigers, one-horned rhinoceros, and elephants. Evening Tharu cultural performance.", accommodation: "Meghauli Serai (Taj), Chitwan", meals: "Breakfast, Lunch, Dinner" },
      { day: 6, title: "Chitwan to Pokhara", description: "Morning birdwatching walk. Scenic overland drive through river valleys and terraced hillsides to Pokhara.", accommodation: "Tiger Mountain Pokhara Lodge", meals: "Breakfast, Lunch, Dinner" },
      { day: 7, title: "Pokhara at Leisure", description: "Sunrise excursion to Sarangkot viewpoint. Afternoon boating on Phewa Lake with Annapurna reflections. Optional paragliding over the valley.", accommodation: "Tiger Mountain Pokhara Lodge", meals: "Breakfast, Dinner" },
      { day: 8, title: "Annapurna Helicopter Flight", description: "Private helicopter flight over the Annapurna range, landing at a high-altitude viewpoint for champagne breakfast with a panoramic Himalayan backdrop.", accommodation: "Tiger Mountain Pokhara Lodge", meals: "Breakfast, Lunch, Dinner" },
      { day: 9, title: "Poon Hill Trek Day 1", description: "Drive to Nayapul and begin the trek through rhododendron forests to Ghorepani. Experienced sherpa guide and porters carry all equipment.", accommodation: "Mountain Lodge, Ghorepani", meals: "Breakfast, Lunch, Dinner" },
      { day: 10, title: "Poon Hill Sunrise & Descent", description: "Pre-dawn hike to Poon Hill (3,210m) for the iconic 360° panorama of Dhaulagiri, Annapurna, and Machhapuchhre. Trek back to Pokhara.", accommodation: "Tiger Mountain Pokhara Lodge", meals: "Breakfast, Lunch, Dinner" },
      { day: 11, title: "Pokhara Wellness Day", description: "Morning yoga session. Full Ayurvedic spa treatment. Afternoon visit to the International Mountain Museum and lakeside gallery walk.", accommodation: "Tiger Mountain Pokhara Lodge", meals: "Breakfast, Dinner" },
      { day: 12, title: "Return to Kathmandu", description: "Scenic flight back to Kathmandu. Afternoon at leisure for shopping in Thamel or exploring hidden courtyards of the old city.", accommodation: "Dwarika's Hotel, Kathmandu", meals: "Breakfast, Dinner" },
      { day: 13, title: "Kathmandu Final Exploration", description: "Visit Swayambhunath (Monkey Temple) and the Garden of Dreams. Farewell gala dinner at a historic Rana palace with traditional dance.", accommodation: "Dwarika's Hotel, Kathmandu", meals: "Breakfast, Dinner" },
      { day: 14, title: "Departure", description: "Private transfer to Tribhuvan International Airport. Complimentary departure lounge access.", accommodation: "—", meals: "Breakfast" },
    ],
    included: [
      "All domestic flights (Kathmandu–Chitwan–Pokhara–Kathmandu)",
      "Private helicopter flight over Annapurna range",
      "13 nights luxury accommodation",
      "All meals as indicated (full board on trek/safari days)",
      "Private English-speaking guide throughout",
      "All national park entrance fees and permits",
      "Private airport transfers and ground transportation",
      "Poon Hill trek with sherpa guide and porters",
      "Full-day Chitwan safari (jeep + canoe)",
      "Ayurvedic spa treatment in Pokhara",
      "Cooking class and cultural performances",
      "24/7 on-trip support",
    ],
    notIncluded: [
      "International flights to/from Kathmandu",
      "Travel insurance (required)",
      "Nepal visa fee ($50 USD on arrival)",
      "Optional paragliding in Pokhara",
      "Personal expenses and gratuities",
      "Alcoholic beverages beyond welcome/farewell dinners",
    ],
    chatMessage: "I'm interested in the 14-Day Nepal Luxury Expedition (Kathmandu, Chitwan, Pokhara, Annapurna). Can you customize this for my dates and group size?",
  },
  {
    slug: "10-day-bhutan-cultural-immersion",
    title: "10-Day Bhutan Cultural Immersion",
    country: "Bhutan",
    duration: "10 Days / 9 Nights",
    durationDays: 10,
    difficulty: "Easy to Moderate",
    groupSize: "2–6 guests",
    bestMonths: "Mar–May, Sep–Nov",
    startingPrice: 6200,
    heroImage: "/uploads/media/bhutan/landscape/bhutan-taktsang-monastery2-1d1a0917.webp",
    heroAlt: "Tiger's Nest Monastery perched on a cliff in Paro, Bhutan",
    overview:
      "Discover the world's last Himalayan kingdom — a land where Gross National Happiness matters more than GDP. From the cliffside Tiger's Nest monastery to the pristine Gangtey Valley, this journey reveals Bhutan's spiritual depth, stunning architecture, and untouched landscapes.",
    highlights: [
      "Hike to Tiger's Nest (Taktsang) Monastery",
      "Private audience with a Buddhist monk",
      "Stay at Amankora luxury lodges",
      "Punakha Dzong — Bhutan's most beautiful fortress",
      "Black-necked crane sanctuary in Gangtey Valley",
      "Traditional hot stone bath experience",
    ],
    route: "Paro → Thimphu → Punakha → Gangtey → Paro",
    days: [
      { day: 1, title: "Arrival in Paro", description: "One of the world's most dramatic landings between Himalayan peaks. Private transfer to your lodge. Afternoon walk through Paro town and visit to Rinpung Dzong.", accommodation: "Amankora Paro", meals: "Lunch, Dinner" },
      { day: 2, title: "Tiger's Nest Hike", description: "The iconic hike to Taktsang Monastery (3,120m), perched on a sheer cliff 900m above the valley floor. Stop at the hillside cafeteria for tea with valley views.", accommodation: "Amankora Paro", meals: "Breakfast, Lunch, Dinner", altitude: "3,120m" },
      { day: 3, title: "Paro to Thimphu", description: "Drive to the capital Thimphu. Visit the National Memorial Chorten, the giant Buddha Dordenma statue, and the traditional textile museum. Evening stroll along the riverside.", accommodation: "Amankora Thimphu", meals: "Breakfast, Lunch, Dinner" },
      { day: 4, title: "Thimphu Cultural Day", description: "Morning visit to Tashichho Dzong. Afternoon at the Folk Heritage Museum and paper-making workshop. Private audience with a Buddhist monk at a local monastery.", accommodation: "Amankora Thimphu", meals: "Breakfast, Lunch, Dinner" },
      { day: 5, title: "Thimphu to Punakha", description: "Cross the Dochula Pass (3,100m) with views of snow-capped peaks and 108 memorial chortens. Descend to the subtropical Punakha Valley.", accommodation: "Amankora Punakha", meals: "Breakfast, Lunch, Dinner", altitude: "3,100m pass" },
      { day: 6, title: "Punakha Valley", description: "Visit Punakha Dzong at the confluence of two rivers — Bhutan's most magnificent fortress. Afternoon riverside picnic and hike to Khamsum Yulley Namgyal Chorten.", accommodation: "Amankora Punakha", meals: "Breakfast, Lunch, Dinner" },
      { day: 7, title: "Punakha to Gangtey", description: "Drive through oak and rhododendron forests to the glacial Gangtey (Phobjikha) Valley. Visit the 17th-century Gangtey Goenpa monastery.", accommodation: "Gangtey Lodge", meals: "Breakfast, Lunch, Dinner" },
      { day: 8, title: "Gangtey Valley Exploration", description: "Nature walk through the valley — home to the rare black-necked crane (winter months). Visit local farmhouses and try traditional Bhutanese archery.", accommodation: "Gangtey Lodge", meals: "Breakfast, Lunch, Dinner" },
      { day: 9, title: "Return to Paro", description: "Scenic drive back to Paro. Afternoon traditional hot stone bath (Dotsho) — an ancient Bhutanese wellness ritual. Farewell dinner with local music and dance.", accommodation: "Amankora Paro", meals: "Breakfast, Lunch, Dinner" },
      { day: 10, title: "Departure", description: "Morning at leisure. Private transfer to Paro International Airport for departure.", accommodation: "—", meals: "Breakfast" },
    ],
    included: [
      "9 nights luxury accommodation (Amankora lodges + Gangtey Lodge)",
      "Bhutan Sustainable Development Fee (SDF)",
      "All meals (full board throughout)",
      "Private licensed Bhutanese guide",
      "All monastery and dzong entrance fees",
      "Private ground transportation",
      "Tiger's Nest hike with packed lunch",
      "Hot stone bath experience",
      "Private audience with Buddhist monk",
      "Airport transfers",
      "24/7 on-trip support",
    ],
    notIncluded: [
      "International flights to/from Paro",
      "Bhutan visa fee ($40 USD)",
      "Travel insurance (required)",
      "Personal expenses and gratuities",
      "Alcoholic beverages",
      "Optional helicopter excursions",
    ],
    chatMessage: "I'm interested in the 10-Day Bhutan Cultural Immersion (Paro, Thimphu, Punakha, Gangtey). Can you customize this for my dates and group size?",
  },
  {
    slug: "12-day-india-himalayan-explorer",
    title: "12-Day India Himalayan Explorer",
    country: "India",
    duration: "12 Days / 11 Nights",
    durationDays: 12,
    difficulty: "Moderate to Challenging",
    groupSize: "2–8 guests",
    bestMonths: "May–Jun, Sep–Oct",
    startingPrice: 3800,
    heroImage: "/uploads/media/india/landscape/udaipur-rajasthan-india-17d99ac2.webp",
    heroAlt: "Mountain landscape in the Indian Himalayas",
    overview:
      "From the spiritual banks of the Ganges to the high passes of Ladakh, this expedition traverses India's most spectacular Himalayan landscapes. Experience ashram yoga, British-era hill stations, ancient monasteries, and the otherworldly beauty of the Changthang plateau.",
    highlights: [
      "Sunrise Ganga Aarti ceremony in Rishikesh",
      "Private yoga session at a riverside ashram",
      "Khardung La — one of the world's highest motorable passes",
      "Buddhist monasteries of Ladakh (Hemis, Thiksey)",
      "Pangong Lake — the iconic turquoise high-altitude lake",
      "Colonial heritage walk in Mussoorie",
    ],
    route: "Delhi → Rishikesh → Mussoorie → Ladakh → Delhi",
    days: [
      { day: 1, title: "Arrival in Delhi", description: "Private airport transfer to your heritage hotel. Evening orientation walk through Lutyens' Delhi and welcome dinner.", accommodation: "The Imperial, New Delhi", meals: "Dinner" },
      { day: 2, title: "Delhi Heritage Tour", description: "Private guided tour of Old Delhi — Jama Masjid, Red Fort, Chandni Chowk rickshaw ride. Afternoon visit to Humayun's Tomb and Qutub Minar.", accommodation: "The Imperial, New Delhi", meals: "Breakfast, Lunch" },
      { day: 3, title: "Delhi to Rishikesh", description: "Drive to Rishikesh along the Ganges. Continue up to Ananda, a palatial hilltop estate overlooking the Ganges valley. Evening excursion to Triveni Ghat for the Ganga Aarti — a mesmerizing fire ritual on the riverbank.", accommodation: "Ananda in the Himalayas", meals: "Breakfast, Dinner" },
      { day: 4, title: "Rishikesh — Yoga & Spirituality", description: "Sunrise yoga session at a riverside ashram. Visit the Beatles Ashram. Afternoon Ayurvedic spa treatment at Ananda.", accommodation: "Ananda in the Himalayas", meals: "Breakfast, Lunch, Dinner" },
      { day: 5, title: "Rishikesh to Mussoorie", description: "Drive to the British hill station of Mussoorie. Afternoon heritage walk along the Mall Road and Gun Hill viewpoint.", accommodation: "JW Marriott Mussoorie", meals: "Breakfast, Dinner" },
      { day: 6, title: "Mussoorie & Dhanaulti", description: "Morning excursion to Dhanaulti's cedar forests. Afternoon tea at a colonial estate. Optional nature walk through Eco Park.", accommodation: "JW Marriott Mussoorie", meals: "Breakfast, Lunch" },
      { day: 7, title: "Fly to Ladakh", description: "Early transfer to Dehradun airport for connecting flight to Leh via Delhi. Arrive in Leh (3,500m) by afternoon. Rest and acclimatize. Gentle evening walk through Leh's old town.", accommodation: "The Grand Dragon, Leh", meals: "Breakfast, Dinner", altitude: "3,500m" },
      { day: 8, title: "Leh Monastery Circuit", description: "Visit Thiksey Monastery (mini Potala), Hemis Monastery (Ladakh's largest), and Shey Palace. Afternoon at leisure for acclimatization.", accommodation: "The Grand Dragon, Leh", meals: "Breakfast, Lunch", altitude: "3,500m" },
      { day: 9, title: "Khardung La & Nubra Valley", description: "Drive over Khardung La (5,359m). Descend into the stunning Nubra Valley. Ride double-humped Bactrian camels in the sand dunes of Hunder.", accommodation: "Nubra Ecolodge", meals: "Breakfast, Lunch, Dinner", altitude: "5,359m pass" },
      { day: 10, title: "Nubra to Pangong Lake", description: "Drive along the Shyok River road through dramatic gorges, past Durbuk and Tangtse, to reach Pangong Tso — a breathtaking turquoise lake stretching into Tibet. Watch the colors shift at sunset.", accommodation: "Pangong Retreat Camp", meals: "Breakfast, Lunch, Dinner", altitude: "4,350m" },
      { day: 11, title: "Return to Leh", description: "Morning photography at Pangong. Drive back to Leh via Chang La. Farewell dinner at a Ladakhi restaurant.", accommodation: "The Grand Dragon, Leh", meals: "Breakfast, Lunch, Dinner" },
      { day: 12, title: "Departure via Delhi", description: "Morning flight Leh to Delhi. Private transfer and complimentary airport lounge access for international connection.", accommodation: "—", meals: "Breakfast" },
    ],
    included: [
      "All domestic flights (Delhi–Leh and Leh–Delhi)",
      "11 nights luxury accommodation",
      "All meals as indicated",
      "Private English-speaking guide throughout",
      "Private yoga session in Rishikesh",
      "Ayurvedic spa treatment at Ananda",
      "All monument entrance fees and permits",
      "Inner Line Permits for Ladakh restricted areas",
      "Private ground transportation including 4x4 in Ladakh",
      "Bactrian camel ride in Nubra Valley",
      "Airport transfers",
      "24/7 on-trip support and oxygen cylinder in Ladakh",
    ],
    notIncluded: [
      "International flights to/from Delhi",
      "India e-Visa fee",
      "Travel insurance (required — must cover high altitude)",
      "Personal expenses and gratuities",
      "Alcoholic beverages",
      "Optional white-water rafting in Rishikesh",
    ],
    chatMessage: "I'm interested in the 12-Day India Himalayan Explorer (Delhi, Rishikesh, Mussoorie, Ladakh). Can you customize this for my dates and group size?",
  },
  {
    slug: "8-day-tibet-sacred-lands",
    title: "8-Day Tibet Sacred Lands",
    country: "Tibet",
    duration: "8 Days / 7 Nights",
    durationDays: 8,
    difficulty: "Moderate to Challenging",
    groupSize: "2–6 guests",
    bestMonths: "Apr–Jun, Sep–Oct",
    startingPrice: 5500,
    heroImage: "/uploads/media/tibet/landscape/potala-palace-lhasa-tibet-china-dd114557.webp",
    heroAlt: "Potala Palace in Lhasa, Tibet",
    overview:
      "Traverse the Roof of the World — from the golden-roofed Potala Palace in Lhasa to the north face of Everest. This journey follows the ancient route through Tibet's most sacred monasteries, dramatic passes, and high-altitude landscapes that few travellers ever witness.",
    highlights: [
      "Potala Palace — the iconic 13-story fortress of the Dalai Lamas",
      "Jokhang Temple and Barkhor kora pilgrimage circuit",
      "Gyantse Kumbum — Tibet's largest stupa",
      "Everest Base Camp (North) — 5,200m viewpoint",
      "Yamdrok Lake — sacred turquoise lake at 4,441m",
      "Tashilhunpo Monastery in Shigatse",
    ],
    route: "Lhasa → Gyantse → Shigatse → Everest North Base Camp → Lhasa",
    days: [
      { day: 1, title: "Arrival in Lhasa", description: "Fly into Lhasa Gonggar Airport (3,650m). Private transfer with supplemental oxygen available. Rest and acclimatize — gentle evening walk along Lhasa's river promenade.", accommodation: "St. Regis Lhasa", meals: "Dinner", altitude: "3,650m" },
      { day: 2, title: "Lhasa — Potala Palace & Jokhang", description: "Morning visit to the magnificent Potala Palace, winter residence of the Dalai Lamas. Afternoon exploration of Jokhang Temple and the bustling Barkhor kora circuit.", accommodation: "St. Regis Lhasa", meals: "Breakfast, Lunch, Dinner", altitude: "3,650m" },
      { day: 3, title: "Lhasa Monasteries", description: "Visit Sera Monastery to witness the famous debating monks. Afternoon at Drepung Monastery, once the world's largest monastery housing over 10,000 monks. Evening Tibetan opera performance.", accommodation: "St. Regis Lhasa", meals: "Breakfast, Lunch, Dinner", altitude: "3,650m" },
      { day: 4, title: "Lhasa to Gyantse via Yamdrok Lake", description: "Drive over Kamba La pass (4,700m) to the sacred Yamdrok Lake — its turquoise waters stretching endlessly below. Continue to the historic town of Gyantse.", accommodation: "Gyantse Hotel", meals: "Breakfast, Lunch, Dinner", altitude: "4,700m pass → 3,977m" },
      { day: 5, title: "Gyantse to Shigatse", description: "Morning visit to Gyantse Kumbum — Tibet's most spectacular stupa, with six floors housing 77 chapels adorned with ancient murals. Drive to Shigatse and explore Tashilhunpo Monastery.", accommodation: "Shigatse Hotel", meals: "Breakfast, Lunch, Dinner", altitude: "3,840m" },
      { day: 6, title: "Shigatse to Everest Base Camp", description: "Epic drive across the Tibetan Plateau, crossing multiple passes above 5,000m. Arrive at Rongbuk Monastery — the highest in the world — with Everest's north face towering above.", accommodation: "Everest Base Camp Guesthouse", meals: "Breakfast, Lunch, Dinner", altitude: "5,200m" },
      { day: 7, title: "Everest & Return to Shigatse", description: "Sunrise over Everest's north face (weather permitting). Time at Everest Base Camp North (5,200m). Return drive to Shigatse. Farewell dinner with traditional Tibetan dishes.", accommodation: "Shigatse Hotel", meals: "Breakfast, Lunch, Dinner", altitude: "5,200m → 3,840m" },
      { day: 8, title: "Return to Lhasa & Departure", description: "Drive back to Lhasa (or fly from Shigatse Peace Airport if available). Transfer to Lhasa Gonggar Airport for departure.", accommodation: "—", meals: "Breakfast", altitude: "3,650m" },
    ],
    included: [
      "Tibet Travel Permit and all restricted-area permits",
      "7 nights accommodation",
      "All meals (full board throughout)",
      "Private licensed Tibetan guide",
      "Private 4x4 vehicle with experienced driver",
      "All monastery and monument entrance fees",
      "Everest Base Camp National Park fee",
      "Supplemental oxygen and first-aid kit",
      "Airport transfers in Lhasa",
      "24/7 on-trip support",
    ],
    notIncluded: [
      "International flights to/from Lhasa (via Chengdu or Kathmandu)",
      "Chinese visa and Tibet Travel Permit processing fee",
      "Travel insurance (required — must cover high altitude and evacuation)",
      "Personal expenses and gratuities",
      "Alcoholic beverages",
      "Optional Namtso Lake extension",
    ],
    chatMessage: "I'm interested in the 8-Day Tibet Sacred Lands expedition (Lhasa, Gyantse, Shigatse, Everest North). Can you customize this for my dates and group size?",
  },
];

export function getItineraryBySlug(slug: string): Itinerary | undefined {
  return itineraries.find((i) => i.slug === slug);
}
