export interface LuxuryItinerary {
  slug: string;
  name: string;
  packageType: string;
  country: string;
  region: string;
  durationDays: number;
  durationNights: number;
  difficulty: string;
  maxAltitude: number;
  groupSizeMin: number;
  groupSizeMax: number;
  bestMonths: string;
  itinerarySummary: string;
  highlights: string[];
  route: string;
  days: { day: number; title: string; description: string; accommodation: string; meals: string; altitude?: string }[];
  costPrice: number;
  sellPrice: number;
  inclusions: string[];
  exclusions: string[];
}

export const nepalTreks: LuxuryItinerary[] = [
  // Trek 1: Everest Base Camp Luxury Trek
  {
    slug: "everest-base-camp-luxury-trek",
    name: "Everest Base Camp Luxury Trek",
    packageType: "trek",
    country: "Nepal",
    region: "Everest (Khumbu)",
    durationDays: 16,
    durationNights: 15,
    difficulty: "Challenging",
    maxAltitude: 5644,
    groupSizeMin: 2,
    groupSizeMax: 8,
    bestMonths: "March-May, September-November",
    itinerarySummary: "Experience the ultimate luxury Everest Base Camp trek staying in the finest lodges in the Khumbu region, including Yeti Mountain Home properties and Everest Summit Lodges. This 16-day journey takes you through Sherpa villages, ancient monasteries, and dramatic Himalayan landscapes with the option of a thrilling helicopter return from Gorak Shep to Lukla.",
    highlights: [
      "Stay at premium Yeti Mountain Home lodges with ensuite bathrooms and heating",
      "Visit Tengboche Monastery with panoramic Everest and Ama Dablam views",
      "Sunrise from Kala Patthar (5,644m) with 360-degree Himalayan panorama",
      "Stand at Everest Base Camp (5,364m) beside the Khumbu Icefall",
      "Optional helicopter return flight from Gorak Shep to Lukla",
      "Private experienced Sherpa guide and dedicated porter team"
    ],
    route: "Kathmandu → Lukla → Phakding → Namche Bazaar → Tengboche → Dingboche → Lobuche → Gorak Shep → Everest Base Camp → Kala Patthar → Helicopter/trek return → Lukla → Kathmandu",
    days: [
      {
        day: 1,
        title: "Arrival in Kathmandu",
        description: "Arrive at Tribhuvan International Airport and transfer to your luxury hotel in the Thamel district. Meet your expedition leader for a detailed trek briefing over welcome dinner. Gear check and final preparations.",
        accommodation: "Dwarika's Hotel or Hotel Yak & Yeti, Kathmandu",
        meals: "Welcome dinner",
        altitude: "1,400m"
      },
      {
        day: 2,
        title: "Fly to Lukla, Trek to Phakding",
        description: "Early morning scenic flight to Tenzing-Hillary Airport at Lukla (2,860m), one of the world's most dramatic landings. Meet your full trekking crew and begin the trek descending through pine forests along the Dudh Kosi river valley to the village of Phakding.",
        accommodation: "Yeti Mountain Home, Phakding",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,610m"
      },
      {
        day: 3,
        title: "Trek to Namche Bazaar",
        description: "Cross suspension bridges over the Dudh Kosi river, passing through Jorsale and the Sagarmatha National Park entrance. The steep ascent to Namche Bazaar rewards you with the first glimpse of Everest. Arrive at the bustling Sherpa capital nestled in a horseshoe-shaped valley.",
        accommodation: "Yeti Mountain Home, Namche Bazaar",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,440m"
      },
      {
        day: 4,
        title: "Acclimatization Day in Namche Bazaar",
        description: "Essential acclimatization day with a hike to the Everest View Hotel at Syangboche (3,880m) for stunning views of Everest, Lhotse, and Ama Dablam. Visit the Sherpa Culture Museum and local market. Afternoon at leisure to explore Namche's bakeries and shops.",
        accommodation: "Yeti Mountain Home, Namche Bazaar",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,440m (excursion to 3,880m)"
      },
      {
        day: 5,
        title: "Trek to Tengboche",
        description: "Descend to the Dudh Kosi and climb through rhododendron and birch forests to Tengboche, home to the largest monastery in the Khumbu. Afternoon visit to Tengboche Monastery with its ornate interior and sacred Buddhist artifacts. Spectacular sunset views of Ama Dablam, Everest, and Nuptse.",
        accommodation: "Yeti Mountain Home, Tengboche",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,870m"
      },
      {
        day: 6,
        title: "Trek to Dingboche",
        description: "Descend through forest to Deboche, cross the Imja Khola, and follow the valley through Pangboche village — the oldest Sherpa settlement in the Khumbu. Continue ascending through scrubby terrain to the wide valley of Dingboche, surrounded by towering peaks including Island Peak and Lhotse.",
        accommodation: "Everest Summit Lodge, Dingboche",
        meals: "Breakfast, lunch, dinner",
        altitude: "4,410m"
      },
      {
        day: 7,
        title: "Acclimatization Day in Dingboche",
        description: "Another vital acclimatization day. Hike to Nagarjun Hill (5,100m) for breathtaking views of Makalu (8,485m), Lhotse, Island Peak, and the Imja Valley. Return to Dingboche for a relaxing afternoon. Your guide will monitor everyone's health and oxygen levels.",
        accommodation: "Everest Summit Lodge, Dingboche",
        meals: "Breakfast, lunch, dinner",
        altitude: "4,410m (excursion to 5,100m)"
      },
      {
        day: 8,
        title: "Trek to Lobuche",
        description: "Trek alongside the lateral moraine of the Khumbu Glacier through Dughla and past the moving Chukpo Lhari memorial cairns dedicated to fallen climbers. The trail ascends steadily to Lobuche, a small settlement with dramatic views of Nuptse's enormous south face.",
        accommodation: "Everest Summit Lodge, Lobuche",
        meals: "Breakfast, lunch, dinner",
        altitude: "4,940m"
      },
      {
        day: 9,
        title: "Trek to Gorak Shep, Visit Everest Base Camp",
        description: "Early departure across the Khumbu Glacier moraine to Gorak Shep, the last settlement before Base Camp. After lunch, trek to Everest Base Camp (5,364m), walking among expedition tents and the towering Khumbu Icefall during climbing season. A profound and emotional achievement.",
        accommodation: "Best available lodge, Gorak Shep",
        meals: "Breakfast, lunch, dinner",
        altitude: "5,164m (EBC at 5,364m)"
      },
      {
        day: 10,
        title: "Kala Patthar Sunrise, Descend to Pheriche",
        description: "Pre-dawn ascent of Kala Patthar (5,644m) for the most iconic sunrise panorama in the Himalayas — Everest, Lhotse, Nuptse, Changtse, and Pumori glowing in golden light. Descend back to Gorak Shep for breakfast, then continue down the valley to Pheriche for a well-earned rest.",
        accommodation: "Himalayan Rescue Association Lodge, Pheriche",
        meals: "Breakfast, lunch, dinner",
        altitude: "4,270m (morning at 5,644m)"
      },
      {
        day: 11,
        title: "Trek to Tengboche",
        description: "Retrace your steps through the valley, descending to Pangboche and climbing back to Tengboche. With altitude pressure lifted, enjoy the scenery with fresh eyes. Attend the evening prayer ceremony at Tengboche Monastery if timing permits.",
        accommodation: "Yeti Mountain Home, Tengboche",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,870m"
      },
      {
        day: 12,
        title: "Trek to Namche Bazaar",
        description: "Descend through rhododendron forests alive with color in spring season. Cross the Dudh Kosi and ascend back to Namche Bazaar. Celebrate your achievement with a farewell dinner and optional visit to one of Namche's renowned bakeries.",
        accommodation: "Yeti Mountain Home, Namche Bazaar",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,440m"
      },
      {
        day: 13,
        title: "Trek to Lukla",
        description: "Final day of trekking, descending through Jorsale and Phakding to Lukla. Pass through Sagarmatha National Park gate and along the Dudh Kosi valley. Arrival in Lukla for a celebration dinner with your trekking crew.",
        accommodation: "Best available lodge, Lukla",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,860m"
      },
      {
        day: 14,
        title: "Fly Lukla to Kathmandu (or Helicopter Option)",
        description: "Morning flight from Lukla to Kathmandu (or upgrade to a private helicopter for stunning aerial views of the Himalayan range). Transfer to your luxury hotel. Afternoon free for shopping, spa, or sightseeing in Kathmandu.",
        accommodation: "Dwarika's Hotel or Hotel Yak & Yeti, Kathmandu",
        meals: "Breakfast",
        altitude: "1,400m"
      },
      {
        day: 15,
        title: "Kathmandu Heritage Tour",
        description: "Private guided tour of Kathmandu's UNESCO World Heritage Sites including Boudhanath Stupa, Pashupatinath Temple, Swayambhunath (Monkey Temple), and Kathmandu Durbar Square. Farewell dinner at a traditional Nepali restaurant with cultural performance.",
        accommodation: "Dwarika's Hotel or Hotel Yak & Yeti, Kathmandu",
        meals: "Breakfast, farewell dinner",
        altitude: "1,400m"
      },
      {
        day: 16,
        title: "Departure",
        description: "Private airport transfer for your onward journey. Departure times are flexible. Your expedition leader will assist with any last-minute arrangements or souvenir shopping.",
        accommodation: "N/A",
        meals: "Breakfast",
        altitude: "1,400m"
      }
    ],
    costPrice: 2800,
    sellPrice: 4200,
    inclusions: [
      "All accommodation in luxury lodges (Yeti Mountain Home, Everest Summit Lodges) and 5-star hotel in Kathmandu",
      "All meals during the trek (breakfast, lunch, dinner) with tea/coffee",
      "Private licensed English-speaking Sherpa trekking guide",
      "Porter service (1 porter per 2 trekkers, max 15kg each)",
      "Kathmandu–Lukla–Kathmandu domestic flights",
      "Sagarmatha National Park entry permit and TIMS card",
      "Kathmandu heritage sightseeing tour with private vehicle",
      "Airport transfers in private vehicle",
      "First aid medical kit and oximeter",
      "Farewell dinner in Kathmandu"
    ],
    exclusions: [
      "International airfare to/from Kathmandu",
      "Nepal visa fee (USD 30 for 15 days, USD 50 for 30 days)",
      "Travel and high-altitude rescue insurance (mandatory)",
      "Alcoholic and cold beverages",
      "Personal trekking gear and equipment",
      "Tips for guide, porters, and hotel staff (customary)"
    ]
  },

  // Trek 2: Annapurna Circuit Luxury
  {
    slug: "annapurna-circuit-luxury",
    name: "Annapurna Circuit Luxury Trek",
    packageType: "trek",
    country: "Nepal",
    region: "Annapurna",
    durationDays: 18,
    durationNights: 17,
    difficulty: "Challenging",
    maxAltitude: 5416,
    groupSizeMin: 2,
    groupSizeMax: 8,
    bestMonths: "March-May, October-November",
    itinerarySummary: "The legendary Annapurna Circuit circumnavigates the entire Annapurna massif, crossing the dramatic Thorong La Pass at 5,416m. This luxury version features the best available lodges, private transfers where roads permit, and a scenic flight from Jomsom to Pokhara to conclude this epic journey through diverse landscapes from subtropical forests to high-altitude desert.",
    highlights: [
      "Cross Thorong La Pass (5,416m), one of the world's highest trekking passes",
      "Experience dramatic landscape transitions from rice paddies to arid moonscape",
      "Visit the sacred Muktinath Temple (3,800m) revered by Hindus and Buddhists",
      "Explore the medieval walled town of Manang with its Tibetan Buddhist culture",
      "Scenic flight from Jomsom along the deepest gorge on Earth (Kali Gandaki)",
      "Stay in premium lodges with hot showers and mountain-view dining"
    ],
    route: "Kathmandu → Besisahar → Chame → Manang → Thorong La Pass → Muktinath → Jomsom → Pokhara → Kathmandu",
    days: [
      {
        day: 1,
        title: "Arrival in Kathmandu",
        description: "Arrive at Tribhuvan International Airport and transfer to your luxury hotel. Afternoon trek briefing, gear inspection, and welcome dinner with your trekking team.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Welcome dinner",
        altitude: "1,400m"
      },
      {
        day: 2,
        title: "Drive to Besisahar, Trek to Bhulbhule",
        description: "Private vehicle transfer from Kathmandu to Besisahar (6-7 hours) through the scenic Prithvi Highway along the Trisuli and Marsyangdi rivers. Short trek from Besisahar to Bhulbhule through rice terraces and subtropical forest.",
        accommodation: "Best available lodge, Bhulbhule",
        meals: "Breakfast, lunch, dinner",
        altitude: "840m"
      },
      {
        day: 3,
        title: "Trek to Jagat",
        description: "Follow the Marsyangdi river upstream through Ngadi and Bahundanda. The trail passes through lush terraced fields, waterfalls, and small Gurung and Magar villages. Gradual ascent as the valley narrows.",
        accommodation: "Best available lodge, Jagat",
        meals: "Breakfast, lunch, dinner",
        altitude: "1,300m"
      },
      {
        day: 4,
        title: "Trek to Dharapani",
        description: "Continue through Chamje and Tal — a flat, dramatic valley enclosed by vertical cliffs with a beautiful waterfall. The vegetation shifts as you gain altitude, and Tibetan Buddhist culture becomes more prominent. Pass through Dharapani, the gateway to the Manaslu region.",
        accommodation: "Best available lodge, Dharapani",
        meals: "Breakfast, lunch, dinner",
        altitude: "1,960m"
      },
      {
        day: 5,
        title: "Trek to Chame",
        description: "Trek through dense forest and past spectacular waterfalls to Bagarchhap with its characteristic flat-roofed Tibetan-style houses. Continue to Chame, the administrative headquarters of Manang District, where hot springs await near the river.",
        accommodation: "Best available lodge, Chame",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,710m"
      },
      {
        day: 6,
        title: "Trek to Upper Pisang",
        description: "Walk through an incredible deep forest and emerge to see the stunning face of Annapurna II (7,937m). Cross the Marsyangdi and ascend to Upper Pisang, perched on a hillside with one of the best mountain views on the circuit — Annapurna II, Pisang Peak, and the Manang Valley stretching ahead.",
        accommodation: "Best available lodge, Upper Pisang",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,310m"
      },
      {
        day: 7,
        title: "Trek to Manang",
        description: "Take the scenic high route through Ghyaru and Ngawal for the best Annapurna views. Pass ancient mani walls and prayer flags. Descend to Braga with its famous 500-year-old gompa clinging to the cliff face. Continue to Manang, a prosperous trading town at the head of the valley.",
        accommodation: "Hotel Manang or Yak Hotel, Manang",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,540m"
      },
      {
        day: 8,
        title: "Acclimatization Day in Manang",
        description: "Essential rest day for altitude acclimatization. Hike to Gangapurna Lake (3,580m) beneath the hanging glaciers of Gangapurna (7,455m) or climb to the Praken Gompa viewpoint (3,960m). Visit the Himalayan Rescue Association clinic for an altitude sickness lecture. Explore Manang's unique Tibetan Buddhist culture.",
        accommodation: "Hotel Manang or Yak Hotel, Manang",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,540m (excursion to 3,960m)"
      },
      {
        day: 9,
        title: "Trek to Yak Kharka",
        description: "Leave Manang and trek through Tenki and past the village of Gunsang. The landscape becomes increasingly arid and barren as you approach the rain shadow of the Annapurna range. The trail climbs gently but steadily to Yak Kharka (yak pasture).",
        accommodation: "Best available lodge, Yak Kharka",
        meals: "Breakfast, lunch, dinner",
        altitude: "4,018m"
      },
      {
        day: 10,
        title: "Trek to Thorong Phedi",
        description: "Short but important trek to Thorong Phedi (literally 'foot of the pass'), your base for the crossing. The trail crosses the Marsyangdi headwaters and ascends through rocky terrain. Arrive early for rest and early dinner — you'll depart before dawn tomorrow.",
        accommodation: "Best available lodge, Thorong Phedi",
        meals: "Breakfast, lunch, dinner",
        altitude: "4,450m"
      },
      {
        day: 11,
        title: "Cross Thorong La Pass, Descend to Muktinath",
        description: "Depart at 4am for the summit push. The climb is steady and relentless through snow and scree. Reach the prayer-flag-adorned summit of Thorong La (5,416m) for extraordinary views of the Dhaulagiri and Annapurna ranges. Long, steep descent on the western side to the sacred pilgrimage town of Muktinath.",
        accommodation: "Hotel Bob Marley or North Pole Lodge, Muktinath",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,800m (pass at 5,416m)"
      },
      {
        day: 12,
        title: "Explore Muktinath, Trek to Kagbeni",
        description: "Morning visit to the sacred Muktinath Temple complex, a pilgrimage site for both Hindus and Buddhists with its 108 water spouts and eternal flame fueled by natural gas. Descend through the arid Mustang landscape to the medieval fortress town of Kagbeni, where Upper Mustang begins.",
        accommodation: "Red House Lodge, Kagbeni",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,800m"
      },
      {
        day: 13,
        title: "Trek to Jomsom",
        description: "Easy morning walk along the Kali Gandaki riverbed — the world's deepest gorge between Annapurna I and Dhaulagiri I. Strong afternoon winds funnel through the gorge, so depart early. Arrive in Jomsom, the administrative center of Mustang District with its airstrip and apple orchards.",
        accommodation: "Om's Home Hotel, Jomsom",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,720m"
      },
      {
        day: 14,
        title: "Fly to Pokhara",
        description: "Early morning flight from Jomsom to Pokhara (20 minutes) following the Kali Gandaki gorge with Dhaulagiri and Annapurna soaring on either side — one of the most scenic short flights in the world. Transfer to your lakeside luxury resort. Afternoon at leisure by Phewa Lake.",
        accommodation: "Tiger Mountain Pokhara Lodge or Temple Tree Resort, Pokhara",
        meals: "Breakfast",
        altitude: "820m"
      },
      {
        day: 15,
        title: "Pokhara Leisure Day",
        description: "Full day to relax and recover in beautiful Pokhara. Optional activities include a boat ride on Phewa Lake, visit the World Peace Pagoda, explore the International Mountain Museum, or indulge in a spa treatment. Sunset views of the Annapurna range reflecting in the lake.",
        accommodation: "Tiger Mountain Pokhara Lodge or Temple Tree Resort, Pokhara",
        meals: "Breakfast",
        altitude: "820m"
      },
      {
        day: 16,
        title: "Fly or Drive to Kathmandu",
        description: "Morning scenic flight from Pokhara to Kathmandu (25 minutes) or private vehicle transfer (6-7 hours). Afternoon free for shopping or sightseeing. Optional visit to Patan Durbar Square.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Breakfast",
        altitude: "1,400m"
      },
      {
        day: 17,
        title: "Kathmandu Heritage Tour",
        description: "Private guided heritage tour visiting Boudhanath Stupa, Pashupatinath Temple, Swayambhunath, and Bhaktapur Durbar Square. Farewell dinner at a traditional Newari restaurant with cultural performance.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Breakfast, farewell dinner",
        altitude: "1,400m"
      },
      {
        day: 18,
        title: "Departure",
        description: "Private airport transfer for your international flight. Trip concludes.",
        accommodation: "N/A",
        meals: "Breakfast",
        altitude: "1,400m"
      }
    ],
    costPrice: 2500,
    sellPrice: 3750,
    inclusions: [
      "All accommodation in best available lodges on the circuit and 5-star hotels in Kathmandu and Pokhara",
      "All meals during the trek (breakfast, lunch, dinner)",
      "Private licensed English-speaking trekking guide",
      "Porter service (1 porter per 2 trekkers, max 15kg each)",
      "Kathmandu–Besisahar private vehicle transfer",
      "Jomsom–Pokhara and Pokhara–Kathmandu domestic flights",
      "Annapurna Conservation Area Permit (ACAP) and TIMS card",
      "Kathmandu heritage sightseeing tour with entrance fees",
      "Airport transfers in private vehicle",
      "First aid medical kit and oximeter"
    ],
    exclusions: [
      "International airfare to/from Kathmandu",
      "Nepal visa fee",
      "Travel and high-altitude rescue insurance (mandatory)",
      "Alcoholic and cold beverages",
      "Personal trekking gear and equipment",
      "Tips for guide, porters, and hotel staff"
    ]
  },

  // Trek 3: Annapurna Base Camp Luxury
  {
    slug: "annapurna-base-camp-luxury",
    name: "Annapurna Base Camp Luxury Trek",
    packageType: "trek",
    country: "Nepal",
    region: "Annapurna",
    durationDays: 12,
    durationNights: 11,
    difficulty: "Moderate",
    maxAltitude: 4130,
    groupSizeMin: 2,
    groupSizeMax: 8,
    bestMonths: "March-May, October-November",
    itinerarySummary: "Trek into the heart of the Annapurna Sanctuary, a natural amphitheatre surrounded by towering 7,000m and 8,000m peaks. This luxury version uses the finest lodges on the route, takes the scenic Ghandruk approach through Gurung villages, and includes stays at Pokhara's premier lakeside resorts for a perfect blend of adventure and comfort.",
    highlights: [
      "Stand in the Annapurna Sanctuary surrounded by a 360-degree amphitheatre of peaks",
      "Sunrise at Annapurna Base Camp with views of Annapurna I, Machapuchare, and Hiunchuli",
      "Trek through beautiful Gurung villages and terraced hillsides",
      "Walk through pristine rhododendron and bamboo forests",
      "Relax at Tiger Mountain Pokhara Lodge with panoramic Himalayan views",
      "Private Gurung guide sharing local culture and traditions"
    ],
    route: "Kathmandu → Pokhara → Nayapul → Ghandruk → Chhomrong → Bamboo → Deurali → Annapurna Base Camp → return via Jhinu Danda (hot springs) → Pokhara → Kathmandu",
    days: [
      {
        day: 1,
        title: "Fly to Pokhara",
        description: "Morning scenic flight from Kathmandu to Pokhara with views of the Himalayan chain. Transfer to your lakeside luxury resort. Afternoon briefing with your trekking guide. Explore Pokhara Lakeside at leisure.",
        accommodation: "Tiger Mountain Pokhara Lodge, Pokhara",
        meals: "Breakfast",
        altitude: "820m"
      },
      {
        day: 2,
        title: "Drive to Nayapul, Trek to Ghandruk",
        description: "Drive to Nayapul (1.5 hours) and begin your trek through terraced rice paddies and lush forests. Ascend stone steps through small settlements to the charming Gurung village of Ghandruk, with its slate-roofed houses and spectacular views of Annapurna South and Machapuchare.",
        accommodation: "Gurung Cottage or Best available lodge, Ghandruk",
        meals: "Breakfast, lunch, dinner",
        altitude: "1,940m"
      },
      {
        day: 3,
        title: "Trek to Chhomrong",
        description: "Descend to the Kimrong Khola and climb steeply to Chhomrong, the last permanent settlement before the Annapurna Sanctuary. This large Gurung village sits on a ridge with commanding views of Annapurna South, Hiunchuli, and the deep Modi Khola valley. Visit the ACAP museum.",
        accommodation: "Best available lodge, Chhomrong",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,170m"
      },
      {
        day: 4,
        title: "Trek to Bamboo",
        description: "Descend the famous stone steps of Chhomrong to the Chhomrong Khola and cross the river. Enter the Modi Khola gorge through dense bamboo and rhododendron forest. The narrowing valley leads to the appropriately named settlement of Bamboo, deep in the lush forest.",
        accommodation: "Best available lodge, Bamboo",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,310m"
      },
      {
        day: 5,
        title: "Trek to Deurali",
        description: "Climb steeply through dense bamboo and rhododendron forest. Patches of snow may appear in spring. Pass through Himalaya Hotel and continue ascending to Hinko Cave, a large overhanging rock that shelters trekkers. Continue to Deurali, emerging from the tree line with increasingly dramatic views.",
        accommodation: "Best available lodge, Deurali",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,230m"
      },
      {
        day: 6,
        title: "Trek to Annapurna Base Camp",
        description: "Enter the spectacular Annapurna Sanctuary through the natural gateway between Hiunchuli and Machapuchare. Stop at Machapuchare Base Camp (3,700m) for lunch with the iconic fishtail peak towering above. Continue across the glacial moraine to Annapurna Base Camp, surrounded by a complete amphitheatre of giants: Annapurna I (8,091m), Annapurna South, Hiunchuli, Machapuchare, Gangapurna, and Annapurna III.",
        accommodation: "Best available lodge, Annapurna Base Camp",
        meals: "Breakfast, lunch, dinner",
        altitude: "4,130m"
      },
      {
        day: 7,
        title: "Sunrise at ABC, Descend to Bamboo",
        description: "Wake early for a breathtaking sunrise as the first golden light strikes the summit of Annapurna I and cascades across the sanctuary walls. After breakfast, begin the descent, retracing your steps through Deurali and the Modi Khola gorge to Bamboo.",
        accommodation: "Best available lodge, Bamboo",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,310m"
      },
      {
        day: 8,
        title: "Trek to Jhinu Danda",
        description: "Ascend back to Chhomrong and take the alternative trail descending to Jhinu Danda. Reward your tired muscles with a relaxing soak in the natural hot springs beside the Modi Khola river — one of the most memorable experiences on the trek.",
        accommodation: "Best available lodge, Jhinu Danda",
        meals: "Breakfast, lunch, dinner",
        altitude: "1,780m"
      },
      {
        day: 9,
        title: "Trek to Nayapul, Drive to Pokhara",
        description: "Final trek through terraced farmland and villages to Nayapul. Private vehicle transfer back to Pokhara. Celebrate with a lakeside lunch. Afternoon free for boating on Phewa Lake, shopping, or spa.",
        accommodation: "Tiger Mountain Pokhara Lodge, Pokhara",
        meals: "Breakfast, lunch",
        altitude: "820m"
      },
      {
        day: 10,
        title: "Pokhara Leisure Day",
        description: "Full day at leisure in Pokhara. Optional sunrise trip to Sarangkot viewpoint for panoramic Annapurna views. Visit the International Mountain Museum, Davis Falls, and Gupteshwor Cave. Farewell dinner at a lakeside restaurant.",
        accommodation: "Tiger Mountain Pokhara Lodge, Pokhara",
        meals: "Breakfast, farewell dinner",
        altitude: "820m"
      },
      {
        day: 11,
        title: "Fly to Kathmandu",
        description: "Morning flight to Kathmandu. Transfer to your hotel. Afternoon free for shopping or sightseeing. Optional visit to Boudhanath Stupa.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Breakfast",
        altitude: "1,400m"
      },
      {
        day: 12,
        title: "Departure",
        description: "Private airport transfer for your onward journey.",
        accommodation: "N/A",
        meals: "Breakfast",
        altitude: "1,400m"
      }
    ],
    costPrice: 1800,
    sellPrice: 2700,
    inclusions: [
      "All accommodation in best available lodges and luxury hotels in Pokhara and Kathmandu",
      "All meals during the trek (breakfast, lunch, dinner)",
      "Private licensed English-speaking trekking guide",
      "Porter service (1 porter per 2 trekkers)",
      "Kathmandu–Pokhara–Kathmandu domestic flights",
      "Nayapul transfers by private vehicle",
      "Annapurna Conservation Area Permit (ACAP) and TIMS card",
      "Airport transfers in private vehicle",
      "First aid medical kit"
    ],
    exclusions: [
      "International airfare to/from Kathmandu",
      "Nepal visa fee",
      "Travel insurance (mandatory)",
      "Alcoholic and cold beverages",
      "Personal trekking gear",
      "Tips for guide, porters, and hotel staff"
    ]
  },

  // Trek 4: Langtang Valley Luxury Trek
  {
    slug: "langtang-valley-luxury-trek",
    name: "Langtang Valley Luxury Trek",
    packageType: "trek",
    country: "Nepal",
    region: "Langtang",
    durationDays: 12,
    durationNights: 11,
    difficulty: "Moderate",
    maxAltitude: 4984,
    groupSizeMin: 2,
    groupSizeMax: 8,
    bestMonths: "March-May, October-November",
    itinerarySummary: "Explore the stunningly beautiful Langtang Valley, often called the 'Valley of Glaciers,' just north of Kathmandu near the Tibetan border. This luxury trek features rebuilt lodges following the 2015 earthquake reconstruction, a climb to Kyanjin Ri (4,984m) for exceptional panoramas, and visits to ancient Tamang Buddhist communities preserving Tibetan heritage.",
    highlights: [
      "Summit Kyanjin Ri (4,984m) for 360-degree views including Langtang Lirung (7,227m)",
      "Visit the world's highest cheese factory at Kyanjin Gompa",
      "Experience Tamang Buddhist culture in rebuilt mountain villages",
      "Trek through pristine forests of oak, rhododendron, and bamboo",
      "Witness the resilience of communities rebuilt after the 2015 earthquake",
      "Closest Himalayan trek to Kathmandu — no domestic flights needed"
    ],
    route: "Kathmandu → Syabrubesi → Lama Hotel → Langtang Village → Kyanjin Gompa → Kyanjin Ri → return → Kathmandu",
    days: [
      {
        day: 1,
        title: "Arrival in Kathmandu",
        description: "Arrive at Tribhuvan International Airport. Transfer to your luxury hotel. Evening trek briefing and welcome dinner.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Welcome dinner",
        altitude: "1,400m"
      },
      {
        day: 2,
        title: "Drive to Syabrubesi",
        description: "Private vehicle transfer to Syabrubesi (7-8 hours), the trek's starting point. Drive through the beautiful Trisuli Valley, past Dhunche (the Rasuwa district capital), with increasingly dramatic mountain scenery. Arrive at Syabrubesi, a bustling village near the Chinese/Tibetan border.",
        accommodation: "Best available lodge, Syabrubesi",
        meals: "Breakfast, lunch, dinner",
        altitude: "1,550m"
      },
      {
        day: 3,
        title: "Trek to Lama Hotel",
        description: "Cross the Langtang Khola and follow the trail through dense subtropical forest along the river. Ascend through oak, maple, and rhododendron forests teeming with bird life. Pass through Bamboo and Rimche to reach Lama Hotel (actually a collection of lodges in a forest clearing, not a hotel).",
        accommodation: "Best available lodge, Lama Hotel",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,380m"
      },
      {
        day: 4,
        title: "Trek to Langtang Village",
        description: "Continue ascending through beautiful forests, emerging above the tree line into yak pastures. Pass Ghora Tabela, a former Tibetan resettlement camp and army post. The valley opens dramatically as you approach Langtang Village, rebuilt after the devastating 2015 landslide. The new village sits slightly higher with stunning views of Langtang Lirung.",
        accommodation: "Best available lodge, Langtang Village",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,430m"
      },
      {
        day: 5,
        title: "Trek to Kyanjin Gompa",
        description: "Walk through open yak pastures with spectacular views of Langtang Lirung (7,227m) and surrounding glaciated peaks. Pass small settlements and mani walls to reach Kyanjin Gompa, the last village in the valley. Visit the 700-year-old Buddhist monastery and the small cheese factory established with Swiss support in the 1950s.",
        accommodation: "Best available lodge, Kyanjin Gompa",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,870m"
      },
      {
        day: 6,
        title: "Climb Kyanjin Ri, Explore Langtang Glacier",
        description: "Pre-dawn departure to summit Kyanjin Ri (4,984m) for spectacular sunrise views of Langtang Lirung, Dorje Lakpa, Gangchenpo, and into Tibet. Return for a late breakfast. Afternoon optional hike to the Langtang Glacier or Tserko Ri base. Explore the valley and interact with the local Tamang community.",
        accommodation: "Best available lodge, Kyanjin Gompa",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,870m (excursion to 4,984m)"
      },
      {
        day: 7,
        title: "Trek to Lama Hotel",
        description: "Retrace your steps down the valley through Langtang Village and the forested trail. The descent offers a different perspective, with mountain views now ahead of you. Overnight at Lama Hotel in the forest.",
        accommodation: "Best available lodge, Lama Hotel",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,380m"
      },
      {
        day: 8,
        title: "Trek to Thulo Syabru",
        description: "Instead of returning directly to Syabrubesi, take the trail up to Thulo Syabru, a charming hillside Tamang village with panoramic views. The village wraps around a ridge with excellent views of Langtang Lirung, Ganesh Himal, and Manaslu in the distance.",
        accommodation: "Best available lodge, Thulo Syabru",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,210m"
      },
      {
        day: 9,
        title: "Trek to Syabrubesi",
        description: "Descend through terraced fields and forest to Syabrubesi. Afternoon at leisure to explore the village, visit local shops, and soak in the nearby hot springs at Tatopani.",
        accommodation: "Best available lodge, Syabrubesi",
        meals: "Breakfast, lunch, dinner",
        altitude: "1,550m"
      },
      {
        day: 10,
        title: "Drive to Kathmandu",
        description: "Private vehicle return to Kathmandu (7-8 hours). Scenic drive through the Trisuli Valley. Arrive in the evening and transfer to your luxury hotel.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Breakfast, lunch",
        altitude: "1,400m"
      },
      {
        day: 11,
        title: "Kathmandu Heritage Tour",
        description: "Private guided tour of Kathmandu Valley highlights: Boudhanath Stupa, Pashupatinath Temple, and Bhaktapur Durbar Square. Farewell dinner at a traditional Nepali restaurant.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Breakfast, farewell dinner",
        altitude: "1,400m"
      },
      {
        day: 12,
        title: "Departure",
        description: "Private airport transfer for your onward flight.",
        accommodation: "N/A",
        meals: "Breakfast",
        altitude: "1,400m"
      }
    ],
    costPrice: 1600,
    sellPrice: 2400,
    inclusions: [
      "All accommodation in best available lodges and 5-star hotel in Kathmandu",
      "All meals during the trek (breakfast, lunch, dinner)",
      "Private licensed English-speaking trekking guide",
      "Porter service (1 porter per 2 trekkers)",
      "Kathmandu–Syabrubesi–Kathmandu private vehicle transfers",
      "Langtang National Park entry permit and TIMS card",
      "Kathmandu heritage sightseeing tour with entrance fees",
      "Airport transfers in private vehicle",
      "First aid medical kit and oximeter"
    ],
    exclusions: [
      "International airfare to/from Kathmandu",
      "Nepal visa fee",
      "Travel insurance (mandatory)",
      "Alcoholic and cold beverages",
      "Personal trekking gear",
      "Tips for guide, porters, and hotel staff"
    ]
  },

  // Trek 5: Manaslu Circuit Luxury
  {
    slug: "manaslu-circuit-luxury",
    name: "Manaslu Circuit Luxury Trek",
    packageType: "trek",
    country: "Nepal",
    region: "Manaslu",
    durationDays: 18,
    durationNights: 17,
    difficulty: "Challenging",
    maxAltitude: 5106,
    groupSizeMin: 2,
    groupSizeMax: 8,
    bestMonths: "March-May, September-November",
    itinerarySummary: "The Manaslu Circuit is Nepal's most rewarding restricted-area trek, circling the world's eighth highest peak through remote Himalayan landscapes. Cross the dramatic Larkya La (5,106m) and discover Tibetan Buddhist villages untouched by mass tourism. This luxury version ensures the finest available lodges, experienced high-altitude guides, and meticulous acclimatization for this challenging remote wilderness journey.",
    highlights: [
      "Cross the spectacular Larkya La Pass (5,106m) with views of Manaslu (8,163m)",
      "Trek through the restricted Nubri and Tsum Valley cultural zones",
      "Visit the ancient Tibetan Buddhist village of Samagaon beneath Manaslu",
      "Experience genuine remote Himalayan culture untouched by mass tourism",
      "Walk through diverse ecosystems from subtropical to high-alpine",
      "Only 5-7% of Nepal's trekkers visit this route — true wilderness solitude"
    ],
    route: "Kathmandu → Soti Khola → Machha Khola → Jagat → Deng → Namrung → Samagaon → Samdo → Dharamsala → Larkya La Pass → Bimthang → Dharapani → Kathmandu",
    days: [
      {
        day: 1,
        title: "Arrival in Kathmandu",
        description: "Arrive and transfer to your luxury hotel. Trek briefing, permit documentation, and welcome dinner.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Welcome dinner",
        altitude: "1,400m"
      },
      {
        day: 2,
        title: "Drive to Soti Khola",
        description: "Private vehicle transfer via Arughat to Soti Khola (8-9 hours). The drive follows the Prithvi Highway before turning north through increasingly remote terrain along the Budhi Gandaki river. Arrive at the trek starting point.",
        accommodation: "Best available lodge, Soti Khola",
        meals: "Breakfast, lunch, dinner",
        altitude: "730m"
      },
      {
        day: 3,
        title: "Trek to Machha Khola",
        description: "Trek along the Budhi Gandaki river through dense subtropical forest. Cross suspension bridges and traverse rocky terrain. The trail rises and falls through hot, humid terrain past waterfalls and small Gurung villages to the riverside camp at Machha Khola.",
        accommodation: "Best available lodge, Machha Khola",
        meals: "Breakfast, lunch, dinner",
        altitude: "930m"
      },
      {
        day: 4,
        title: "Trek to Jagat",
        description: "Continue through the narrowing Budhi Gandaki gorge. The trail is dramatic, cut into vertical rock faces above the rushing river. Cross several suspension bridges and pass through Tatopani village with its hot springs. Reach Jagat, a historic trading village that once served as a customs post for the Tibet salt trade.",
        accommodation: "Best available lodge, Jagat",
        meals: "Breakfast, lunch, dinner",
        altitude: "1,410m"
      },
      {
        day: 5,
        title: "Trek to Deng",
        description: "Enter the Manaslu Conservation Area and the restricted zone. The valley begins to widen, and Tibetan Buddhist culture becomes evident with mani walls, chortens, and prayer flags. Pass through Philim and Ekle Bhatti to reach the small settlement of Deng.",
        accommodation: "Best available lodge, Deng",
        meals: "Breakfast, lunch, dinner",
        altitude: "1,860m"
      },
      {
        day: 6,
        title: "Trek to Namrung",
        description: "The trail enters a spectacular gorge and crosses to the west bank of the Budhi Gandaki. Pass through Rana and Bihi, noting the transition to flat-roofed Tibetan architecture. Climb steadily to Namrung, a charming village with its large chorten and the first clear views of Manaslu.",
        accommodation: "Best available lodge, Namrung",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,660m"
      },
      {
        day: 7,
        title: "Trek to Samagaon",
        description: "Trek through forests of pine and rhododendron to Lihi and Sho. The landscape opens dramatically as you enter the Nubri Valley. Pass ancient monasteries and mani walls to reach Samagaon (Ro), a large Tibetan-influenced village at the foot of Manaslu with its massive glacier. Visit the Pungyen Gompa.",
        accommodation: "Best available lodge, Samagaon",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,530m"
      },
      {
        day: 8,
        title: "Acclimatization Day in Samagaon",
        description: "Essential acclimatization day. Hike to Birendra Lake (3,450m) at the foot of the Manaslu Glacier for spectacular close-up views of Manaslu (8,163m). Explore Samagaon's Tibetan Buddhist monastery and village life. Alternatively, hike up toward Manaslu Base Camp for even grander views.",
        accommodation: "Best available lodge, Samagaon",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,530m"
      },
      {
        day: 9,
        title: "Trek to Samdo",
        description: "Continue up the valley through yak pastures and across the Budhi Gandaki. Cross moraines and climb to Samdo, the last village before Larkya La. This Tibetan trading village near the Tibet border has a unique character — yak herders still trade across the Larkya Glacier.",
        accommodation: "Best available lodge, Samdo",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,860m"
      },
      {
        day: 10,
        title: "Acclimatization Day in Samdo",
        description: "Another essential rest day. Options include hiking north toward the Tibet border and Gya La (5,200m) for extraordinary views of Himalchuli and Ngadi Chuli, or exploring the valley above Samdo. Your guide will monitor health indicators carefully before tomorrow's push to high camp.",
        accommodation: "Best available lodge, Samdo",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,860m"
      },
      {
        day: 11,
        title: "Trek to Dharamsala (Larkya BC)",
        description: "Short but crucial trek to the Dharamsala (also called Larkya Base Camp), a stone shelter and basic lodge at the foot of the pass. The trail crosses moraines and boulder fields beside the Larkya Glacier. Arrive early, rest, and prepare for the pre-dawn crossing. Early dinner and early sleep.",
        accommodation: "Best available lodge/shelter, Dharamsala",
        meals: "Breakfast, lunch, dinner",
        altitude: "4,460m"
      },
      {
        day: 12,
        title: "Cross Larkya La, Descend to Bimthang",
        description: "Depart at 3-4am for the long crossing. Ascend the moraine and glacier approach in darkness, reaching the prayer-flag-draped summit of Larkya La (5,106m) at sunrise for extraordinary views of Manaslu, Himalchuli, Annapurna II, and Cheo Himal. The descent is steep and long down to the beautiful alpine meadow at Bimthang with its stunning views of Manaslu's west face.",
        accommodation: "Best available lodge, Bimthang",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,590m (pass at 5,106m)"
      },
      {
        day: 13,
        title: "Trek to Tilije",
        description: "Descend through rhododendron forest and past the settlement of Gho. The trail drops steadily through increasingly lush vegetation as the Dudh Khola valley widens. Rejoin the Annapurna Circuit trail briefly before heading south to Tilije.",
        accommodation: "Best available lodge, Tilije",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,300m"
      },
      {
        day: 14,
        title: "Trek to Dharapani",
        description: "Continue descending through sub-tropical forest to Dharapani on the Marsyangdi river. The lush vegetation and warm air feel luxurious after the high passes. This marks the official end of the Manaslu restricted zone.",
        accommodation: "Best available lodge, Dharapani",
        meals: "Breakfast, lunch, dinner",
        altitude: "1,960m"
      },
      {
        day: 15,
        title: "Drive to Besisahar, Continue to Kathmandu",
        description: "Jeep transfer from Dharapani to Besisahar (4-5 hours on rough road), then private vehicle to Kathmandu (5-6 hours on sealed highway). Long but scenic travel day arriving in Kathmandu by evening.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Breakfast, lunch",
        altitude: "1,400m"
      },
      {
        day: 16,
        title: "Kathmandu Leisure Day",
        description: "Well-deserved rest day in Kathmandu. Optional spa treatment, shopping in Thamel, or visit to Patan Durbar Square. Relax at your luxury hotel.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Breakfast",
        altitude: "1,400m"
      },
      {
        day: 17,
        title: "Kathmandu Heritage Tour",
        description: "Private guided tour of Kathmandu's UNESCO sites. Farewell dinner with traditional Nepali cuisine and cultural performance.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Breakfast, farewell dinner",
        altitude: "1,400m"
      },
      {
        day: 18,
        title: "Departure",
        description: "Private airport transfer for your onward flight.",
        accommodation: "N/A",
        meals: "Breakfast",
        altitude: "1,400m"
      }
    ],
    costPrice: 3200,
    sellPrice: 4800,
    inclusions: [
      "All accommodation in best available lodges and 5-star hotel in Kathmandu",
      "All meals during the trek (breakfast, lunch, dinner)",
      "Private licensed English-speaking trekking guide experienced in Manaslu region",
      "Porter service (1 porter per 2 trekkers)",
      "Manaslu Restricted Area Permit and Manaslu Conservation Area Permit",
      "TIMS card",
      "All ground transportation (Kathmandu–Soti Khola, Dharapani–Kathmandu)",
      "Kathmandu heritage sightseeing tour with entrance fees",
      "Airport transfers in private vehicle",
      "First aid medical kit, oximeter, and emergency satellite phone"
    ],
    exclusions: [
      "International airfare to/from Kathmandu",
      "Nepal visa fee",
      "Travel and high-altitude rescue insurance (mandatory)",
      "Alcoholic and cold beverages",
      "Personal trekking gear and equipment",
      "Tips for guide, porters, and hotel staff"
    ]
  },

  // Trek 6: Upper Mustang Luxury Trek
  {
    slug: "upper-mustang-luxury-trek",
    name: "Upper Mustang Luxury Trek",
    packageType: "trek",
    country: "Nepal",
    region: "Mustang",
    durationDays: 14,
    durationNights: 13,
    difficulty: "Moderate",
    maxAltitude: 3840,
    groupSizeMin: 2,
    groupSizeMax: 8,
    bestMonths: "March-November (rain shadow area, good even during monsoon)",
    itinerarySummary: "Journey to the forbidden kingdom of Lo Manthang in Upper Mustang, a Tibetan cultural enclave that was closed to outsiders until 1992. This luxury trek traverses an otherworldly landscape of wind-carved cliffs, ancient cave dwellings, and medieval walled cities. The restricted-area permit ensures limited visitors, preserving the authentic Tibetan Buddhist heritage of this remarkable region.",
    highlights: [
      "Explore the medieval walled capital of Lo Manthang with its four monasteries and royal palace",
      "Discover 1,000-year-old cave paintings and sky caves carved into cliff faces",
      "Trek through dramatic red, ochre, and grey eroded canyons and rock formations",
      "Experience living Tibetan Buddhist culture in an ancient Himalayan kingdom",
      "Visit Choser's stunning cave monastery complex",
      "Enjoy the rain shadow climate — ideal trekking even during monsoon season"
    ],
    route: "Kathmandu → Pokhara → Jomsom → Kagbeni → Chele → Syangboche → Ghami → Tsarang → Lo Manthang → return → Jomsom → Pokhara → Kathmandu",
    days: [
      {
        day: 1,
        title: "Fly to Pokhara, Fly to Jomsom",
        description: "Early morning flight from Kathmandu to Pokhara, connect to the dramatic mountain flight to Jomsom following the Kali Gandaki gorge. Arrive in Jomsom and stroll through the windy town. Afternoon exploration of the apple orchards and Thakali culture.",
        accommodation: "Om's Home Hotel, Jomsom",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,720m"
      },
      {
        day: 2,
        title: "Trek to Kagbeni",
        description: "Easy walk along the Kali Gandaki riverbed to the medieval village of Kagbeni — the gateway to Upper Mustang. Explore the ancient Kag Chode Thupten Samphel Ling monastery and wander the narrow alleys of this atmospheric village. Upper Mustang restricted area checkpoint ahead.",
        accommodation: "Red House Lodge, Kagbeni",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,800m"
      },
      {
        day: 3,
        title: "Trek to Chele",
        description: "Enter the restricted zone. Follow the Kali Gandaki north through increasingly dramatic terrain. Cross the river multiple times on a trail carved into colorful stratified rock. Climb to Chele, the first village with distinctly Tibetan character — flat-roofed whitewashed houses with firewood stacked on rooftops.",
        accommodation: "Best available lodge, Chele",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,050m"
      },
      {
        day: 4,
        title: "Trek to Syangboche",
        description: "Cross the Chele La pass and traverse through extraordinary erosion landscapes — deep red and ochre canyons, wind-sculpted pinnacles, and multicolored rock strata. Pass through Samar, a green oasis village, and continue over another pass to the small settlement of Syangboche.",
        accommodation: "Best available lodge, Syangboche",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,475m"
      },
      {
        day: 5,
        title: "Trek to Ghami",
        description: "Cross the Yamda La (3,850m) with views of Nilgiri, Tilicho, and Damodar Himal. Descend through a spectacular canyon to Ghami, the largest village in Upper Mustang outside Lo Manthang. Visit the impressive mani wall — one of the longest in Nepal — decorated with thousands of carved prayer stones.",
        accommodation: "Best available lodge, Ghami",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,520m"
      },
      {
        day: 6,
        title: "Trek to Tsarang",
        description: "Cross another pass and descend to Tsarang (Charang), the second-largest settlement in Upper Mustang. Visit the impressive Tsarang Dzong (fortress) and the ancient monastery with its remarkable collection of thangka paintings, Buddhist manuscripts, and statues dating back 500 years.",
        accommodation: "Best available lodge, Tsarang",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,560m"
      },
      {
        day: 7,
        title: "Trek to Lo Manthang",
        description: "Cross the Lo La pass (3,840m) for the first magical view of Lo Manthang — the walled capital of the ancient Kingdom of Lo spread across a plateau against a backdrop of snow-capped peaks. Enter through the historic gate into a medieval world of narrow lanes, whitewashed houses, and four ancient monasteries.",
        accommodation: "Best available lodge, Lo Manthang",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,810m"
      },
      {
        day: 8,
        title: "Explore Lo Manthang",
        description: "Full day exploring the capital. Visit Jampa Lhakhang (temple of the future Buddha) with its stunning 15th-century mandalas, Thubchen Gompa with its enormous prayer hall, Choedey monastery, and the Royal Palace. Meet local artisans and monks. Watch sunset over the plateau from the city walls.",
        accommodation: "Best available lodge, Lo Manthang",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,810m"
      },
      {
        day: 9,
        title: "Excursion to Choser and Garphu Cave",
        description: "Day trip to Choser, visiting the dramatic Jhong Cave (Luri Gompa) and the sky caves — ancient dwellings and monasteries carved into vertical cliff faces. Explore the Garphu cave monastery and Nyiphu cave with its remarkable Buddhist murals. Return to Lo Manthang.",
        accommodation: "Best available lodge, Lo Manthang",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,810m"
      },
      {
        day: 10,
        title: "Trek to Ghami",
        description: "Begin the return journey, retracing your steps south. The return trek offers different perspectives and lighting on the dramatic canyon landscapes. Overnight in Ghami.",
        accommodation: "Best available lodge, Ghami",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,520m"
      },
      {
        day: 11,
        title: "Trek to Chele",
        description: "Continue south through Samar and over the passes back to Chele. The descent provides new angles on the eroded cliff formations and colorful rock layers.",
        accommodation: "Best available lodge, Chele",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,050m"
      },
      {
        day: 12,
        title: "Trek to Jomsom",
        description: "Descend via Kagbeni and follow the Kali Gandaki south to Jomsom. Celebrate the completion of your Upper Mustang exploration with a farewell dinner.",
        accommodation: "Om's Home Hotel, Jomsom",
        meals: "Breakfast, lunch, farewell dinner",
        altitude: "2,720m"
      },
      {
        day: 13,
        title: "Fly to Pokhara, Fly to Kathmandu",
        description: "Morning flight from Jomsom to Pokhara, connect to Kathmandu flight. Transfer to your luxury hotel. Afternoon at leisure for shopping or spa.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Breakfast",
        altitude: "1,400m"
      },
      {
        day: 14,
        title: "Departure",
        description: "Private airport transfer for your international departure.",
        accommodation: "N/A",
        meals: "Breakfast",
        altitude: "1,400m"
      }
    ],
    costPrice: 3500,
    sellPrice: 5250,
    inclusions: [
      "All accommodation in best available lodges and 5-star hotel in Kathmandu",
      "All meals during the trek (breakfast, lunch, dinner)",
      "Private licensed English-speaking trekking guide with Upper Mustang expertise",
      "Porter/pack animal service for luggage",
      "Upper Mustang Restricted Area Permit (USD 500 per person included)",
      "Annapurna Conservation Area Permit (ACAP) and TIMS card",
      "Kathmandu–Pokhara–Jomsom and return domestic flights",
      "Airport transfers in private vehicle",
      "Monastery entrance fees in Lo Manthang",
      "First aid medical kit"
    ],
    exclusions: [
      "International airfare to/from Kathmandu",
      "Nepal visa fee",
      "Travel insurance (mandatory)",
      "Alcoholic beverages",
      "Personal gear and equipment",
      "Tips for guide, porters, and hotel staff"
    ]
  },

  // Trek 7: Everest Three Passes Luxury
  {
    slug: "everest-three-passes-luxury",
    name: "Everest Three Passes Luxury Trek",
    packageType: "trek",
    country: "Nepal",
    region: "Everest (Khumbu)",
    durationDays: 20,
    durationNights: 19,
    difficulty: "Extreme",
    maxAltitude: 5545,
    groupSizeMin: 2,
    groupSizeMax: 6,
    bestMonths: "April-May, October-November",
    itinerarySummary: "The ultimate Everest region challenge — crossing all three high passes of the Khumbu (Kongma La 5,535m, Cho La 5,420m, and Renjo La 5,345m) while visiting Everest Base Camp and the stunning Gokyo Lakes. This luxury expedition uses the finest Khumbu lodges, provides experienced high-altitude Sherpa guides, and includes strategic acclimatization days for this demanding but supremely rewarding itinerary.",
    highlights: [
      "Cross three legendary high passes: Kongma La, Cho La, and Renjo La",
      "Visit both Everest Base Camp and the turquoise Gokyo Lakes",
      "Summit Gokyo Ri (5,357m) for arguably the finest viewpoint in the Khumbu",
      "Sunrise from Kala Patthar (5,644m) with Everest glowing gold",
      "Stay in premium Yeti Mountain Home and Everest Summit lodges",
      "Experience the most complete exploration of the Everest region possible on foot"
    ],
    route: "Kathmandu → Lukla → Namche → Tengboche → Dingboche → Chhukung → Kongma La → Lobuche → EBC → Kala Patthar → Cho La → Gokyo → Gokyo Ri → Renjo La → Thame → Namche → Lukla → Kathmandu",
    days: [
      {
        day: 1,
        title: "Arrival in Kathmandu",
        description: "Arrive at Tribhuvan International Airport and transfer to your luxury hotel. Detailed expedition briefing covering all three passes, gear check, and welcome dinner.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Welcome dinner",
        altitude: "1,400m"
      },
      {
        day: 2,
        title: "Fly to Lukla, Trek to Phakding",
        description: "Scenic flight to Lukla and begin trekking down the Dudh Kosi valley to Phakding through pine forests and Sherpa settlements.",
        accommodation: "Yeti Mountain Home, Phakding",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,610m"
      },
      {
        day: 3,
        title: "Trek to Namche Bazaar",
        description: "Cross suspension bridges and climb steeply through Sagarmatha National Park to Namche Bazaar, the Sherpa capital. First views of Everest on the ascent.",
        accommodation: "Yeti Mountain Home, Namche Bazaar",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,440m"
      },
      {
        day: 4,
        title: "Acclimatization Day in Namche",
        description: "Hike to Everest View Hotel at Syangboche (3,880m). Visit the Sherpa Museum and local market. Essential acclimatization for the extreme itinerary ahead.",
        accommodation: "Yeti Mountain Home, Namche Bazaar",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,440m (excursion to 3,880m)"
      },
      {
        day: 5,
        title: "Trek to Tengboche",
        description: "Classic trail through rhododendron forest to Tengboche Monastery with its commanding views of Ama Dablam, Everest, and Nuptse. Attend afternoon prayer ceremony.",
        accommodation: "Yeti Mountain Home, Tengboche",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,870m"
      },
      {
        day: 6,
        title: "Trek to Dingboche",
        description: "Descend to Deboche, cross the Imja Khola, and ascend through Pangboche to the wide valley of Dingboche beneath the towering walls of Lhotse and Island Peak.",
        accommodation: "Everest Summit Lodge, Dingboche",
        meals: "Breakfast, lunch, dinner",
        altitude: "4,410m"
      },
      {
        day: 7,
        title: "Acclimatization Day — Hike to Chhukung",
        description: "Acclimatization hike to Chhukung (4,730m) in the Imja Valley. Spectacular views of Island Peak, Lhotse South Face, and Baruntse. This also serves as reconnaissance for tomorrow's Kongma La approach.",
        accommodation: "Everest Summit Lodge, Dingboche",
        meals: "Breakfast, lunch, dinner",
        altitude: "4,410m (excursion to 4,730m)"
      },
      {
        day: 8,
        title: "Trek to Chhukung",
        description: "Short trek to Chhukung. Afternoon exploration of the Imja Glacier viewpoint and preparation for the first pass crossing tomorrow.",
        accommodation: "Best available lodge, Chhukung",
        meals: "Breakfast, lunch, dinner",
        altitude: "4,730m"
      },
      {
        day: 9,
        title: "Cross Kongma La (5,535m), Descend to Lobuche",
        description: "Pre-dawn start for the first and highest pass. Climb steeply over rocky and glacial terrain to Kongma La (5,535m) with extraordinary views of Makalu, Everest, Lhotse, Nuptse, Cho Oyu, and the Khumbu Glacier. Challenging descent over boulder fields to Lobuche.",
        accommodation: "Everest Summit Lodge, Lobuche",
        meals: "Breakfast, lunch, dinner",
        altitude: "4,940m (pass at 5,535m)"
      },
      {
        day: 10,
        title: "Trek to Gorak Shep, Visit EBC",
        description: "Trek across Khumbu Glacier moraine to Gorak Shep. After lunch, continue to Everest Base Camp (5,364m) at the foot of the Khumbu Icefall. Return to Gorak Shep.",
        accommodation: "Best available lodge, Gorak Shep",
        meals: "Breakfast, lunch, dinner",
        altitude: "5,164m (EBC at 5,364m)"
      },
      {
        day: 11,
        title: "Kala Patthar Sunrise, Trek to Dzongla",
        description: "Pre-dawn climb of Kala Patthar (5,644m) — the highest point of the trek — for a legendary sunrise panorama over Everest. Descend to Gorak Shep for breakfast, then trek south and west to Dzongla, the base for the Cho La crossing.",
        accommodation: "Best available lodge, Dzongla",
        meals: "Breakfast, lunch, dinner",
        altitude: "4,830m (morning at 5,644m)"
      },
      {
        day: 12,
        title: "Cross Cho La (5,420m), Descend to Thagnak",
        description: "Early departure for the second pass. Ascend rocky terrain to the base of Cho La, then navigate a steep glacier section (crampons may be needed). Summit Cho La (5,420m) with views of Cholatse and Taboche. Descend steeply to the Gokyo Valley and the small settlement of Thagnak.",
        accommodation: "Best available lodge, Thagnak",
        meals: "Breakfast, lunch, dinner",
        altitude: "4,750m (pass at 5,420m)"
      },
      {
        day: 13,
        title: "Trek to Gokyo, Climb Gokyo Ri",
        description: "Short morning trek along the Ngozumpa Glacier (Nepal's longest) to the stunning turquoise Gokyo Lakes. After lunch at Gokyo, climb Gokyo Ri (5,357m) for what many consider the finest panorama in the Khumbu — Everest, Lhotse, Makalu, Cho Oyu, and the five Gokyo Lakes spread below.",
        accommodation: "Best available lodge, Gokyo",
        meals: "Breakfast, lunch, dinner",
        altitude: "4,790m (Gokyo Ri at 5,357m)"
      },
      {
        day: 14,
        title: "Rest Day in Gokyo",
        description: "Well-earned rest day at the Gokyo Lakes. Optional hike to the Fifth Lake (Ngozumpa Tsho) or along the Ngozumpa Glacier. Prepare for the final pass crossing.",
        accommodation: "Best available lodge, Gokyo",
        meals: "Breakfast, lunch, dinner",
        altitude: "4,790m"
      },
      {
        day: 15,
        title: "Cross Renjo La (5,345m), Descend to Lungden",
        description: "Early start for the third and final pass. Climb steadily from Gokyo to Renjo La (5,345m) with spectacular views back over the Gokyo Lakes and Ngozumpa Glacier, and forward to the Bhote Kosi valley leading to Tibet. Descend steeply to Lungden.",
        accommodation: "Best available lodge, Lungden",
        meals: "Breakfast, lunch, dinner",
        altitude: "4,380m (pass at 5,345m)"
      },
      {
        day: 16,
        title: "Trek to Thame",
        description: "Descend through the beautiful Bhote Kosi valley to the historic Sherpa trading village of Thame. Visit the famous Thame monastery, birthplace of Tenzing Norgay Sherpa. The village sits in a dramatic cirque beneath Teng Kangpoche and Kwangde peaks.",
        accommodation: "Best available lodge, Thame",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,820m"
      },
      {
        day: 17,
        title: "Trek to Namche Bazaar",
        description: "Follow the ancient trade route from Thame to Namche Bazaar through terraced fields and forest. Celebrate the completion of all three passes with a special dinner in Namche.",
        accommodation: "Yeti Mountain Home, Namche Bazaar",
        meals: "Breakfast, lunch, celebration dinner",
        altitude: "3,440m"
      },
      {
        day: 18,
        title: "Trek to Lukla",
        description: "Final trekking day, descending through Jorsale and Phakding to Lukla. Farewell dinner with your Sherpa team.",
        accommodation: "Best available lodge, Lukla",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,860m"
      },
      {
        day: 19,
        title: "Fly to Kathmandu",
        description: "Morning flight from Lukla to Kathmandu. Transfer to your luxury hotel. Afternoon free for shopping, spa, or sightseeing.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Breakfast",
        altitude: "1,400m"
      },
      {
        day: 20,
        title: "Departure",
        description: "Private airport transfer for your onward journey.",
        accommodation: "N/A",
        meals: "Breakfast",
        altitude: "1,400m"
      }
    ],
    costPrice: 3800,
    sellPrice: 5700,
    inclusions: [
      "All accommodation in premium lodges (Yeti Mountain Home, Everest Summit Lodges) and 5-star hotel in Kathmandu",
      "All meals during the trek (breakfast, lunch, dinner)",
      "Two private licensed high-altitude Sherpa guides (safety requirement for three passes)",
      "Porter service (1 porter per 2 trekkers)",
      "Kathmandu–Lukla–Kathmandu domestic flights",
      "Sagarmatha National Park entry permit and TIMS card",
      "Crampon rental for Cho La glacier crossing if needed",
      "Airport transfers in private vehicle",
      "First aid medical kit, oximeter, and emergency satellite communication",
      "Celebration dinner in Namche Bazaar"
    ],
    exclusions: [
      "International airfare to/from Kathmandu",
      "Nepal visa fee",
      "Travel and high-altitude rescue/helicopter insurance (mandatory)",
      "Alcoholic and cold beverages",
      "Personal trekking gear and equipment",
      "Tips for guides, porters, and hotel staff"
    ]
  },

  // Trek 8: Gokyo Lakes Luxury Trek
  {
    slug: "gokyo-lakes-luxury-trek",
    name: "Gokyo Lakes Luxury Trek",
    packageType: "trek",
    country: "Nepal",
    region: "Everest (Khumbu)",
    durationDays: 14,
    durationNights: 13,
    difficulty: "Challenging",
    maxAltitude: 5357,
    groupSizeMin: 2,
    groupSizeMax: 8,
    bestMonths: "March-May, October-November",
    itinerarySummary: "Discover the jewel-toned turquoise Gokyo Lakes and summit Gokyo Ri for what many experienced trekkers consider the finest panoramic viewpoint in the Everest region. This quieter alternative to the classic EBC trek follows the Dudh Kosi valley past Nepal's longest glacier, staying in premium Khumbu lodges. The reward is a panorama encompassing four 8,000m peaks and five sacred glacial lakes.",
    highlights: [
      "Summit Gokyo Ri (5,357m) for views of Everest, Lhotse, Makalu, and Cho Oyu",
      "Explore the five sacred turquoise Gokyo Lakes",
      "Trek alongside the massive Ngozumpa Glacier — Nepal's longest",
      "Stay in premium Yeti Mountain Home lodges with ensuite facilities",
      "Fewer trekkers than the EBC route for a more tranquil experience",
      "Optional side trip to the Fifth Lake for ultimate solitude"
    ],
    route: "Kathmandu → Lukla → Phakding → Namche Bazaar → Dole → Machhermo → Gokyo → Gokyo Ri → return → Namche → Lukla → Kathmandu",
    days: [
      {
        day: 1,
        title: "Arrival in Kathmandu",
        description: "Arrive and transfer to luxury hotel. Trek briefing and welcome dinner.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Welcome dinner",
        altitude: "1,400m"
      },
      {
        day: 2,
        title: "Fly to Lukla, Trek to Phakding",
        description: "Morning flight to Lukla. Begin trek descending along the Dudh Kosi to Phakding through pine forests and Sherpa villages.",
        accommodation: "Yeti Mountain Home, Phakding",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,610m"
      },
      {
        day: 3,
        title: "Trek to Namche Bazaar",
        description: "Cross suspension bridges and climb through Sagarmatha National Park to Namche Bazaar. First glimpse of Everest on the ascent.",
        accommodation: "Yeti Mountain Home, Namche Bazaar",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,440m"
      },
      {
        day: 4,
        title: "Acclimatization Day in Namche",
        description: "Acclimatization hike to Khumjung village (3,790m) and the Hillary School. Visit Syangboche airstrip and the Everest View Hotel. Explore Namche's cafes and market.",
        accommodation: "Yeti Mountain Home, Namche Bazaar",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,440m (excursion to 3,880m)"
      },
      {
        day: 5,
        title: "Trek to Dole",
        description: "Leave the main EBC trail and head northwest up the Dudh Kosi valley toward Gokyo. Trek through Mong La pass with spectacular views of Ama Dablam, Kangtega, and Thamserku. Descend to the Phortse Tenga river crossing, then climb to the small settlement of Dole in a beautiful rhododendron forest.",
        accommodation: "Best available lodge, Dole",
        meals: "Breakfast, lunch, dinner",
        altitude: "4,110m"
      },
      {
        day: 6,
        title: "Trek to Machhermo",
        description: "Trek through Lhabarma and Luza — tiny summer settlements amid yak pastures. The views of Cho Oyu (8,188m) and Kangtega become increasingly dramatic. Arrive at Machhermo, a small cluster of lodges where the Himalayan Rescue Association sometimes has a medical post.",
        accommodation: "Best available lodge, Machhermo",
        meals: "Breakfast, lunch, dinner",
        altitude: "4,470m"
      },
      {
        day: 7,
        title: "Trek to Gokyo (First and Second Lakes)",
        description: "Climb the terminal moraine of the Ngozumpa Glacier and be rewarded with the first sight of the stunning turquoise First Lake (Longponga Tsho). Continue past the Second Lake (Taboche Tsho) to Gokyo village on the shore of the Third Lake (Dudh Pokhari), the largest and most sacred of the five lakes.",
        accommodation: "Best available lodge, Gokyo",
        meals: "Breakfast, lunch, dinner",
        altitude: "4,790m"
      },
      {
        day: 8,
        title: "Climb Gokyo Ri (5,357m)",
        description: "Pre-dawn ascent of Gokyo Ri for a sunrise panorama that rivals any in the Himalayas. From the summit, see four 8,000m peaks — Everest (8,849m), Lhotse (8,516m), Makalu (8,485m), and Cho Oyu (8,188m) — plus the five turquoise Gokyo Lakes and the massive Ngozumpa Glacier. Descend for a late breakfast. Afternoon at leisure by the lakes.",
        accommodation: "Best available lodge, Gokyo",
        meals: "Breakfast, lunch, dinner",
        altitude: "4,790m (Gokyo Ri at 5,357m)"
      },
      {
        day: 9,
        title: "Explore Fourth and Fifth Lakes",
        description: "Day hike to the Fourth Lake (Thonak Tsho) and the remote Fifth Lake (Ngozumpa Tsho) along the glacier. The Fifth Lake at 5,000m is set in a dramatic amphitheatre with Cho Oyu looming above. Return to Gokyo for your final night by the lakes.",
        accommodation: "Best available lodge, Gokyo",
        meals: "Breakfast, lunch, dinner",
        altitude: "4,790m (excursion to 5,000m)"
      },
      {
        day: 10,
        title: "Trek to Dole",
        description: "Retrace the trail south, descending past the lakes and the glacier moraine through Machhermo to Dole. The descent feels easy with altitude pressure relieved.",
        accommodation: "Best available lodge, Dole",
        meals: "Breakfast, lunch, dinner",
        altitude: "4,110m"
      },
      {
        day: 11,
        title: "Trek to Namche Bazaar",
        description: "Continue descending through Phortse Tenga and over Mong La to Namche Bazaar. Celebration dinner at one of Namche's popular bakeries.",
        accommodation: "Yeti Mountain Home, Namche Bazaar",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,440m"
      },
      {
        day: 12,
        title: "Trek to Lukla",
        description: "Final trek descending through Jorsale and Phakding to Lukla. Farewell dinner with your Sherpa crew.",
        accommodation: "Best available lodge, Lukla",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,860m"
      },
      {
        day: 13,
        title: "Fly to Kathmandu",
        description: "Morning flight from Lukla to Kathmandu. Transfer to luxury hotel. Afternoon free for sightseeing or shopping.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Breakfast",
        altitude: "1,400m"
      },
      {
        day: 14,
        title: "Departure",
        description: "Private airport transfer for your onward journey.",
        accommodation: "N/A",
        meals: "Breakfast",
        altitude: "1,400m"
      }
    ],
    costPrice: 2600,
    sellPrice: 3900,
    inclusions: [
      "All accommodation in premium lodges (Yeti Mountain Home) and 5-star hotel in Kathmandu",
      "All meals during the trek (breakfast, lunch, dinner)",
      "Private licensed English-speaking Sherpa guide",
      "Porter service (1 porter per 2 trekkers)",
      "Kathmandu–Lukla–Kathmandu domestic flights",
      "Sagarmatha National Park entry permit and TIMS card",
      "Airport transfers in private vehicle",
      "First aid medical kit and oximeter"
    ],
    exclusions: [
      "International airfare to/from Kathmandu",
      "Nepal visa fee",
      "Travel and high-altitude rescue insurance (mandatory)",
      "Alcoholic and cold beverages",
      "Personal trekking gear",
      "Tips for guide, porters, and hotel staff"
    ]
  },

  // Trek 9: Poon Hill Luxury Trek
  {
    slug: "poon-hill-luxury-trek",
    name: "Poon Hill Luxury Trek",
    packageType: "trek",
    country: "Nepal",
    region: "Annapurna",
    durationDays: 7,
    durationNights: 6,
    difficulty: "Easy",
    maxAltitude: 3210,
    groupSizeMin: 2,
    groupSizeMax: 8,
    bestMonths: "March-May, October-December",
    itinerarySummary: "The perfect introduction to Himalayan trekking, the Poon Hill trek offers breathtaking sunrise views over the Annapurna and Dhaulagiri ranges without extreme altitude or difficulty. This luxury version uses the finest lodges on the route, passes through charming Gurung and Magar villages, and includes time in Pokhara for the ideal short luxury adventure in Nepal.",
    highlights: [
      "Spectacular sunrise from Poon Hill with views of Dhaulagiri, Annapurna South, and Machapuchare",
      "Trek through beautiful Gurung villages with traditional stone houses",
      "Walk through rhododendron forests (spectacular blooms in March-April)",
      "Suitable for all fitness levels — Nepal's most accessible Himalayan trek",
      "Stay in comfortable lodges with hot showers and mountain-view dining",
      "Combine with Pokhara lakeside relaxation"
    ],
    route: "Kathmandu → Pokhara → Nayapul → Tikhedhunga → Ghorepani → Poon Hill → Tadapani → Ghandruk → Nayapul → Pokhara → Kathmandu",
    days: [
      {
        day: 1,
        title: "Fly to Pokhara, Drive to Nayapul, Trek to Tikhedhunga",
        description: "Morning flight from Kathmandu to Pokhara. Private vehicle to Nayapul trailhead (1.5 hours). Begin trekking through terraced rice paddies and villages along the Modi Khola. Climb stone steps to the small village of Tikhedhunga.",
        accommodation: "Best available lodge, Tikhedhunga",
        meals: "Lunch, dinner",
        altitude: "1,540m"
      },
      {
        day: 2,
        title: "Trek to Ghorepani",
        description: "Climb the famous 3,300 stone steps to Ulleri, a large Magar village. Continue through beautiful oak and rhododendron forest (alive with color in spring) to Nangethanti. Final ascent to Ghorepani, a charming ridge-top village with stunning sunset views of Dhaulagiri (8,167m) and the Annapurna range.",
        accommodation: "Best available lodge, Ghorepani",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,860m"
      },
      {
        day: 3,
        title: "Poon Hill Sunrise, Trek to Tadapani",
        description: "Wake at 4:30am for the 45-minute climb to Poon Hill (3,210m). Watch a spectacular sunrise as golden light sweeps across Dhaulagiri (8,167m), Annapurna I (8,091m), Annapurna South (7,219m), Machapuchare (6,993m), Manaslu (8,163m), and the entire Himalayan panorama. Return for breakfast, then trek through dense rhododendron forest to Tadapani.",
        accommodation: "Best available lodge, Tadapani",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,630m"
      },
      {
        day: 4,
        title: "Trek to Ghandruk, Drive to Pokhara",
        description: "Descend through forest to the beautiful Gurung village of Ghandruk, with its slate-roofed houses and spectacular Annapurna South and Machapuchare views. Visit the Gurung Museum. Continue descending to Kimche or Nayapul and drive to Pokhara.",
        accommodation: "Tiger Mountain Pokhara Lodge, Pokhara",
        meals: "Breakfast, lunch",
        altitude: "820m"
      },
      {
        day: 5,
        title: "Pokhara Leisure Day",
        description: "Full day to relax in Pokhara. Optional sunrise trip to Sarangkot, boat ride on Phewa Lake, visit the Peace Pagoda, International Mountain Museum, or enjoy a spa treatment. Lakeside farewell dinner.",
        accommodation: "Tiger Mountain Pokhara Lodge, Pokhara",
        meals: "Breakfast, farewell dinner",
        altitude: "820m"
      },
      {
        day: 6,
        title: "Fly to Kathmandu",
        description: "Morning flight to Kathmandu. Transfer to hotel. Afternoon free for shopping or sightseeing at Boudhanath or Thamel.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Breakfast",
        altitude: "1,400m"
      },
      {
        day: 7,
        title: "Departure",
        description: "Private airport transfer for your onward journey.",
        accommodation: "N/A",
        meals: "Breakfast",
        altitude: "1,400m"
      }
    ],
    costPrice: 900,
    sellPrice: 1350,
    inclusions: [
      "All accommodation in best available lodges and luxury hotels in Pokhara and Kathmandu",
      "All meals during the trek (breakfast, lunch, dinner)",
      "Private licensed English-speaking trekking guide",
      "Porter service (1 porter per 2 trekkers)",
      "Kathmandu–Pokhara–Kathmandu domestic flights",
      "Nayapul transfers by private vehicle",
      "Annapurna Conservation Area Permit (ACAP) and TIMS card",
      "Airport transfers in private vehicle"
    ],
    exclusions: [
      "International airfare to/from Kathmandu",
      "Nepal visa fee",
      "Travel insurance",
      "Alcoholic and cold beverages",
      "Personal trekking gear",
      "Tips for guide, porters, and hotel staff"
    ]
  },

  // Trek 10: Mardi Himal Luxury Trek
  {
    slug: "mardi-himal-luxury-trek",
    name: "Mardi Himal Luxury Trek",
    packageType: "trek",
    country: "Nepal",
    region: "Annapurna",
    durationDays: 10,
    durationNights: 9,
    difficulty: "Moderate",
    maxAltitude: 4500,
    groupSizeMin: 2,
    groupSizeMax: 8,
    bestMonths: "March-May, October-December",
    itinerarySummary: "The Mardi Himal trek is Nepal's best-kept secret — a stunning ridge walk that takes you face-to-face with the south face of Machapuchare (Fishtail) and Mardi Himal without the crowds of more established routes. This luxury version features comfortable lodges, private guides, and the extraordinary experience of walking along an exposed ridge with 360-degree Himalayan views that few trekkers ever witness.",
    highlights: [
      "Walk along a dramatic exposed ridge with Machapuchare towering directly above",
      "Reach Mardi Himal Base Camp for intimate views of the Annapurna Sanctuary",
      "Far fewer trekkers than ABC or Poon Hill for a wilderness experience",
      "Trek through pristine rhododendron and oak forests teeming with bird life",
      "Spectacular sunrise views from High Camp over the Annapurna range",
      "Perfect moderate-difficulty alternative to the Annapurna Base Camp trek"
    ],
    route: "Kathmandu → Pokhara → Kande → Australian Camp → Forest Camp → Low Camp → High Camp → Mardi Himal Base Camp → return → Pokhara → Kathmandu",
    days: [
      {
        day: 1,
        title: "Fly to Pokhara",
        description: "Morning flight to Pokhara. Transfer to lakeside luxury resort. Afternoon briefing and Pokhara exploration.",
        accommodation: "Tiger Mountain Pokhara Lodge, Pokhara",
        meals: "Breakfast",
        altitude: "820m"
      },
      {
        day: 2,
        title: "Drive to Kande, Trek to Australian Camp",
        description: "Short drive to Kande trailhead. Easy trek through farmland and forest to Australian Camp, a scenic ridge with panoramic views of Annapurna South, Machapuchare, and the Pokhara Valley below.",
        accommodation: "Best available lodge, Australian Camp",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,060m"
      },
      {
        day: 3,
        title: "Trek to Forest Camp",
        description: "Enter dense rhododendron forest that creates a magical tunnel of twisted trees. In spring, the forest blazes with red, pink, and white blooms. The trail climbs steadily along the Mardi Himal ridge through Forest Camp (Kokar) with filtered mountain views.",
        accommodation: "Best available lodge, Forest Camp",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,520m"
      },
      {
        day: 4,
        title: "Trek to Low Camp",
        description: "Continue climbing through thinning forest as views open up dramatically. Emerge above the tree line to Low Camp with its first unobstructed views of Machapuchare's soaring south face and the Mardi Himal ridge stretching ahead.",
        accommodation: "Best available lodge, Low Camp",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,990m"
      },
      {
        day: 5,
        title: "Trek to High Camp",
        description: "Trek along the increasingly narrow and exposed ridge — one of Nepal's most dramatic trail sections. The path follows the spine of the ridge with Machapuchare dominating the view ahead and the Modi Khola valley far below. Arrive at High Camp perched on the ridgeline.",
        accommodation: "Best available lodge, High Camp",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,580m"
      },
      {
        day: 6,
        title: "Trek to Mardi Himal Base Camp, Return to High Camp",
        description: "Early morning trek to Mardi Himal Base Camp (4,500m) along the exposed ridge. Arrive at a viewpoint directly beneath the ice walls of Mardi Himal with the south face of Machapuchare filling the sky. Views extend into the Annapurna Sanctuary. Return to High Camp for overnight.",
        accommodation: "Best available lodge, High Camp",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,580m (excursion to 4,500m)"
      },
      {
        day: 7,
        title: "Descend to Forest Camp",
        description: "Descend the ridge enjoying the views from a new perspective. Re-enter the rhododendron forest and continue to Forest Camp.",
        accommodation: "Best available lodge, Forest Camp",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,520m"
      },
      {
        day: 8,
        title: "Trek to Siding, Drive to Pokhara",
        description: "Descend through the forest to Siding village. Private vehicle transfer to Pokhara. Celebration lunch by the lake. Afternoon at leisure.",
        accommodation: "Tiger Mountain Pokhara Lodge, Pokhara",
        meals: "Breakfast, lunch",
        altitude: "820m"
      },
      {
        day: 9,
        title: "Fly to Kathmandu",
        description: "Morning flight to Kathmandu. Transfer to hotel. Afternoon free. Optional heritage sightseeing.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Breakfast",
        altitude: "1,400m"
      },
      {
        day: 10,
        title: "Departure",
        description: "Private airport transfer for your onward journey.",
        accommodation: "N/A",
        meals: "Breakfast",
        altitude: "1,400m"
      }
    ],
    costPrice: 1200,
    sellPrice: 1800,
    inclusions: [
      "All accommodation in best available lodges and luxury hotels in Pokhara and Kathmandu",
      "All meals during the trek (breakfast, lunch, dinner)",
      "Private licensed English-speaking trekking guide",
      "Porter service (1 porter per 2 trekkers)",
      "Kathmandu–Pokhara–Kathmandu domestic flights",
      "Kande and Siding transfers by private vehicle",
      "Annapurna Conservation Area Permit (ACAP) and TIMS card",
      "Airport transfers in private vehicle"
    ],
    exclusions: [
      "International airfare to/from Kathmandu",
      "Nepal visa fee",
      "Travel insurance",
      "Alcoholic and cold beverages",
      "Personal trekking gear",
      "Tips for guide, porters, and hotel staff"
    ]
  },

  // Trek 11: Kanchenjunga Luxury Trek
  {
    slug: "kanchenjunga-luxury-trek",
    name: "Kanchenjunga Base Camp Luxury Trek",
    packageType: "trek",
    country: "Nepal",
    region: "Kanchenjunga",
    durationDays: 22,
    durationNights: 21,
    difficulty: "Extreme",
    maxAltitude: 5143,
    groupSizeMin: 2,
    groupSizeMax: 6,
    bestMonths: "April-May, October-November",
    itinerarySummary: "Journey to the foot of the world's third highest mountain in one of Nepal's most remote and pristine trekking regions. The Kanchenjunga trek to Pangpema (North Base Camp) passes through lush forests of giant ferns and orchids, across high alpine meadows, and into glacial landscapes few Westerners have ever witnessed. This luxury expedition ensures experienced high-altitude guides, satellite communication, and the finest available lodges in this restricted wilderness area.",
    highlights: [
      "Stand at Pangpema (5,143m), the north base camp of Kanchenjunga (8,586m)",
      "Trek through one of Nepal's most biodiverse regions with rare wildlife",
      "Experience authentic Limbu, Rai, and Sherpa cultures in remote villages",
      "Walk through pristine forests of orchids, giant ferns, and rhododendrons",
      "Restricted area permit limits visitors — true wilderness solitude",
      "Views of five of the world's 14 eight-thousanders from Pangpema"
    ],
    route: "Kathmandu → Bhadrapur → Taplejung → Chirwa → Sekathum → Ghunsa → Khambachen → Lhonak → Pangpema BC → return → Taplejung → Kathmandu",
    days: [
      {
        day: 1,
        title: "Arrival in Kathmandu",
        description: "Arrive and transfer to luxury hotel. Expedition briefing for this demanding remote trek. Gear check and welcome dinner.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Welcome dinner",
        altitude: "1,400m"
      },
      {
        day: 2,
        title: "Fly to Bhadrapur, Drive to Taplejung",
        description: "Domestic flight to Bhadrapur in southeast Nepal, then a long drive (8-9 hours) through the hills to Taplejung, the gateway to the Kanchenjunga Conservation Area. This far-eastern region feels completely different from central Nepal.",
        accommodation: "Best available lodge, Taplejung",
        meals: "Breakfast, lunch, dinner",
        altitude: "1,820m"
      },
      {
        day: 3,
        title: "Trek to Chirwa",
        description: "Descend through terraced farmland and subtropical forest to the Tamur River valley. Cross the river and follow it upstream through banana trees and rice paddies to the Tibetan settlement of Chirwa.",
        accommodation: "Best available lodge, Chirwa",
        meals: "Breakfast, lunch, dinner",
        altitude: "1,270m"
      },
      {
        day: 4,
        title: "Trek to Sekathum",
        description: "Continue along the Tamur River through lush tropical vegetation. Pass through small Limbu villages with their distinctive long houses. Cross suspension bridges and climb through bamboo forest to Sekathum.",
        accommodation: "Best available lodge, Sekathum",
        meals: "Breakfast, lunch, dinner",
        altitude: "1,660m"
      },
      {
        day: 5,
        title: "Trek to Amjilosa",
        description: "Climb steeply through rhododendron and bamboo forest. The trail is demanding with significant altitude gain. Pass through small settlements where locals grow cardamom on the forested slopes. Reach the small village of Amjilosa.",
        accommodation: "Best available lodge, Amjilosa",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,510m"
      },
      {
        day: 6,
        title: "Trek to Gyabla",
        description: "Continue climbing through increasingly alpine vegetation. Cross a high ridge with first views of snow peaks before descending to Gyabla, a Sherpa and Tibetan village in a beautiful valley.",
        accommodation: "Best available lodge, Gyabla",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,730m"
      },
      {
        day: 7,
        title: "Trek to Ghunsa",
        description: "Trek through magnificent old-growth forest to Ghunsa (Gunsa), the largest and most important village in the upper Tamur valley. This Tibetan-influenced village has a beautiful monastery, a school, and lodges. The views of Jannu (Kumbhakarna, 7,711m) are spectacular.",
        accommodation: "Best available lodge, Ghunsa",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,430m"
      },
      {
        day: 8,
        title: "Acclimatization Day in Ghunsa",
        description: "Essential rest day for acclimatization. Explore Ghunsa village, visit the monastery, and take a short hike to higher ground for mountain views. Your guide monitors everyone's health before the push to higher altitudes.",
        accommodation: "Best available lodge, Ghunsa",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,430m"
      },
      {
        day: 9,
        title: "Trek to Khambachen",
        description: "Trek through yak pastures and moraine alongside the Ghunsa Khola. The vegetation thins as you enter the alpine zone. Arrive at Khambachen (Kambachen), a summer yak herding settlement with spectacular views of Jannu's massive rock face and the Kanchenjunga Glacier.",
        accommodation: "Best available lodge, Khambachen",
        meals: "Breakfast, lunch, dinner",
        altitude: "4,050m"
      },
      {
        day: 10,
        title: "Acclimatization Day in Khambachen",
        description: "Hike to the Jannu Base Camp area (4,600m) for closer views of this dramatic peak's north face. Return to Khambachen. The altitude is now significant and rest is essential.",
        accommodation: "Best available lodge, Khambachen",
        meals: "Breakfast, lunch, dinner",
        altitude: "4,050m (excursion to 4,600m)"
      },
      {
        day: 11,
        title: "Trek to Lhonak",
        description: "Continue up the valley through boulder-strewn terrain and glacial moraines. The landscape is stark, beautiful, and increasingly dramatic. Cross the Lhonak Khola to reach Lhonak, a collection of stone shelters on a glacial plain.",
        accommodation: "Best available lodge/tent camp, Lhonak",
        meals: "Breakfast, lunch, dinner",
        altitude: "4,780m"
      },
      {
        day: 12,
        title: "Trek to Pangpema (North BC), Return to Lhonak",
        description: "Trek across the glacial moraine to Pangpema (5,143m), the north base camp of Kanchenjunga. The panorama is extraordinary — the massive north face of Kanchenjunga (8,586m), Wedge Peak, the Twins, Nepal Peak, and Tent Peak create an amphitheatre of ice and rock. On clear days, Everest, Lhotse, and Makalu are visible in the distance. Return to Lhonak.",
        accommodation: "Best available lodge/tent camp, Lhonak",
        meals: "Breakfast, lunch, dinner",
        altitude: "4,780m (excursion to 5,143m)"
      },
      {
        day: 13,
        title: "Trek to Khambachen",
        description: "Retrace steps down the valley to Khambachen. The descent is a relief from the extreme altitude.",
        accommodation: "Best available lodge, Khambachen",
        meals: "Breakfast, lunch, dinner",
        altitude: "4,050m"
      },
      {
        day: 14,
        title: "Trek to Ghunsa",
        description: "Continue descending through yak pastures to Ghunsa. Celebrate reaching base camp with a special dinner in the village.",
        accommodation: "Best available lodge, Ghunsa",
        meals: "Breakfast, lunch, celebration dinner",
        altitude: "3,430m"
      },
      {
        day: 15,
        title: "Trek to Gyabla",
        description: "Retrace the route south through the forest to Gyabla.",
        accommodation: "Best available lodge, Gyabla",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,730m"
      },
      {
        day: 16,
        title: "Trek to Amjilosa",
        description: "Continue through rhododendron forest and across ridges to Amjilosa.",
        accommodation: "Best available lodge, Amjilosa",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,510m"
      },
      {
        day: 17,
        title: "Trek to Sekathum",
        description: "Descend through bamboo forest and along the Tamur River to Sekathum.",
        accommodation: "Best available lodge, Sekathum",
        meals: "Breakfast, lunch, dinner",
        altitude: "1,660m"
      },
      {
        day: 18,
        title: "Trek to Chirwa",
        description: "Follow the Tamur River through subtropical terrain to Chirwa.",
        accommodation: "Best available lodge, Chirwa",
        meals: "Breakfast, lunch, dinner",
        altitude: "1,270m"
      },
      {
        day: 19,
        title: "Trek to Taplejung",
        description: "Final trekking day ascending back to Taplejung. Farewell dinner with your trekking team.",
        accommodation: "Best available lodge, Taplejung",
        meals: "Breakfast, lunch, farewell dinner",
        altitude: "1,820m"
      },
      {
        day: 20,
        title: "Drive to Bhadrapur, Fly to Kathmandu",
        description: "Long drive to Bhadrapur (8-9 hours). Late afternoon flight to Kathmandu. Transfer to hotel.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Breakfast, lunch",
        altitude: "1,400m"
      },
      {
        day: 21,
        title: "Kathmandu Leisure Day",
        description: "Rest and recovery day. Optional spa, shopping, or heritage sightseeing.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Breakfast",
        altitude: "1,400m"
      },
      {
        day: 22,
        title: "Departure",
        description: "Private airport transfer for your international departure.",
        accommodation: "N/A",
        meals: "Breakfast",
        altitude: "1,400m"
      }
    ],
    costPrice: 4500,
    sellPrice: 6750,
    inclusions: [
      "All accommodation in best available lodges and 5-star hotel in Kathmandu",
      "All meals during the trek (breakfast, lunch, dinner)",
      "Two private licensed high-altitude guides experienced in Kanchenjunga region",
      "Porter service (1 porter per 2 trekkers) plus kitchen crew for remote sections",
      "Kanchenjunga Conservation Area Permit and Restricted Area Permit",
      "TIMS card",
      "Kathmandu–Bhadrapur–Kathmandu domestic flights",
      "Bhadrapur–Taplejung and return ground transfers",
      "Emergency satellite phone and comprehensive first aid kit",
      "Airport transfers in private vehicle"
    ],
    exclusions: [
      "International airfare to/from Kathmandu",
      "Nepal visa fee",
      "Travel and high-altitude rescue/helicopter insurance (mandatory)",
      "Alcoholic and cold beverages",
      "Personal trekking and camping gear",
      "Tips for guides, porters, kitchen crew, and hotel staff"
    ]
  },

  // Trek 12: Makalu Base Camp Luxury
  {
    slug: "makalu-base-camp-luxury",
    name: "Makalu Base Camp Luxury Trek",
    packageType: "trek",
    country: "Nepal",
    region: "Makalu",
    durationDays: 20,
    durationNights: 19,
    difficulty: "Challenging",
    maxAltitude: 5009,
    groupSizeMin: 2,
    groupSizeMax: 6,
    bestMonths: "April-May, October-November",
    itinerarySummary: "Trek to the base of the world's fifth highest mountain through some of Nepal's most pristine and least-visited wilderness. The Makalu Base Camp trek passes through the Makalu-Barun National Park — the only protected area in Nepal encompassing a complete transition from subtropical forest to permanent ice. This luxury expedition provides experienced guides, full camping support where needed, and an unforgettable encounter with raw Himalayan wilderness.",
    highlights: [
      "Stand at Makalu Base Camp (5,009m) beneath the stunning pyramid of Makalu (8,485m)",
      "Trek through Makalu-Barun National Park's pristine and biodiverse wilderness",
      "Cross the Shipton La (4,210m) with views of Everest, Lhotse, and Makalu",
      "Experience one of Nepal's least-visited trekking regions",
      "Walk through the world's deepest valley (Arun Valley) and highest peaks",
      "Encounter rare wildlife including red pandas, snow leopards, and Himalayan tahr"
    ],
    route: "Kathmandu → Tumlingtar → Num → Seduwa → Tashigaon → Kongma → Dobato → Yangri Kharka → Makalu BC → return → Tumlingtar → Kathmandu",
    days: [
      {
        day: 1,
        title: "Arrival in Kathmandu",
        description: "Arrive and transfer to luxury hotel. Expedition briefing for this remote trek. Gear check and welcome dinner.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Welcome dinner",
        altitude: "1,400m"
      },
      {
        day: 2,
        title: "Fly to Tumlingtar",
        description: "Scenic mountain flight to Tumlingtar in eastern Nepal. The flight offers views of Everest, Makalu, and Kanchenjunga. Transfer to lodge and explore this Rai and Limbu market town in the Arun Valley.",
        accommodation: "Best available lodge, Tumlingtar",
        meals: "Breakfast, lunch, dinner",
        altitude: "390m"
      },
      {
        day: 3,
        title: "Drive and Trek to Num",
        description: "Jeep transfer along a rough mountain road toward Num, the gateway to Makalu-Barun National Park. The road climbs dramatically above the Arun River with stunning valley views. Arrive in Num, a ridge-top village with views of Makalu.",
        accommodation: "Best available lodge, Num",
        meals: "Breakfast, lunch, dinner",
        altitude: "1,560m"
      },
      {
        day: 4,
        title: "Trek to Seduwa",
        description: "Descend steeply to the Arun River (480m) and cross via suspension bridge. Climb the opposite valley wall through terraced farmland and subtropical forest to Seduwa (Sedua), a Rai village.",
        accommodation: "Best available lodge, Seduwa",
        meals: "Breakfast, lunch, dinner",
        altitude: "1,500m"
      },
      {
        day: 5,
        title: "Trek to Tashigaon",
        description: "Trek through farmland and enter the forest zone. Climb to Tashigaon, the last permanent village on the route — a small Sherpa settlement perched on a steep hillside surrounded by dense forest.",
        accommodation: "Best available lodge, Tashigaon",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,070m"
      },
      {
        day: 6,
        title: "Trek to Kongma (over Shipton La)",
        description: "The toughest day — steep climb through dense rhododendron and bamboo forest to the Shipton La (also called Kauma La, 4,210m). Views from the pass of Makalu, Chamlang, and Peak 6. Descend to the Barun Valley and Kongma.",
        accommodation: "Best available lodge/camp, Kongma",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,560m (pass at 4,210m)"
      },
      {
        day: 7,
        title: "Trek to Dobato",
        description: "Continue through the magnificent Barun Valley, one of Nepal's most pristine wilderness areas. Trek through moss-draped rhododendron forest alive with birds. Cross streams and climb gradually to Dobato in an alpine meadow.",
        accommodation: "Best available lodge/camp, Dobato",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,600m"
      },
      {
        day: 8,
        title: "Trek to Yangri Kharka",
        description: "Trek along the Barun River through open alpine terrain. The valley widens with increasingly dramatic views of Makalu, Peak 6, and Peak 7. Reach the yak pasture of Yangri Kharka beneath glaciated peaks.",
        accommodation: "Best available lodge/camp, Yangri Kharka",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,950m"
      },
      {
        day: 9,
        title: "Trek to Langmale Kharka",
        description: "Continue up the Barun Valley through boulder fields and alpine scrub. Views of Makalu and its satellite peaks become increasingly dramatic. Reach Langmale Kharka, a high-altitude camp near the Barun Glacier.",
        accommodation: "Best available lodge/camp, Langmale Kharka",
        meals: "Breakfast, lunch, dinner",
        altitude: "4,410m"
      },
      {
        day: 10,
        title: "Trek to Makalu Base Camp",
        description: "Cross the Barun Glacier moraine to Makalu Base Camp (5,009m). The massive south face of Makalu towers above — a pyramid of rock and ice that is one of the most impressive sights in the Himalayas. Spend time absorbing this extraordinary location.",
        accommodation: "Best available camp, Makalu Base Camp",
        meals: "Breakfast, lunch, dinner",
        altitude: "5,009m"
      },
      {
        day: 11,
        title: "Exploration Day at Makalu BC",
        description: "Full day to explore the base camp area. Hike toward the Swiss Base Camp or along the glacier for different perspectives of Makalu, Baruntse, Chamlang, and Peak 6. Photograph the stunning ice formations. Return to base camp.",
        accommodation: "Best available camp, Makalu Base Camp",
        meals: "Breakfast, lunch, dinner",
        altitude: "5,009m"
      },
      {
        day: 12,
        title: "Descend to Yangri Kharka",
        description: "Begin the return journey, descending along the Barun Valley to Yangri Kharka.",
        accommodation: "Best available lodge/camp, Yangri Kharka",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,950m"
      },
      {
        day: 13,
        title: "Trek to Dobato",
        description: "Continue down through the alpine meadows and forests to Dobato.",
        accommodation: "Best available lodge/camp, Dobato",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,600m"
      },
      {
        day: 14,
        title: "Trek to Kongma",
        description: "Trek back through the pristine Barun Valley forests to Kongma.",
        accommodation: "Best available lodge/camp, Kongma",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,560m"
      },
      {
        day: 15,
        title: "Cross Shipton La, Trek to Tashigaon",
        description: "Recross the Shipton La (4,210m) and descend steeply through the forest to Tashigaon.",
        accommodation: "Best available lodge, Tashigaon",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,070m"
      },
      {
        day: 16,
        title: "Trek to Seduwa",
        description: "Descend through farmland and forest to the Rai village of Seduwa.",
        accommodation: "Best available lodge, Seduwa",
        meals: "Breakfast, lunch, dinner",
        altitude: "1,500m"
      },
      {
        day: 17,
        title: "Trek to Num",
        description: "Descend to the Arun River, cross the bridge, and climb back to Num. Final night on the trail with a farewell celebration.",
        accommodation: "Best available lodge, Num",
        meals: "Breakfast, lunch, farewell dinner",
        altitude: "1,560m"
      },
      {
        day: 18,
        title: "Drive to Tumlingtar, Fly to Kathmandu",
        description: "Jeep transfer to Tumlingtar. Afternoon flight to Kathmandu. Transfer to luxury hotel.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Breakfast, lunch",
        altitude: "1,400m"
      },
      {
        day: 19,
        title: "Kathmandu Leisure Day",
        description: "Rest and recovery day. Optional spa, shopping, or heritage sightseeing at Bhaktapur.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Breakfast",
        altitude: "1,400m"
      },
      {
        day: 20,
        title: "Departure",
        description: "Private airport transfer for your international departure.",
        accommodation: "N/A",
        meals: "Breakfast",
        altitude: "1,400m"
      }
    ],
    costPrice: 4000,
    sellPrice: 6000,
    inclusions: [
      "All accommodation in best available lodges/camps and 5-star hotel in Kathmandu",
      "All meals during the trek (breakfast, lunch, dinner)",
      "Two private licensed high-altitude guides experienced in Makalu region",
      "Porter service and kitchen crew for remote sections",
      "Makalu-Barun National Park entry permit and Restricted Area Permit",
      "TIMS card",
      "Kathmandu–Tumlingtar–Kathmandu domestic flights",
      "Tumlingtar–Num ground transfers",
      "Camping equipment for remote sections (tents, mats, kitchen equipment)",
      "Emergency satellite phone and comprehensive first aid kit",
      "Airport transfers in private vehicle"
    ],
    exclusions: [
      "International airfare to/from Kathmandu",
      "Nepal visa fee",
      "Travel and high-altitude rescue/helicopter insurance (mandatory)",
      "Alcoholic and cold beverages",
      "Personal trekking gear and sleeping bag",
      "Tips for guides, porters, kitchen crew, and hotel staff"
    ]
  },

  // Trek 13: Dolpo Luxury Trek
  {
    slug: "dolpo-luxury-trek",
    name: "Dolpo Luxury Trek",
    packageType: "trek",
    country: "Nepal",
    region: "Dolpo",
    durationDays: 20,
    durationNights: 19,
    difficulty: "Challenging",
    maxAltitude: 5190,
    groupSizeMin: 2,
    groupSizeMax: 6,
    bestMonths: "May-June, September-October",
    itinerarySummary: "Venture into the mystical land of Dolpo, immortalized by Peter Matthiessen's 'The Snow Leopard.' This remote restricted region in northwestern Nepal preserves authentic Tibetan Bon-po and Buddhist culture in a landscape of dramatic canyons and high-altitude lakes. The trek to Phoksundo Lake — Nepal's deepest and most beautiful lake — and onward to Shey Gompa is a journey into one of the last truly untouched Himalayan wilderness areas.",
    highlights: [
      "Visit Phoksundo Lake, Nepal's deepest lake with its mesmerizing turquoise waters",
      "Explore the ancient Bon-po religion practiced in remote Dolpo villages",
      "Trek to Shey Gompa, the Crystal Monastery described in 'The Snow Leopard'",
      "Cross Kang La (5,190m) through pristine high-altitude wilderness",
      "Experience one of the most remote and restricted regions in Nepal",
      "Possible sightings of blue sheep, snow leopards, and Himalayan wolves"
    ],
    route: "Kathmandu → Nepalgunj → Juphal → Dunai → Phoksundo Lake → Kang La → Shey Gompa → return → Juphal → Nepalgunj → Kathmandu",
    days: [
      {
        day: 1,
        title: "Fly to Nepalgunj",
        description: "Domestic flight to Nepalgunj in the western Terai. This hot lowland city is the gateway to remote western Nepal. Afternoon at leisure.",
        accommodation: "Hotel Siddhartha or best available, Nepalgunj",
        meals: "Breakfast, dinner",
        altitude: "150m"
      },
      {
        day: 2,
        title: "Fly to Juphal, Trek to Dunai",
        description: "Early morning mountain flight to the grass airstrip at Juphal in the Dolpo district. Trek downhill through pine forests and fields to Dunai, the district headquarters of Dolpo — a bustling small town by the Bheri River.",
        accommodation: "Best available lodge, Dunai",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,140m"
      },
      {
        day: 3,
        title: "Trek to Chhepka",
        description: "Follow the Suli Gad river upstream through a dramatic gorge. The trail passes through small villages and enters increasingly wild terrain. Cross the river on wooden bridges and pass through the entrance to Shey Phoksundo National Park.",
        accommodation: "Best available lodge, Chhepka",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,700m"
      },
      {
        day: 4,
        title: "Trek to Phoksundo Lake",
        description: "Trek through forest to the waterfall at the lake outlet — a spectacular cascade. Climb steeply to the lake rim for your first view of Phoksundo Lake (3,612m) — an almost impossibly blue-green lake set in a cirque of craggy peaks. Visit the Bon-po village of Ringmo on the lake shore.",
        accommodation: "Best available lodge, Ringmo (Phoksundo Lake)",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,612m"
      },
      {
        day: 5,
        title: "Rest Day at Phoksundo Lake",
        description: "Explore around Phoksundo Lake. Visit the Bon-po Tshowa Gompa above Ringmo. Walk along the western shore of the lake through juniper forest. Photograph the lake's extraordinary color from different viewpoints. Interact with the Bon-po community.",
        accommodation: "Best available lodge, Ringmo (Phoksundo Lake)",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,612m"
      },
      {
        day: 6,
        title: "Trek along Phoksundo Lake to Lar Tsa",
        description: "Follow the spectacular trail along the eastern shore of Phoksundo Lake. The path is narrow, carved into cliff faces above the water. Cross streams and traverse rocky terrain to camping spots beyond the lake at Lar Tsa.",
        accommodation: "Camp, Lar Tsa",
        meals: "Breakfast, lunch, dinner",
        altitude: "4,000m"
      },
      {
        day: 7,
        title: "Trek to Snowfields Camp",
        description: "Climb gradually through alpine meadows and yak pastures toward the Kang La. Camp in a remote high-altitude location surrounded by peaks. Prepare for the pass crossing tomorrow.",
        accommodation: "Camp, Snowfields",
        meals: "Breakfast, lunch, dinner",
        altitude: "4,600m"
      },
      {
        day: 8,
        title: "Cross Kang La (5,190m), Descend to Shey",
        description: "Early start for the pass crossing. Climb through snow and scree to Kang La (5,190m) with extraordinary views of Dolpo's wilderness peaks. Long descent through remote terrain to the Shey area near the Crystal Monastery.",
        accommodation: "Camp, Shey",
        meals: "Breakfast, lunch, dinner",
        altitude: "4,100m (pass at 5,190m)"
      },
      {
        day: 9,
        title: "Explore Shey Gompa",
        description: "Visit the famous Shey Gompa (Crystal Monastery) described by Peter Matthiessen. This ancient Bon-po and Buddhist monastery sits beneath a crystal mountain in an extraordinarily remote and spiritual location. Explore the surrounding area and prayer flags.",
        accommodation: "Camp, Shey",
        meals: "Breakfast, lunch, dinner",
        altitude: "4,100m"
      },
      {
        day: 10,
        title: "Trek to Bhijer",
        description: "Trek south through the remote upper Dolpo landscape to the village of Bhijer, one of the most isolated permanently inhabited villages in Nepal. The Bon-po culture here is remarkably intact.",
        accommodation: "Best available lodge/camp, Bhijer",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,850m"
      },
      {
        day: 11,
        title: "Trek to Phoksundo Lake (North Shore)",
        description: "Trek back toward Phoksundo Lake via the northern route, offering different perspectives of the dramatic Dolpo landscape.",
        accommodation: "Camp, North Shore Phoksundo",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,700m"
      },
      {
        day: 12,
        title: "Trek to Ringmo",
        description: "Continue around or along Phoksundo Lake back to Ringmo village. A final afternoon by the extraordinary lake.",
        accommodation: "Best available lodge, Ringmo (Phoksundo Lake)",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,612m"
      },
      {
        day: 13,
        title: "Trek to Chhepka",
        description: "Descend along the Suli Gad river through the gorge back to Chhepka.",
        accommodation: "Best available lodge, Chhepka",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,700m"
      },
      {
        day: 14,
        title: "Trek to Dunai",
        description: "Continue down the valley to Dunai. Farewell dinner with your trekking crew.",
        accommodation: "Best available lodge, Dunai",
        meals: "Breakfast, lunch, farewell dinner",
        altitude: "2,140m"
      },
      {
        day: 15,
        title: "Trek to Juphal",
        description: "Trek uphill from Dunai to Juphal airstrip. Prepare for the morning flight.",
        accommodation: "Best available lodge, Juphal",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,475m"
      },
      {
        day: 16,
        title: "Fly to Nepalgunj",
        description: "Early morning flight from Juphal to Nepalgunj. Rest in the afternoon heat of the Terai.",
        accommodation: "Hotel Siddhartha or best available, Nepalgunj",
        meals: "Breakfast, lunch, dinner",
        altitude: "150m"
      },
      {
        day: 17,
        title: "Fly to Kathmandu",
        description: "Morning flight to Kathmandu. Transfer to luxury hotel. Afternoon at leisure.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Breakfast",
        altitude: "1,400m"
      },
      {
        day: 18,
        title: "Kathmandu Heritage Tour",
        description: "Private guided tour of Kathmandu's heritage sites. Farewell dinner.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Breakfast, farewell dinner",
        altitude: "1,400m"
      },
      {
        day: 19,
        title: "Kathmandu Leisure Day",
        description: "Buffer day for weather-delayed flights (common in western Nepal). If flights were on schedule, enjoy a spa day or shopping.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Breakfast",
        altitude: "1,400m"
      },
      {
        day: 20,
        title: "Departure",
        description: "Private airport transfer for your international departure.",
        accommodation: "N/A",
        meals: "Breakfast",
        altitude: "1,400m"
      }
    ],
    costPrice: 5000,
    sellPrice: 7500,
    inclusions: [
      "All accommodation in best available lodges, camping, and 5-star hotel in Kathmandu",
      "All meals during the trek (breakfast, lunch, dinner)",
      "Two private licensed guides experienced in Dolpo region",
      "Porter and pack animal service for luggage and camping equipment",
      "Upper Dolpo Restricted Area Permit (USD 500/10 days per person included)",
      "Shey Phoksundo National Park entry permit and TIMS card",
      "Kathmandu–Nepalgunj–Juphal and return domestic flights",
      "Full camping equipment (tents, mattresses, dining tent, kitchen equipment)",
      "Emergency satellite phone and comprehensive first aid kit",
      "Airport transfers in private vehicle"
    ],
    exclusions: [
      "International airfare to/from Kathmandu",
      "Nepal visa fee",
      "Travel and helicopter rescue insurance (mandatory)",
      "Alcoholic beverages",
      "Personal trekking gear and sleeping bag",
      "Tips for guides, porters, kitchen crew, and hotel staff"
    ]
  },

  // Trek 14: Tsum Valley Luxury Trek
  {
    slug: "tsum-valley-luxury-trek",
    name: "Tsum Valley Luxury Trek",
    packageType: "trek",
    country: "Nepal",
    region: "Manaslu",
    durationDays: 16,
    durationNights: 15,
    difficulty: "Moderate",
    maxAltitude: 3700,
    groupSizeMin: 2,
    groupSizeMax: 8,
    bestMonths: "March-May, October-November",
    itinerarySummary: "The Tsum Valley, a sacred hidden Himalayan valley on the border of Tibet, was closed to outsiders until 2008. This restricted-area trek follows the Budhi Gandaki river into a pristine U-shaped glacial valley where Tibetan Buddhist culture thrives unchanged. With no passes above 3,700m, this is an accessible yet deeply rewarding cultural trek through one of Nepal's most spiritual and unspoiled regions.",
    highlights: [
      "Explore a sacred Beyul (hidden valley) revered in Tibetan Buddhist tradition",
      "Visit Mu Gompa (3,700m), one of Nepal's largest and most active nunneries",
      "Experience authentic Tibetan culture preserved in complete isolation until 2008",
      "Trek without extreme altitude — highest point 3,700m makes it widely accessible",
      "Visit ancient monasteries, mani walls, and chortens dating back centuries",
      "Restricted area permit ensures minimal visitors and preserved heritage"
    ],
    route: "Kathmandu → Arughat → Soti Khola → Lokpa → Chumling → Chhekampar → Nile → Mu Gompa → return → Arughat → Kathmandu",
    days: [
      {
        day: 1,
        title: "Arrival in Kathmandu",
        description: "Arrive and transfer to luxury hotel. Trek briefing and welcome dinner.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Welcome dinner",
        altitude: "1,400m"
      },
      {
        day: 2,
        title: "Drive to Soti Khola",
        description: "Private vehicle transfer via Arughat to Soti Khola (8-9 hours). Enter the Budhi Gandaki river valley.",
        accommodation: "Best available lodge, Soti Khola",
        meals: "Breakfast, lunch, dinner",
        altitude: "730m"
      },
      {
        day: 3,
        title: "Trek to Machha Khola",
        description: "Trek along the Budhi Gandaki river through subtropical forest. Cross suspension bridges and traverse rocky terrain to Machha Khola.",
        accommodation: "Best available lodge, Machha Khola",
        meals: "Breakfast, lunch, dinner",
        altitude: "930m"
      },
      {
        day: 4,
        title: "Trek to Jagat",
        description: "Continue through the narrowing gorge past waterfalls and dramatic rock formations. Pass through Tatopani hot springs and reach Jagat, the historic customs village.",
        accommodation: "Best available lodge, Jagat",
        meals: "Breakfast, lunch, dinner",
        altitude: "1,410m"
      },
      {
        day: 5,
        title: "Trek to Lokpa",
        description: "Enter the Tsum Valley restricted zone at the trail junction before Philim. Turn east up the Siyar Khola valley. The trail climbs through forest to the Tibetan-style village of Lokpa, where flat-roofed stone houses appear and mani walls line the trail.",
        accommodation: "Best available lodge, Lokpa",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,240m"
      },
      {
        day: 6,
        title: "Trek to Chumling",
        description: "Continue up the valley through increasingly Tibetan-influenced villages. Pass ancient mani walls with thousands of carved prayer stones. Cross to the east side of the valley and reach Chumling, a beautiful village with terraced fields and a monastery.",
        accommodation: "Best available lodge, Chumling",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,386m"
      },
      {
        day: 7,
        title: "Trek to Chhekampar",
        description: "The valley opens into the wide, U-shaped glacial form of upper Tsum. Trek through juniper forest and yak pastures to Chhekampar (Domje), the main village of the upper Tsum Valley. Visit the Milarepa cave where the legendary Tibetan saint is said to have meditated.",
        accommodation: "Best available lodge, Chhekampar",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,031m"
      },
      {
        day: 8,
        title: "Trek to Nile and Mu Gompa",
        description: "Trek through the open valley to Nile village. Continue to Mu Gompa (3,700m), one of Nepal's most important and largest Buddhist nunneries, founded in the 18th century. Over 100 nuns practice here in a stunning setting beneath snow-capped peaks on the Tibetan border. Spend time with the community.",
        accommodation: "Best available lodge, Nile",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,361m (Mu Gompa at 3,700m)"
      },
      {
        day: 9,
        title: "Explore Mu Gompa and Rachhen Gompa",
        description: "Full day to explore the upper Tsum Valley. Visit Rachhen Gompa, the Dechen Choling nunnery, and the ancient Piren Phu cave monastery. Interact with the nuns and local Tsum-pa people. Views of Ganesh Himal, Sringi Himal, and Boudha Himal.",
        accommodation: "Best available lodge, Nile",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,361m"
      },
      {
        day: 10,
        title: "Trek to Chumling",
        description: "Begin the return journey through the valley to Chumling. Different light and perspectives on the return.",
        accommodation: "Best available lodge, Chumling",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,386m"
      },
      {
        day: 11,
        title: "Trek to Lokpa",
        description: "Continue descending through the Tsum Valley to Lokpa.",
        accommodation: "Best available lodge, Lokpa",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,240m"
      },
      {
        day: 12,
        title: "Trek to Jagat",
        description: "Rejoin the main Budhi Gandaki trail at Philim and descend to Jagat.",
        accommodation: "Best available lodge, Jagat",
        meals: "Breakfast, lunch, dinner",
        altitude: "1,410m"
      },
      {
        day: 13,
        title: "Trek to Soti Khola",
        description: "Continue down the gorge through Machha Khola to Soti Khola. Farewell dinner with trekking crew.",
        accommodation: "Best available lodge, Soti Khola",
        meals: "Breakfast, lunch, farewell dinner",
        altitude: "730m"
      },
      {
        day: 14,
        title: "Drive to Kathmandu",
        description: "Private vehicle transfer back to Kathmandu (8-9 hours). Arrive evening.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Breakfast, lunch",
        altitude: "1,400m"
      },
      {
        day: 15,
        title: "Kathmandu Heritage Tour",
        description: "Private guided tour of Kathmandu's UNESCO sites. Farewell dinner with traditional Nepali cuisine.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Breakfast, farewell dinner",
        altitude: "1,400m"
      },
      {
        day: 16,
        title: "Departure",
        description: "Private airport transfer for your international departure.",
        accommodation: "N/A",
        meals: "Breakfast",
        altitude: "1,400m"
      }
    ],
    costPrice: 2200,
    sellPrice: 3300,
    inclusions: [
      "All accommodation in best available lodges and 5-star hotel in Kathmandu",
      "All meals during the trek (breakfast, lunch, dinner)",
      "Private licensed English-speaking guide with Tsum Valley expertise",
      "Porter service (1 porter per 2 trekkers)",
      "Tsum Valley Restricted Area Permit and Manaslu Conservation Area Permit",
      "TIMS card",
      "Kathmandu–Soti Khola–Kathmandu private vehicle transfers",
      "Kathmandu heritage sightseeing tour with entrance fees",
      "Airport transfers in private vehicle",
      "First aid medical kit"
    ],
    exclusions: [
      "International airfare to/from Kathmandu",
      "Nepal visa fee",
      "Travel insurance (mandatory)",
      "Alcoholic and cold beverages",
      "Personal trekking gear",
      "Tips for guide, porters, and hotel staff"
    ]
  },

  // Trek 15: Pikey Peak Luxury Trek
  {
    slug: "pikey-peak-luxury-trek",
    name: "Pikey Peak Luxury Trek",
    packageType: "trek",
    country: "Nepal",
    region: "Solukhumbu",
    durationDays: 10,
    durationNights: 9,
    difficulty: "Easy to Moderate",
    maxAltitude: 4065,
    groupSizeMin: 2,
    groupSizeMax: 8,
    bestMonths: "March-May, October-December",
    itinerarySummary: "Pikey Peak was recommended by Sir Edmund Hillary himself as offering the best view of Everest in Nepal. This off-the-beaten-path luxury trek through the lower Solukhumbu region offers stunning Himalayan panoramas, authentic Sherpa village life, and the historic trail that Hillary walked on his first approach to Everest in 1953 — all without extreme altitude or difficulty.",
    highlights: [
      "Summit Pikey Peak (4,065m), Sir Edmund Hillary's recommended best Everest viewpoint",
      "Panoramic views of Everest, Makalu, Kanchenjunga, Lhotse, and Cho Oyu",
      "Walk the historic route that Hillary used approaching Everest in 1953",
      "Experience authentic Sherpa village life without the crowds of the Khumbu",
      "Trek through rhododendron forests and traditional farming communities",
      "Accessible altitude suitable for families and first-time trekkers"
    ],
    route: "Kathmandu → Jiri → Shivalaya → Pikey Peak → Junbesi → Phaplu → Kathmandu",
    days: [
      {
        day: 1,
        title: "Arrival in Kathmandu",
        description: "Arrive and transfer to luxury hotel. Trek briefing and welcome dinner.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Welcome dinner",
        altitude: "1,400m"
      },
      {
        day: 2,
        title: "Drive to Jiri",
        description: "Private vehicle transfer to Jiri (7-8 hours) — the starting point of the original Everest approach before Lukla airport was built. Scenic drive through the Mahabharat hills. Arrive in the charming bazaar town of Jiri.",
        accommodation: "Best available lodge, Jiri",
        meals: "Breakfast, lunch, dinner",
        altitude: "1,905m"
      },
      {
        day: 3,
        title: "Trek to Shivalaya",
        description: "Descend from Jiri through terraced farmland and forest to the Likhu Khola valley. Cross the river and climb to Shivalaya, a small village with a Buddhist monastery. First views of the distant Himalayan peaks.",
        accommodation: "Best available lodge, Shivalaya",
        meals: "Breakfast, lunch, dinner",
        altitude: "1,767m"
      },
      {
        day: 4,
        title: "Trek to Pikey Base Camp",
        description: "Climb steeply through rhododendron and pine forest toward Pikey Peak. Pass through Sherpa villages and Buddhist shrines. Arrive at Pikey Base Camp area with growing mountain views.",
        accommodation: "Best available lodge, Pikey Base Camp",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,640m"
      },
      {
        day: 5,
        title: "Summit Pikey Peak (4,065m), Trek to Junbesi",
        description: "Pre-dawn departure for Pikey Peak summit (4,065m). Watch the sunrise illuminate a staggering panorama: Everest (8,849m), Lhotse (8,516m), Makalu (8,485m), Kanchenjunga (8,586m), Cho Oyu (8,188m), and Gauri Shankar (7,134m). The entire eastern Himalayan chain stretches across the horizon. Descend through forest to the beautiful Sherpa village of Junbesi in a sun-filled valley.",
        accommodation: "Best available lodge, Junbesi",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,675m (morning at 4,065m)"
      },
      {
        day: 6,
        title: "Explore Junbesi",
        description: "Rest day in the charming village of Junbesi. Visit the Thupten Choling Monastery, one of the most important Buddhist monasteries in the Solu region with over 300 monks and nuns. Explore the village and surrounding trails.",
        accommodation: "Best available lodge, Junbesi",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,675m"
      },
      {
        day: 7,
        title: "Trek to Ringmu",
        description: "Trek south through forest and farmland, crossing ridges with mountain views. Pass through small Sherpa and Rai villages to Ringmu.",
        accommodation: "Best available lodge, Ringmu",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,720m"
      },
      {
        day: 8,
        title: "Trek to Phaplu",
        description: "Final trek through the Solu countryside to Phaplu, the district headquarters with an airstrip. Visit the Chiwong Monastery near Phaplu. Farewell dinner with your trekking crew.",
        accommodation: "Best available lodge, Phaplu",
        meals: "Breakfast, lunch, farewell dinner",
        altitude: "2,413m"
      },
      {
        day: 9,
        title: "Fly to Kathmandu",
        description: "Morning flight from Phaplu to Kathmandu (weather permitting) or drive via Jiri. Transfer to luxury hotel. Afternoon at leisure.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Breakfast",
        altitude: "1,400m"
      },
      {
        day: 10,
        title: "Departure",
        description: "Private airport transfer for your international departure.",
        accommodation: "N/A",
        meals: "Breakfast",
        altitude: "1,400m"
      }
    ],
    costPrice: 1100,
    sellPrice: 1650,
    inclusions: [
      "All accommodation in best available lodges and 5-star hotel in Kathmandu",
      "All meals during the trek (breakfast, lunch, dinner)",
      "Private licensed English-speaking trekking guide",
      "Porter service (1 porter per 2 trekkers)",
      "Kathmandu–Jiri private vehicle transfer",
      "Phaplu–Kathmandu domestic flight (or vehicle if flight cancelled)",
      "National park/conservation area permits and TIMS card",
      "Airport transfers in private vehicle",
      "First aid medical kit"
    ],
    exclusions: [
      "International airfare to/from Kathmandu",
      "Nepal visa fee",
      "Travel insurance",
      "Alcoholic and cold beverages",
      "Personal trekking gear",
      "Tips for guide, porters, and hotel staff"
    ]
  },

  // Trek 16: Khopra Ridge Luxury Trek
  {
    slug: "khopra-ridge-luxury-trek",
    name: "Khopra Ridge Luxury Trek",
    packageType: "trek",
    country: "Nepal",
    region: "Annapurna",
    durationDays: 10,
    durationNights: 9,
    difficulty: "Moderate",
    maxAltitude: 3660,
    groupSizeMin: 2,
    groupSizeMax: 8,
    bestMonths: "March-May, October-December",
    itinerarySummary: "The Khopra Ridge trek is an emerging luxury alternative in the Annapurna region, combining the famous Poon Hill sunrise with a dramatic ridge walk to Khopra Danda and the sacred Khayer Lake. Managed by community lodges, this trek offers breathtaking Dhaulagiri and Annapurna views, a pristine alpine lake at 4,500m, and far fewer trekkers than nearby routes for an intimate Himalayan experience.",
    highlights: [
      "Sunrise from Khopra Ridge with panoramic Dhaulagiri and Annapurna views",
      "Visit sacred Khayer Lake (4,500m) — a holy Hindu pilgrimage site",
      "Stay in community-managed lodges supporting local livelihoods",
      "Combine with Poon Hill for two of the best viewpoints in the Annapurna region",
      "Far fewer trekkers than Poon Hill or ABC for a peaceful experience",
      "Walk through diverse landscapes from subtropical to alpine in days"
    ],
    route: "Kathmandu → Pokhara → Nayapul → Ghorepani → Poon Hill → Khopra Ridge → Khayer Lake → Swanta → Nayapul → Pokhara → Kathmandu",
    days: [
      {
        day: 1,
        title: "Fly to Pokhara",
        description: "Morning flight to Pokhara. Transfer to lakeside luxury resort. Afternoon briefing.",
        accommodation: "Tiger Mountain Pokhara Lodge, Pokhara",
        meals: "Breakfast",
        altitude: "820m"
      },
      {
        day: 2,
        title: "Drive to Nayapul, Trek to Tikhedhunga",
        description: "Drive to Nayapul trailhead. Trek through rice paddies and villages to Tikhedhunga.",
        accommodation: "Best available lodge, Tikhedhunga",
        meals: "Breakfast, lunch, dinner",
        altitude: "1,540m"
      },
      {
        day: 3,
        title: "Trek to Ghorepani",
        description: "Climb the 3,300 stone steps to Ulleri, continue through oak and rhododendron forest to Ghorepani on the ridge.",
        accommodation: "Best available lodge, Ghorepani",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,860m"
      },
      {
        day: 4,
        title: "Poon Hill Sunrise, Trek to Chistibang",
        description: "Pre-dawn climb to Poon Hill (3,210m) for the famous sunrise panorama. Return for breakfast, then head south on the Khopra Ridge trail — a quiet path that most trekkers never see. Trek through pristine forest to Chistibang.",
        accommodation: "Community lodge, Chistibang",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,990m"
      },
      {
        day: 5,
        title: "Trek to Khopra Ridge",
        description: "Continue along the ridge through rhododendron and oak forest. The trail emerges above the tree line onto Khopra Danda (Khopra Ridge) — a dramatic viewpoint with sweeping views of Dhaulagiri (8,167m), Annapurna South, Nilgiri, and the deep Kali Gandaki gorge far below.",
        accommodation: "Khopra Danda Community Lodge",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,660m"
      },
      {
        day: 6,
        title: "Excursion to Khayer Lake",
        description: "Early morning hike to sacred Khayer Lake (4,500m) — a pristine alpine lake considered holy by Hindus, who believe Lord Shiva resides here. The lake sits in a dramatic cirque with Annapurna South rising behind. Return to Khopra Ridge. Extraordinary sunset views.",
        accommodation: "Khopra Danda Community Lodge",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,660m (excursion to 4,500m)"
      },
      {
        day: 7,
        title: "Trek to Swanta",
        description: "Descend from the ridge through forest to the charming Magar village of Swanta. Visit the community lodge and interact with the warm local community.",
        accommodation: "Community lodge, Swanta",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,210m"
      },
      {
        day: 8,
        title: "Trek to Nayapul, Drive to Pokhara",
        description: "Final trek descending to Nayapul via Kimche. Private vehicle transfer to Pokhara. Celebration lakeside lunch. Afternoon at leisure.",
        accommodation: "Tiger Mountain Pokhara Lodge, Pokhara",
        meals: "Breakfast, lunch",
        altitude: "820m"
      },
      {
        day: 9,
        title: "Fly to Kathmandu",
        description: "Morning flight to Kathmandu. Transfer to hotel. Afternoon free.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Breakfast",
        altitude: "1,400m"
      },
      {
        day: 10,
        title: "Departure",
        description: "Private airport transfer for your international departure.",
        accommodation: "N/A",
        meals: "Breakfast",
        altitude: "1,400m"
      }
    ],
    costPrice: 1200,
    sellPrice: 1800,
    inclusions: [
      "All accommodation in community lodges and luxury hotels in Pokhara and Kathmandu",
      "All meals during the trek (breakfast, lunch, dinner)",
      "Private licensed English-speaking trekking guide",
      "Porter service (1 porter per 2 trekkers)",
      "Kathmandu–Pokhara–Kathmandu domestic flights",
      "Nayapul transfers by private vehicle",
      "Annapurna Conservation Area Permit (ACAP) and TIMS card",
      "Airport transfers in private vehicle"
    ],
    exclusions: [
      "International airfare to/from Kathmandu",
      "Nepal visa fee",
      "Travel insurance",
      "Alcoholic and cold beverages",
      "Personal trekking gear",
      "Tips for guide, porters, and hotel staff"
    ]
  },

  // Trek 17: Ruby Valley Luxury Trek
  {
    slug: "ruby-valley-luxury-trek",
    name: "Ruby Valley Luxury Trek",
    packageType: "trek",
    country: "Nepal",
    region: "Ganesh Himal",
    durationDays: 14,
    durationNights: 13,
    difficulty: "Moderate",
    maxAltitude: 4600,
    groupSizeMin: 2,
    groupSizeMax: 8,
    bestMonths: "March-May, October-November",
    itinerarySummary: "The Ruby Valley trek, named for the rubies once mined in this region, is one of Nepal's best-kept secrets. Circling the Ganesh Himal range northwest of Kathmandu, this restricted-area trek passes through pristine Tamang and Gurung villages, dense forests, and high passes with views of Ganesh Himal, Manaslu, and the Langtang range. Almost no Western trekkers visit this area, offering a genuine wilderness and cultural immersion experience.",
    highlights: [
      "Trek through one of Nepal's least-visited and most pristine regions",
      "Cross Pangsang Bhanjyang pass (3,842m) with Ganesh Himal panoramas",
      "Visit authentic Tamang villages maintaining ancient traditions",
      "Walk through dense forests of rhododendron, pine, and juniper",
      "Views of Ganesh Himal, Manaslu, Langtang, and the Himalayan chain",
      "Named for historical ruby mines — unique geological heritage"
    ],
    route: "Kathmandu → Dhunche → Gatlang → Tatopani → Somdang → Pangsang Bhanjyang → Tipling → Lapagaon → Kathmandu",
    days: [
      {
        day: 1,
        title: "Arrival in Kathmandu",
        description: "Arrive and transfer to luxury hotel. Trek briefing and welcome dinner.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Welcome dinner",
        altitude: "1,400m"
      },
      {
        day: 2,
        title: "Drive to Syabrubesi via Dhunche",
        description: "Private vehicle to the Langtang region via Dhunche (7-8 hours). Enter the Rasuwa district with its dramatic mountain scenery.",
        accommodation: "Best available lodge, Syabrubesi",
        meals: "Breakfast, lunch, dinner",
        altitude: "1,550m"
      },
      {
        day: 3,
        title: "Trek to Gatlang",
        description: "Trek to the beautiful Tamang village of Gatlang, one of the region's largest and most culturally rich settlements. Traditional flat-roofed stone houses, a monastery, and stunning views of Ganesh Himal. Visit the sacred Parvati Kunda lake nearby.",
        accommodation: "Best available lodge/homestay, Gatlang",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,238m"
      },
      {
        day: 4,
        title: "Trek to Tatopani",
        description: "Descend to the Chilime Khola and soak in the natural hot springs at Tatopani. The trail passes through terraced farmland and pine forests with views of the Ganesh Himal range.",
        accommodation: "Best available lodge, Tatopani",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,607m"
      },
      {
        day: 5,
        title: "Trek to Thuman",
        description: "Climb through forest and small settlements to the charming Tamang village of Thuman. Visit the old monastery and enjoy panoramic views of Langtang Lirung and Ganesh Himal.",
        accommodation: "Best available lodge/homestay, Thuman",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,760m"
      },
      {
        day: 6,
        title: "Trek to Somdang",
        description: "Cross the Pangsang Pass approach ridge and descend into the Ruby Valley toward Somdang, a former mining village. This area was historically known for ruby mining. The landscape is dramatic — high ridges, deep valleys, and glaciated peaks.",
        accommodation: "Best available lodge, Somdang",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,270m"
      },
      {
        day: 7,
        title: "Explore Somdang and Ruby Mines Area",
        description: "Day trip to explore the historic ruby mining area and surrounding high-altitude terrain. Hike toward the Ganesh Himal base area for closer mountain views. Visit the local monastery.",
        accommodation: "Best available lodge, Somdang",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,270m (excursion to 4,000m)"
      },
      {
        day: 8,
        title: "Trek to Pangsang Bhanjyang",
        description: "Climb to Pangsang Bhanjyang pass (3,842m) with 360-degree panoramic views of Ganesh Himal I-IV, Manaslu, Langtang Lirung, and the Tibetan Plateau. Descend to a camping area below the pass.",
        accommodation: "Best available lodge/camp, below Pangsang Bhanjyang",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,600m (pass at 3,842m)"
      },
      {
        day: 9,
        title: "Trek to Tipling",
        description: "Descend through forests and high pastures to Tipling, a large Tamang village with extensive terraced fields and traditional architecture. Warm hospitality and cultural immersion.",
        accommodation: "Best available lodge/homestay, Tipling",
        meals: "Breakfast, lunch, dinner",
        altitude: "1,890m"
      },
      {
        day: 10,
        title: "Trek to Lapagaon",
        description: "Continue descending through the Trisuli Valley to Lapagaon. Pass through lower-elevation villages with different ethnic groups and farming practices.",
        accommodation: "Best available lodge, Lapagaon",
        meals: "Breakfast, lunch, dinner",
        altitude: "1,450m"
      },
      {
        day: 11,
        title: "Trek to Darkha Phedi, Drive to Dhading",
        description: "Final trekking to Darkha Phedi at the roadhead. Jeep transfer to Dhading Besi and onward to a comfortable lodge.",
        accommodation: "Best available lodge, Dhading",
        meals: "Breakfast, lunch, dinner",
        altitude: "620m"
      },
      {
        day: 12,
        title: "Drive to Kathmandu",
        description: "Private vehicle transfer to Kathmandu (3-4 hours). Transfer to luxury hotel. Afternoon at leisure.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Breakfast, lunch",
        altitude: "1,400m"
      },
      {
        day: 13,
        title: "Kathmandu Heritage Tour",
        description: "Private guided heritage tour. Farewell dinner with Nepali cultural performance.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Breakfast, farewell dinner",
        altitude: "1,400m"
      },
      {
        day: 14,
        title: "Departure",
        description: "Private airport transfer for your international departure.",
        accommodation: "N/A",
        meals: "Breakfast",
        altitude: "1,400m"
      }
    ],
    costPrice: 1800,
    sellPrice: 2700,
    inclusions: [
      "All accommodation in best available lodges/homestays and 5-star hotel in Kathmandu",
      "All meals during the trek (breakfast, lunch, dinner)",
      "Private licensed English-speaking trekking guide",
      "Porter service (1 porter per 2 trekkers)",
      "Restricted Area Permit for Ruby Valley (Tamang Heritage Trail area)",
      "TIMS card",
      "All ground transportation (Kathmandu–Syabrubesi, Dhading–Kathmandu)",
      "Kathmandu heritage sightseeing tour with entrance fees",
      "Airport transfers in private vehicle",
      "First aid medical kit"
    ],
    exclusions: [
      "International airfare to/from Kathmandu",
      "Nepal visa fee",
      "Travel insurance (mandatory)",
      "Alcoholic and cold beverages",
      "Personal trekking gear",
      "Tips for guide, porters, and hotel staff"
    ]
  },

  // Trek 18: Helambu Luxury Trek
  {
    slug: "helambu-luxury-trek",
    name: "Helambu Luxury Trek",
    packageType: "trek",
    country: "Nepal",
    region: "Helambu",
    durationDays: 8,
    durationNights: 7,
    difficulty: "Easy",
    maxAltitude: 3640,
    groupSizeMin: 2,
    groupSizeMax: 8,
    bestMonths: "March-May, October-December",
    itinerarySummary: "The closest quality trek to Kathmandu, the Helambu trek takes you through beautiful Hyolmo (Helambu Sherpa) villages, rhododendron forests, and Buddhist monasteries without the need for domestic flights or extreme altitude. This luxury version offers comfortable community lodges, private guides, and an intimate cultural experience with the unique Hyolmo people — a Tibetan-origin community with their own language, traditions, and festivals.",
    highlights: [
      "Trek from Kathmandu's doorstep — no domestic flights needed",
      "Experience unique Hyolmo (Helambu Sherpa) culture and warm hospitality",
      "Walk through magnificent rhododendron forests (spectacular in spring)",
      "Visit ancient Buddhist monasteries and cultural heritage sites",
      "Panoramic views of Langtang, Ganesh Himal, and the Jugal Himal",
      "Perfect introductory trek for families and those with limited time"
    ],
    route: "Kathmandu → Sundarijal → Chisopani → Kutumsang → Tharepati → Melamchighyang → Tarkeghyang → return to Kathmandu",
    days: [
      {
        day: 1,
        title: "Drive to Sundarijal, Trek to Chisopani",
        description: "Private vehicle from Kathmandu to Sundarijal (45 minutes) at the edge of Shivapuri Nagarjun National Park. Trek uphill through the national park's dense forest, past a water reservoir and army checkpoint. Emerge at Chisopani ('cold water'), a ridge-top settlement with stunning sunrise views of Langtang, Ganesh Himal, and on clear days, Everest.",
        accommodation: "Best available lodge, Chisopani",
        meals: "Lunch, dinner",
        altitude: "2,140m"
      },
      {
        day: 2,
        title: "Trek to Kutumsang",
        description: "Trek along the ridge through oak and rhododendron forest. Pass through the Tamang village of Pati Bhanjyang and continue climbing through terraced farmland and forest to Kutumsang, a small settlement on the ridge with panoramic mountain views.",
        accommodation: "Best available lodge, Kutumsang",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,470m"
      },
      {
        day: 3,
        title: "Trek to Tharepati",
        description: "Continue climbing through increasingly dense and magnificent rhododendron forest — a tunnel of twisted trees covered in moss and orchids. In spring (March-April), the forest blazes with red, pink, and white blooms. Reach Tharepati on the ridge dividing Helambu from the Langtang region. Spectacular sunset views.",
        accommodation: "Best available lodge, Tharepati",
        meals: "Breakfast, lunch, dinner",
        altitude: "3,640m"
      },
      {
        day: 4,
        title: "Trek to Melamchighyang",
        description: "Descend steeply from the ridge through forest into the Helambu valley. The trail drops dramatically into the Melamchi Khola valley, entering the heartland of Hyolmo culture. Arrive at Melamchighyang, a beautiful village of traditional stone houses, prayer flags, and a revered monastery.",
        accommodation: "Best available lodge, Melamchighyang",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,530m"
      },
      {
        day: 5,
        title: "Trek to Tarkeghyang",
        description: "Cross the Melamchi Khola and climb to Tarkeghyang, the largest and most important Hyolmo village. Visit the stunning Tarkeghyang Monastery with its ornate interior and sacred artifacts. The village hosts the famous Lhosar (Tibetan New Year) celebrations. Interact with local families.",
        accommodation: "Best available lodge, Tarkeghyang",
        meals: "Breakfast, lunch, dinner",
        altitude: "2,590m"
      },
      {
        day: 6,
        title: "Trek to Sermathang",
        description: "Trek to the neighboring Hyolmo village of Sermathang through terraced fields and forest. Visit the Sermathang Monastery. This village offers excellent views of the Jugal Himal and Dorje Lakpa. Final evening on the trail with a farewell dinner.",
        accommodation: "Best available lodge, Sermathang",
        meals: "Breakfast, lunch, farewell dinner",
        altitude: "2,620m"
      },
      {
        day: 7,
        title: "Trek to Melamchi Bazaar, Drive to Kathmandu",
        description: "Descend through farmland and forest to Melamchi Bazaar in the valley below. Private vehicle transfer to Kathmandu (2-3 hours). Afternoon at leisure for shopping or sightseeing.",
        accommodation: "Dwarika's Hotel, Kathmandu",
        meals: "Breakfast, lunch",
        altitude: "1,400m"
      },
      {
        day: 8,
        title: "Departure",
        description: "Private airport transfer for your international departure.",
        accommodation: "N/A",
        meals: "Breakfast",
        altitude: "1,400m"
      }
    ],
    costPrice: 800,
    sellPrice: 1200,
    inclusions: [
      "All accommodation in best available lodges and 5-star hotel in Kathmandu",
      "All meals during the trek (breakfast, lunch, dinner)",
      "Private licensed English-speaking trekking guide",
      "Porter service (1 porter per 2 trekkers)",
      "Shivapuri Nagarjun National Park entry permit and TIMS card",
      "All ground transportation (Kathmandu–Sundarijal, Melamchi–Kathmandu)",
      "Airport transfers in private vehicle",
      "First aid medical kit"
    ],
    exclusions: [
      "International airfare to/from Kathmandu",
      "Nepal visa fee",
      "Travel insurance",
      "Alcoholic and cold beverages",
      "Personal trekking gear",
      "Tips for guide, porters, and hotel staff"
    ]
  },
];
