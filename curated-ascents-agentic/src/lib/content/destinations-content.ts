/**
 * Sub-Region Destination Content
 * Static content for 16 sub-region destination pages
 */

export interface SubRegionDestination {
  slug: string;
  country: string;
  countryName: string;
  name: string;
  heroImage: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  content: string;
  highlights: { title: string; description: string; icon: string }[];
  bestTimeToVisit: string;
  sampleItineraries: { name: string; slug: string; duration: string }[];
  luxuryAccommodations: { name: string; description: string; priceRange: string }[];
  relatedDestinations: { name: string; country: string; slug: string }[];
  chatPrompt: string;
}

export const subRegionDestinations: SubRegionDestination[] = [
  // ─── Nepal (5) ──────────────────────────────────────────────────────────────
  {
    slug: "everest-region",
    country: "nepal",
    countryName: "Nepal",
    name: "Everest Region",
    heroImage: "/uploads/media/nepal/landscape/everest-region-everest-view-hotel-eed54c67.webp",
    metaTitle: "Everest Region Luxury Trek | CuratedAscents",
    metaDescription: "Experience the Everest region in luxury. Private helicopter transfers, premium lodges, and expert Sherpa guides for the ultimate Himalayan adventure.",
    keywords: ["everest base camp luxury trek", "everest region nepal", "luxury everest trek", "khumbu valley", "namche bazaar", "tengboche monastery"],
    content: `The Everest region, known locally as the Khumbu, is the crown jewel of Himalayan adventure. Home to the world's highest peak and the legendary Sherpa people, this remote corner of eastern Nepal delivers an experience that transcends ordinary trekking. From the bustling trading post of Namche Bazaar perched on a horseshoe-shaped ridge to the spiritual sanctuary of Tengboche Monastery framed by Ama Dablam's soaring peak, every step reveals a landscape of staggering grandeur.

Our luxury approach to the Everest region redefines high-altitude travel. Helicopter transfers from Kathmandu to Lukla eliminate the unpredictable mountain flights, while premium lodges along the trail offer heated rooms, hot showers, and gourmet meals prepared by trained chefs. Private dining tents at higher camps feature locally sourced ingredients elevated to fine-dining standards, and personal porters ensure you trek with nothing more than a daypack.

The Khumbu's cultural tapestry is as rich as its scenery. Ancient monasteries dot the hillsides, their prayer flags sending blessings into the thin air. The Sherpa communities that call this region home have a warmth and resilience born from generations of living alongside the world's highest mountains. Visit during the autumn festival of Mani Rimdu at Tengboche to witness masked dances that have been performed for centuries.

Beyond the classic Everest Base Camp route, the region offers extraordinary side trips. The turquoise lakes of Gokyo provide a quieter alternative with equally spectacular Everest views. The challenging Three Passes route connects the region's major valleys for the ambitious trekker, while helicopter excursions offer bird's-eye panoramas of the entire Khumbu glacier system.

For those seeking the pinnacle of achievement, Island Peak (6,189m) offers a technically accessible climbing experience with professional mountaineering guides. Our luxury expeditions include full climbing support, premium base camp facilities, and satellite communication throughout.

The Everest region is not merely a destination — it is a pilgrimage to the roof of the world, where the boundary between earth and sky dissolves into a vast theatre of ice and stone that has captivated explorers for over a century.`,
    highlights: [
      { title: "Everest Base Camp", description: "Stand at the foot of the world's highest peak at 5,364m with panoramic views of the Khumbu Icefall", icon: "mountain" },
      { title: "Tengboche Monastery", description: "Visit the most important monastery in the Khumbu, set against the dramatic backdrop of Ama Dablam", icon: "temple" },
      { title: "Namche Bazaar", description: "Explore the vibrant Sherpa trading town perched at 3,440m with stunning valley views", icon: "city" },
      { title: "Gokyo Lakes", description: "Discover five sacred turquoise lakes at over 4,700m with panoramic Himalayan views", icon: "lake" },
      { title: "Helicopter Panoramas", description: "Scenic helicopter flights offering bird's-eye views of Everest, Lhotse, and Makalu", icon: "helicopter" },
      { title: "Sherpa Culture", description: "Immerse yourself in the traditions of the legendary mountain people of the Khumbu", icon: "culture" },
    ],
    bestTimeToVisit: "October–November for clear skies and peak visibility; March–May for rhododendron blooms and warmer temperatures",
    sampleItineraries: [
      { name: "Everest Base Camp Luxury Trek", slug: "everest-base-camp-luxury-trek", duration: "14 days" },
      { name: "Gokyo Lakes Luxury Trek", slug: "gokyo-lakes-luxury-trek", duration: "12 days" },
      { name: "Everest Three Passes Luxury", slug: "everest-three-passes-luxury", duration: "18 days" },
    ],
    luxuryAccommodations: [
      { name: "Everest View Hotel", description: "The world's highest luxury hotel at 3,880m with panoramic Everest views from every room", priceRange: "$350–500/night" },
      { name: "Yeti Mountain Home, Namche", description: "Premium lodge with heated rooms, hot showers, and a gourmet restaurant in the heart of Namche", priceRange: "$250–400/night" },
      { name: "Yeti Mountain Home, Kongde", description: "Secluded luxury lodge on a ridge with unobstructed views of Everest, Lhotse, and Ama Dablam", priceRange: "$300–450/night" },
    ],
    relatedDestinations: [
      { name: "Annapurna", country: "nepal", slug: "annapurna" },
      { name: "Upper Mustang", country: "nepal", slug: "upper-mustang" },
      { name: "Everest North Face", country: "tibet", slug: "everest-north-face" },
    ],
    chatPrompt: "I'm interested in a luxury trek to the Everest region. Can you help me plan an itinerary?",
  },
  {
    slug: "annapurna",
    country: "nepal",
    countryName: "Nepal",
    name: "Annapurna",
    heroImage: "/uploads/media/nepal/landscape/annapurna-region-1c948b82.webp",
    metaTitle: "Annapurna Luxury Trek | CuratedAscents",
    metaDescription: "Trek the Annapurna region in luxury. From Poon Hill sunrise to Tilicho Lake, experience Nepal's most diverse landscapes with premium lodges and expert guides.",
    keywords: ["annapurna luxury trek", "annapurna circuit", "annapurna base camp", "poon hill trek", "nepal trekking luxury", "thorong la pass"],
    content: `The Annapurna region is Nepal's most diverse trekking destination, offering an extraordinary range of landscapes within a single journey. From subtropical bamboo forests and cascading rice terraces to alpine meadows and glacial moraines, the Annapurna massif compresses the world's ecosystems into one spectacular corridor. The iconic Annapurna Circuit, often called the greatest long-distance trek on Earth, circumnavigates the entire massif through a kaleidoscope of cultures, climates, and terrain.

The region's accessibility makes it ideal for luxury trekking. The trail network is well-developed, with premium lodges positioned at key points along the major routes. Unlike more remote regions, the Annapurna area offers consistent comfort standards, allowing travellers to experience genuine wilderness without sacrificing quality. Hot stone baths, locally brewed craft beers, and multi-course meals featuring regional specialities await at the end of each day's walk.

The Annapurna Base Camp trek leads into a natural amphitheatre surrounded by 7,000m and 8,000m peaks — a cathedral of ice and rock that few places on Earth can rival. At sunrise, the sanctuary transforms into a canvas of gold and crimson as the first light strikes the summit of Annapurna I (8,091m), the tenth highest mountain in the world.

Poon Hill, accessible on a shorter three-to-five-day trek, delivers one of the Himalayas' most celebrated sunrise panoramas. The pre-dawn climb to the viewpoint at 3,210m rewards early risers with a 360-degree panorama stretching from Dhaulagiri to Manaslu. This route passes through traditional Gurung and Magar villages where homestay experiences offer intimate cultural encounters.

The region's hidden gem is Tilicho Lake, one of the highest lakes in the world at 4,919m. Reached via a dramatic trail above the Annapurna Circuit, its ice-blue waters reflect the surrounding peaks in a scene of haunting beauty. The Manang Valley below offers a Tibetan-influenced culture distinct from the rest of Nepal, with whitewashed monasteries and yak-herding communities.

For those seeking challenge, the Thorong La Pass (5,416m) on the Annapurna Circuit remains one of trekking's greatest achievements — a high-altitude crossing that transitions from Hindu lowlands to Buddhist highlands in a single breathtaking day.`,
    highlights: [
      { title: "Annapurna Base Camp", description: "Trek into the spectacular glacial sanctuary surrounded by 8,000m peaks", icon: "mountain" },
      { title: "Poon Hill Sunrise", description: "Witness a legendary Himalayan sunrise over Dhaulagiri and the Annapurna range", icon: "sunrise" },
      { title: "Tilicho Lake", description: "Visit one of the world's highest lakes at 4,919m with stunning alpine scenery", icon: "lake" },
      { title: "Gurung Villages", description: "Experience the warm hospitality and rich culture of Nepal's Gurung communities", icon: "culture" },
      { title: "Thorong La Pass", description: "Cross the iconic 5,416m pass connecting the Marsyangdi and Kali Gandaki valleys", icon: "mountain" },
      { title: "Hot Springs", description: "Soak in natural hot springs at Tatopani and Jhinu after days on the trail", icon: "spa" },
    ],
    bestTimeToVisit: "October–November for clear views and comfortable temperatures; March–April for rhododendron forests in bloom",
    sampleItineraries: [
      { name: "Annapurna Circuit Luxury", slug: "annapurna-circuit-luxury", duration: "16 days" },
      { name: "Annapurna Base Camp Luxury", slug: "annapurna-base-camp-luxury", duration: "12 days" },
      { name: "Poon Hill Luxury Trek", slug: "poon-hill-luxury-trek", duration: "5 days" },
    ],
    luxuryAccommodations: [
      { name: "Tiger Mountain Pokhara Lodge", description: "Award-winning eco-lodge overlooking Pokhara Valley with Annapurna panoramas", priceRange: "$400–600/night" },
      { name: "Ker & Downey Nepal Lodges", description: "Boutique trekking lodges along the Annapurna trail with gourmet dining", priceRange: "$250–400/night" },
      { name: "Manang Heritage Lodge", description: "Premium lodge in the Manang Valley with Tibetan-influenced architecture and heated rooms", priceRange: "$200–350/night" },
    ],
    relatedDestinations: [
      { name: "Everest Region", country: "nepal", slug: "everest-region" },
      { name: "Pokhara", country: "nepal", slug: "pokhara" },
      { name: "Upper Mustang", country: "nepal", slug: "upper-mustang" },
    ],
    chatPrompt: "I'd like to plan a luxury trek in the Annapurna region. What are my best options?",
  },
  {
    slug: "chitwan",
    country: "nepal",
    countryName: "Nepal",
    name: "Chitwan",
    heroImage: "/uploads/media/nepal/landscape/chitwan1-226dd288.webp",
    metaTitle: "Chitwan Luxury Safari | CuratedAscents",
    metaDescription: "Luxury wildlife safari in Chitwan National Park, Nepal. Track one-horned rhinos, Bengal tigers, and exotic birds from world-class jungle lodges.",
    keywords: ["chitwan national park safari", "luxury nepal safari", "one horned rhino", "bengal tiger nepal", "chitwan luxury lodge", "nepal wildlife"],
    content: `Chitwan National Park, a UNESCO World Heritage Site in Nepal's subtropical Terai lowlands, offers a wildlife experience that rivals the great African safaris. Covering 952 square kilometres of dense sal forests, grasslands, and riverine habitats, Chitwan is home to one of the world's largest populations of the endangered greater one-horned rhinoceros and a growing population of Bengal tigers.

A luxury safari in Chitwan is an immersive experience far removed from the mountains that Nepal is famous for. World-class jungle lodges set on the banks of the Rapti River provide an elegant base from which to explore the park. Private guides with decades of tracking experience lead guests on elephant-back safaris, jeep excursions, and guided nature walks through the jungle. The park's network of watchtowers and hides allows patient observers to witness rare encounters with sloth bears, wild elephants, and gharial crocodiles.

Chitwan's birdlife is extraordinary, with over 550 species recorded within the park boundaries. The winter months attract migratory birds from as far as Siberia, making it one of Asia's premier birding destinations. Dedicated birding guides can arrange early-morning expeditions to spot everything from the Bengal florican to the giant hornbill.

The indigenous Tharu people have lived in harmony with Chitwan's forests for centuries. Their unique culture, expressed through traditional stick dances, distinctive mud-walled houses, and a cuisine built around wild greens and river fish, offers a cultural dimension that enriches the wildlife experience. Luxury lodges arrange private Tharu village visits and cultural performances that provide genuine insight into this fascinating community.

Beyond the standard safari activities, Chitwan offers canoeing on the Rapti River — a serene way to observe riverside wildlife including mugger crocodiles and water monitors. Sunset canoe trips are particularly magical, with the jungle silhouette reflected in golden water as birds return to roost.

A three-to-four-day stay is ideal to fully appreciate Chitwan's diversity. Combined with a Himalayan trek, it creates the perfect contrast — from the world's highest mountains to its richest lowland forests within a single journey.`,
    highlights: [
      { title: "Rhino Tracking", description: "Track the endangered greater one-horned rhinoceros on jeep and walking safaris", icon: "wildlife" },
      { title: "Bengal Tiger Safari", description: "Expert-guided expeditions into tiger territory with one of Nepal's best sighting rates", icon: "wildlife" },
      { title: "River Canoeing", description: "Glide down the Rapti River spotting crocodiles, river dolphins, and over 550 bird species", icon: "boat" },
      { title: "Tharu Culture", description: "Experience the unique traditions, dances, and cuisine of the indigenous Tharu people", icon: "culture" },
      { title: "Elephant Encounters", description: "Ethical elephant interactions at the park's breeding centre and rehabilitation facilities", icon: "wildlife" },
      { title: "Birding Paradise", description: "Over 550 bird species including the rare Bengal florican and giant hornbill", icon: "bird" },
    ],
    bestTimeToVisit: "October–March for dry season and best wildlife viewing; February–March for optimal tiger sighting conditions",
    sampleItineraries: [
      { name: "Chitwan Luxury Safari", slug: "chitwan-luxury-safari", duration: "4 days" },
      { name: "Kathmandu Valley Cultural Tour", slug: "kathmandu-valley-cultural-tour", duration: "5 days" },
    ],
    luxuryAccommodations: [
      { name: "Meghauli Serai (Taj)", description: "Taj's luxury safari lodge on the banks of the Rapti River with private plunge pools", priceRange: "$500–800/night" },
      { name: "Kasara Chitwan Resort", description: "Heritage-style resort combining colonial charm with modern luxury amid the jungle", priceRange: "$350–550/night" },
      { name: "Barahi Jungle Lodge", description: "Boutique eco-lodge with spacious suites overlooking Chitwan's buffer zone forests", priceRange: "$250–400/night" },
    ],
    relatedDestinations: [
      { name: "Pokhara", country: "nepal", slug: "pokhara" },
      { name: "Annapurna", country: "nepal", slug: "annapurna" },
      { name: "Darjeeling", country: "india", slug: "darjeeling" },
    ],
    chatPrompt: "I'd love to experience a luxury wildlife safari in Chitwan. Can you create an itinerary for me?",
  },
  {
    slug: "pokhara",
    country: "nepal",
    countryName: "Nepal",
    name: "Pokhara",
    heroImage: "/uploads/media/nepal/landscape/pokhara1-bce37d73.webp",
    metaTitle: "Pokhara Luxury Travel | CuratedAscents",
    metaDescription: "Discover Pokhara, Nepal's lakeside paradise. Luxury resorts, Annapurna views, paragliding, and world-class adventure from Nepal's most beautiful city.",
    keywords: ["pokhara luxury travel", "pokhara nepal", "phewa lake", "sarangkot sunrise", "paragliding pokhara", "nepal adventure"],
    content: `Pokhara is Nepal's undisputed jewel of natural beauty — a lakeside city cradled in a lush valley where the subtropical lowlands meet the Himalayan wall. The Annapurna range rises directly from the valley floor in one of the most dramatic mountain-to-lowland transitions anywhere on Earth. Phewa Lake, the city's glittering centrepiece, mirrors the snow-capped peaks in its still waters, creating a scene that has enchanted travellers for decades.

As the gateway to the Annapurna region, Pokhara serves as both a starting point for epic treks and a destination in its own right. Luxury resorts perched on ridges above the lake offer private balconies with unobstructed views of Machhapuchchhre (Fishtail), Annapurna South, and the entire Annapurna massif. These properties combine world-class hospitality with the tranquility of a setting that few luxury destinations can match.

Sarangkot, the hilltop viewpoint above Pokhara, delivers one of the Himalayas' most accessible sunrise experiences. A short drive or hike leads to a panoramic vantage point where dawn paints the Annapurna range in shades of rose and gold. Sarangkot is also the launch point for Pokhara's famous paragliding — tandem flights that soar above Phewa Lake with the Himalayas as a backdrop create memories that last a lifetime.

The city's adventure credentials extend far beyond paragliding. Ultra-light aircraft flights offer aerial tours of the Annapurna range, while zip-lining, bungee jumping, and white-water rafting on the Seti and Trisuli rivers deliver adrenaline in abundance. For a gentler pace, kayaking on Phewa Lake or cycling through the surrounding countryside reveals Pokhara's rural charm.

The lakeside precinct offers a sophisticated yet relaxed atmosphere. Farm-to-table restaurants serve Nepali cuisine elevated to fine-dining standards, artisan shops showcase local craftsmanship, and yoga retreats draw wellness seekers from around the world. The International Mountain Museum provides a fascinating overview of Himalayan mountaineering history and the region's diverse ethnic cultures.

Pokhara rewards those who linger. Two to three days allows time to absorb the city's unique energy — a blend of adventure, relaxation, and mountain grandeur that makes it one of Asia's most compelling destinations.`,
    highlights: [
      { title: "Phewa Lake", description: "Kayak or sail on the tranquil lake with mirror reflections of the Annapurna range", icon: "lake" },
      { title: "Sarangkot Sunrise", description: "Watch dawn illuminate the Annapurna massif from the famous hilltop viewpoint", icon: "sunrise" },
      { title: "Paragliding", description: "Tandem paragliding flights soaring above Phewa Lake with Himalayan panoramas", icon: "adventure" },
      { title: "Peace Pagoda", description: "Visit the hilltop World Peace Pagoda with sweeping views of the valley and mountains", icon: "temple" },
      { title: "Adventure Sports", description: "Ultra-light flights, zip-lining, bungee jumping, and white-water rafting", icon: "adventure" },
      { title: "Farm-to-Table Dining", description: "Pokhara's emerging culinary scene with Nepali cuisine elevated to luxury standards", icon: "dining" },
    ],
    bestTimeToVisit: "October–November and March–April for clear mountain views; December–February for crisp winter skies and fewer crowds",
    sampleItineraries: [
      { name: "Pokhara Adventure Luxury", slug: "pokhara-adventure-luxury", duration: "5 days" },
      { name: "Poon Hill Luxury Trek", slug: "poon-hill-luxury-trek", duration: "5 days" },
      { name: "Annapurna Base Camp Luxury", slug: "annapurna-base-camp-luxury", duration: "12 days" },
    ],
    luxuryAccommodations: [
      { name: "Tiger Mountain Pokhara Lodge", description: "Award-winning eco-lodge on a ridge with uninterrupted Annapurna panoramas", priceRange: "$400–600/night" },
      { name: "Temple Tree Resort & Spa", description: "Boutique resort in Lakeside with lush gardens, infinity pool, and mountain views", priceRange: "$250–400/night" },
      { name: "Pavilions Himalayas Lakeside", description: "All-villa luxury resort overlooking Phewa Lake with private plunge pools", priceRange: "$350–550/night" },
    ],
    relatedDestinations: [
      { name: "Annapurna", country: "nepal", slug: "annapurna" },
      { name: "Chitwan", country: "nepal", slug: "chitwan" },
      { name: "Everest Region", country: "nepal", slug: "everest-region" },
    ],
    chatPrompt: "I'd like to plan a luxury stay in Pokhara with mountain views and adventure activities. What do you recommend?",
  },
  {
    slug: "upper-mustang",
    country: "nepal",
    countryName: "Nepal",
    name: "Upper Mustang",
    heroImage: "/uploads/media/nepal/landscape/mustang1-ba9e0d8c.webp",
    metaTitle: "Upper Mustang Luxury Trek | CuratedAscents",
    metaDescription: "Explore the forbidden kingdom of Upper Mustang. Ancient Buddhist monasteries, dramatic desert landscapes, and the walled city of Lo Manthang on a luxury trek.",
    keywords: ["upper mustang trek", "lo manthang", "forbidden kingdom nepal", "mustang luxury trek", "nepal restricted area", "tibetan culture nepal"],
    content: `Upper Mustang, Nepal's "Forbidden Kingdom," is one of the most extraordinary destinations in the Himalayas. Hidden behind the Annapurna and Dhaulagiri massifs in a dramatic rain-shadow desert, this former Tibetan kingdom was closed to foreigners until 1992 and remains one of the best-preserved examples of traditional Tibetan culture anywhere in the world. The landscape is utterly otherworldly — eroded canyons in shades of ochre, rust, and cream; wind-sculpted rock formations; and ancient cave dwellings carved into towering cliffs.

The trek to Lo Manthang, Mustang's medieval walled capital, follows the Kali Gandaki gorge — the deepest valley on Earth — through an ever-changing panorama of geological wonders. The trail passes through Tibetan Buddhist villages where life has changed little in centuries, with whitewashed monasteries, prayer walls, and chortens punctuating a landscape of austere beauty.

Lo Manthang itself is a revelation. The walled city, home to around 150 houses, contains four major monasteries with exquisite medieval wall paintings that rival anything in Tibet. The former royal palace, recently restored, tells the story of a kingdom that maintained its independence for centuries through strategic alliances and geographical isolation. Visitors during the Tiji festival in May witness three days of spectacular masked dances that celebrate the triumph of good over evil.

The region's Buddhist heritage is profound. Sky caves — thousands of man-made cavities carved into cliff faces — have yielded archaeological treasures dating back two thousand years. Monastery visits reveal living traditions of Buddhist art, with monks practising sand mandala creation and thangka painting in styles unchanged for generations.

A luxury trek through Upper Mustang combines cultural immersion with genuine wilderness. Private camping with gourmet meals, comfortable sleeping arrangements, and dedicated support staff ensure that the remoteness of the terrain does not compromise the quality of the experience. The restricted-area permit system limits visitor numbers, preserving Mustang's authenticity and ensuring an intimate encounter with one of the Himalayas' last truly unspoilt destinations.

Upper Mustang is not just a trek — it is a journey through time to a world that has all but vanished elsewhere, where medieval traditions, dramatic geology, and Tibetan spirituality converge in a landscape of haunting beauty.`,
    highlights: [
      { title: "Lo Manthang", description: "Explore the medieval walled capital with ancient monasteries and royal palace", icon: "fortress" },
      { title: "Sky Caves", description: "Discover ancient cave dwellings carved into dramatic cliff faces over two millennia ago", icon: "cave" },
      { title: "Kali Gandaki Gorge", description: "Trek through the deepest valley on Earth between Annapurna and Dhaulagiri", icon: "mountain" },
      { title: "Desert Landscapes", description: "Witness otherworldly eroded canyons and wind-sculpted rock formations", icon: "landscape" },
      { title: "Tibetan Monasteries", description: "Visit living Buddhist monasteries with medieval wall paintings and active monastic communities", icon: "temple" },
      { title: "Tiji Festival", description: "Experience Mustang's spectacular three-day festival of masked dances (May)", icon: "festival" },
    ],
    bestTimeToVisit: "May–October, with May ideal for the Tiji Festival; June–September offers warm temperatures despite occasional monsoon rain",
    sampleItineraries: [
      { name: "Upper Mustang Luxury Trek", slug: "upper-mustang-luxury-trek", duration: "14 days" },
      { name: "Annapurna Circuit Luxury", slug: "annapurna-circuit-luxury", duration: "16 days" },
    ],
    luxuryAccommodations: [
      { name: "Shinta Mani Mustang", description: "Bensley Collection ultra-luxury lodge by Bill Bensley — 29 suites with private balconies, spa, and curated cultural excursions in the heart of Mustang", priceRange: "$1,500–3,000/night" },
      { name: "Lo Mustang", description: "Boutique heritage lodge in Lo Manthang's walled city with restored medieval architecture, rooftop terrace, and locally sourced Mustangi cuisine", priceRange: "$250–450/night" },
      { name: "Luxury Tented Camps", description: "Private expedition-style camps with heated tents, gourmet dining, hot showers, and panoramic canyon views", priceRange: "$300–500/night" },
    ],
    relatedDestinations: [
      { name: "Annapurna", country: "nepal", slug: "annapurna" },
      { name: "Lhasa", country: "tibet", slug: "lhasa" },
      { name: "Ladakh", country: "india", slug: "ladakh" },
    ],
    chatPrompt: "I'm fascinated by Upper Mustang's forbidden kingdom. Can you plan a luxury trek for me?",
  },

  // ─── Bhutan (3) ─────────────────────────────────────────────────────────────
  {
    slug: "paro-valley",
    country: "bhutan",
    countryName: "Bhutan",
    name: "Paro Valley",
    heroImage: "/uploads/media/bhutan/landscape/bhutan-taktsang-monastery-969e982e.webp",
    metaTitle: "Paro Valley Luxury Travel | CuratedAscents",
    metaDescription: "Visit Bhutan's Paro Valley in luxury. Tiger's Nest Monastery, ancient dzongs, rice paddies, and premium hotels in the kingdom's most beautiful valley.",
    keywords: ["paro valley bhutan", "tigers nest monastery", "taktsang monastery", "paro luxury hotel", "bhutan luxury travel", "paro dzong"],
    content: `The Paro Valley is Bhutan's most iconic destination and the first impression most visitors receive of the Thunder Dragon Kingdom. As the only international airport in the country, Paro delivers a dramatic arrival — aircraft thread through narrow mountain valleys before touching down on a runway flanked by rice paddies and ancient watchtowers. From this first moment, Paro announces itself as a place where natural beauty and cultural heritage exist in perfect harmony.

The valley's centrepiece is Taktsang Monastery — the Tiger's Nest — arguably the most photographed and spiritually significant site in all of Bhutan. Clinging impossibly to a sheer cliff face 900 metres above the valley floor, Taktsang is said to be the meditation site of Guru Rinpoche, who flew to the cliff on the back of a tigress in the 8th century. The hike to the monastery is Bhutan's essential experience, winding through blue pine forests decorated with prayer flags before arriving at a complex of temples that seems to defy gravity.

Paro Dzong (Rinpung Dzong), the massive fortress-monastery that dominates the valley, is one of Bhutan's finest examples of traditional architecture. Its towering whitewashed walls, intricate woodwork, and active monastic community offer insight into Bhutan's unique fusion of governance and religion. The traditional cantilever bridge that leads to the dzong is one of the most photographed structures in the country.

The valley's luxury hotels rank among Asia's finest. Properties like Amankora Paro and COMO Uma Paro combine contemporary design with traditional Bhutanese architecture, offering spa treatments, private dining, and cultural programming that reveals the valley's deeper dimensions. Hot stone baths — a uniquely Bhutanese wellness tradition — use river stones heated over fire and placed in wooden tubs to create a deeply relaxing experience.

Beyond the main attractions, the Paro Valley rewards exploration. The ruins of Drukgyel Dzong, destroyed by fire in 1951, offer views of Mount Chomolhari. The National Museum, housed in an ancient watchtower, contains a collection of textiles, thangkas, and artefacts that illuminate Bhutanese history. Rural farmhouses dot the rice paddies, and homestay experiences provide intimate encounters with Bhutanese family life.

Paro is the gateway to Bhutan, but it is far more than a transit point. Two to three days in the valley allow travellers to absorb its unique combination of dramatic scenery, living Buddhist culture, and world-class hospitality.`,
    highlights: [
      { title: "Tiger's Nest Monastery", description: "Hike to the iconic Taktsang Monastery clinging to a cliff 900m above the valley", icon: "temple" },
      { title: "Paro Dzong", description: "Explore the magnificent Rinpung Dzong fortress-monastery with its ornate woodwork", icon: "fortress" },
      { title: "Hot Stone Baths", description: "Experience Bhutan's unique wellness tradition using river stones heated over fire", icon: "spa" },
      { title: "Drukgyel Dzong", description: "Visit the dramatic ruins with views of sacred Mount Chomolhari (7,326m)", icon: "fortress" },
      { title: "Rice Paddy Walks", description: "Stroll through the valley's emerald rice terraces and traditional farmhouses", icon: "landscape" },
      { title: "Archery Matches", description: "Watch or participate in Bhutan's national sport at local archery grounds", icon: "culture" },
    ],
    bestTimeToVisit: "March–May for spring blooms and clear skies; September–November for autumn festivals and harvest season",
    sampleItineraries: [
      { name: "Bhutan Cultural Discovery", slug: "bhutan-cultural-discovery", duration: "8 days" },
      { name: "Jomolhari Luxury Trek", slug: "jomolhari-luxury-trek", duration: "10 days" },
      { name: "Druk Path Luxury Trek", slug: "druk-path-luxury-trek", duration: "7 days" },
    ],
    luxuryAccommodations: [
      { name: "Amankora Paro", description: "Aman's ultra-luxury lodge set in a blue pine forest with mountain views and private suites", priceRange: "$1,200–2,000/night" },
      { name: "COMO Uma Paro", description: "Contemporary luxury with Bhutanese character, featuring a COMO Shambhala spa", priceRange: "$600–1,000/night" },
      { name: "Le Méridien Paro Riverfront", description: "Modern luxury hotel on the banks of the Paro River with mountain panoramas", priceRange: "$350–550/night" },
    ],
    relatedDestinations: [
      { name: "Thimphu", country: "bhutan", slug: "thimphu" },
      { name: "Punakha", country: "bhutan", slug: "punakha" },
      { name: "Everest Region", country: "nepal", slug: "everest-region" },
    ],
    chatPrompt: "I'd like to plan a luxury trip to Bhutan's Paro Valley, including the Tiger's Nest hike. Can you help?",
  },
  {
    slug: "thimphu",
    country: "bhutan",
    countryName: "Bhutan",
    name: "Thimphu",
    heroImage: "/uploads/media/bhutan/landscape/bhutan-thimphu-31af7533.webp",
    metaTitle: "Thimphu Luxury Travel | CuratedAscents",
    metaDescription: "Explore Thimphu, Bhutan's charming capital. No traffic lights, thriving arts scene, ancient monasteries, and luxury hotels in the world's most unique capital city.",
    keywords: ["thimphu bhutan", "bhutan capital", "tashichho dzong", "buddha dordenma", "bhutan luxury", "bhutan arts crafts"],
    content: `Thimphu holds the distinction of being the world's only capital city without a single traffic light — a fact that perfectly encapsulates Bhutan's determination to modernise on its own terms. Nestled in a valley at 2,320m, Bhutan's capital is a fascinating blend of ancient traditions and contemporary culture, where monks in crimson robes share the streets with young entrepreneurs, and medieval fortress-monasteries overlook a growing cityscape of painted wooden buildings.

The city's spiritual heart is Tashichho Dzong, the imposing fortress-monastery that serves as both the seat of government and the summer residence of the central monastic body. Its immaculate whitewashed walls, golden roofs, and elaborate courtyard host some of Bhutan's most important ceremonies. During the annual Thimphu Tshechu, the dzong comes alive with costumed dancers performing sacred rituals that date back centuries.

Above the city, the massive Buddha Dordenma statue — one of the largest in the world at 51 metres — sits in serene meditation overlooking the valley. The bronze and gold figure contains 125,000 smaller Buddha statues and offers panoramic views of Thimphu from its hilltop perch. It is both a pilgrimage site and a remarkable feat of devotional engineering.

Thimphu's cultural offerings are remarkably rich for a city of its size. The Institute of Zorig Chusum (School of Thirteen Arts) teaches traditional Bhutanese arts from painting to woodcarving. The National Textile Museum showcases the kingdom's extraordinary weaving heritage, with some textiles taking over a year to complete. Weekend markets along the Wang River offer local produce, handcrafts, and street food that provides a genuine taste of Bhutanese daily life.

The city's emerging dining scene surprises visitors with its sophistication. Restaurants serving contemporary Bhutanese cuisine alongside international fare have elevated Thimphu beyond its modest reputation. The national dish, ema datshi (chillies in cheese sauce), reaches its finest expression in the capital's better restaurants.

For nature lovers, Thimphu offers the Motithang Takin Preserve, home to Bhutan's national animal — the takin, a peculiar goat-antelope found nowhere else. Hiking trails in the surrounding hills provide exercise with mountain views, and the short drive to Dochula Pass reveals one of Bhutan's most spectacular panoramas.`,
    highlights: [
      { title: "Tashichho Dzong", description: "Visit the grand fortress-monastery that serves as Bhutan's seat of government", icon: "fortress" },
      { title: "Buddha Dordenma", description: "Stand before one of the world's largest Buddha statues with panoramic valley views", icon: "temple" },
      { title: "Thirteen Arts School", description: "Watch artisans practising Bhutan's traditional arts of painting, weaving, and carving", icon: "culture" },
      { title: "Weekend Market", description: "Browse local produce, handcrafts, and textiles at the vibrant riverside market", icon: "market" },
      { title: "Thimphu Tshechu", description: "Experience the capital's annual religious festival with masked dances and ceremonies", icon: "festival" },
      { title: "Dochula Pass", description: "Short drive to 108 memorial chortens with sweeping Himalayan panoramas", icon: "mountain" },
    ],
    bestTimeToVisit: "September–November for the Thimphu Tshechu and autumn clarity; March–May for mild weather and spring blooms",
    sampleItineraries: [
      { name: "Bhutan Cultural Discovery", slug: "bhutan-cultural-discovery", duration: "8 days" },
      { name: "Punakha–Gangtey Luxury", slug: "punakha-gangtey-luxury", duration: "7 days" },
      { name: "Bumthang Cultural Luxury", slug: "bumthang-cultural-luxury", duration: "9 days" },
    ],
    luxuryAccommodations: [
      { name: "Amankora Thimphu", description: "Aman's intimate forest lodge with suites surrounded by blue pines above the city", priceRange: "$1,200–1,800/night" },
      { name: "Taj Tashi Thimphu", description: "Grand luxury hotel blending Bhutanese architecture with Taj's signature hospitality", priceRange: "$400–700/night" },
      { name: "Terma Linca Resort", description: "Traditional-style resort on the Wang River with spacious rooms and cultural programming", priceRange: "$250–450/night" },
    ],
    relatedDestinations: [
      { name: "Paro Valley", country: "bhutan", slug: "paro-valley" },
      { name: "Punakha", country: "bhutan", slug: "punakha" },
      { name: "Lhasa", country: "tibet", slug: "lhasa" },
    ],
    chatPrompt: "I want to explore Thimphu and experience Bhutanese culture. Can you plan a luxury itinerary?",
  },
  {
    slug: "punakha",
    country: "bhutan",
    countryName: "Bhutan",
    name: "Punakha",
    heroImage: "/uploads/media/bhutan/landscape/bhutan5-e11981bd.webp",
    metaTitle: "Punakha Luxury Travel | CuratedAscents",
    metaDescription: "Visit Punakha, Bhutan's ancient capital. The stunning Punakha Dzong, fertile rice valleys, and luxury lodges in one of Bhutan's most beautiful regions.",
    keywords: ["punakha bhutan", "punakha dzong", "bhutan ancient capital", "chimi lhakhang", "bhutan rice valley", "bhutan luxury lodge"],
    content: `Punakha, Bhutan's ancient winter capital, occupies one of the most beautiful settings in the Himalayas. Located at the confluence of the Mo Chhu (Mother River) and Pho Chhu (Father River) at a relatively low elevation of 1,200m, Punakha enjoys a mild subtropical climate that makes it Bhutan's most fertile valley. Terraced rice paddies glow emerald green in summer and golden at harvest, framed by forested mountains that rise steeply on all sides.

The Punakha Dzong is widely regarded as the most beautiful building in Bhutan — and one of the most beautiful in all of Asia. Completed in 1638 by Zhabdrung Ngawang Namgyal, the dzong sits majestically at the junction of the two rivers, its whitewashed walls, ornate woodwork, and soaring utse (central tower) creating a scene of extraordinary grace. The dzong serves as the winter residence of Bhutan's central monastic body, and its interior contains some of the kingdom's finest examples of Buddhist art.

The valley's spiritual significance extends beyond the dzong. Chimi Lhakhang, the "Temple of the Divine Madman," perched on a hill amid rice paddies, is one of Bhutan's most beloved pilgrimage sites. Dedicated to Drukpa Kunley, the unconventional 15th-century saint known for his outrageous behaviour and earthy wisdom, the temple draws couples seeking fertility blessings and visitors charmed by the story of Bhutan's most colourful religious figure.

Punakha's natural environment is markedly different from the rest of Bhutan. The warm, humid climate supports tropical vegetation including bougainvillea, jacaranda, and banana palms that lend the valley an almost Mediterranean feel. In winter, the critically endangered black-necked cranes migrate to the Phobjikha Valley nearby — a spectacle celebrated with the annual Black-Necked Crane Festival.

Adventure seekers are rewarded with white-water rafting on the Mo Chhu and Pho Chhu rivers, which offer class II-IV rapids depending on the season. Hiking trails through the valley lead to remote monasteries and villages that see few tourists, providing authentic encounters with rural Bhutanese life.

Luxury lodges in the Punakha Valley offer some of Bhutan's most refined accommodations. Properties overlooking the rice paddies or perched above the river valley provide a tranquil base from which to explore this enchanting region. A two-to-three-day stay allows visitors to fully appreciate Punakha's unique combination of architectural beauty, spiritual heritage, and natural splendour.`,
    highlights: [
      { title: "Punakha Dzong", description: "Visit Bhutan's most beautiful dzong at the confluence of two rivers", icon: "fortress" },
      { title: "Chimi Lhakhang", description: "Walk through rice paddies to the charming Temple of the Divine Madman", icon: "temple" },
      { title: "River Rafting", description: "White-water rafting on the Mo Chhu and Pho Chhu rivers through pristine valleys", icon: "adventure" },
      { title: "Rice Valley Walks", description: "Stroll through fertile terraces with subtropical vegetation and mountain views", icon: "landscape" },
      { title: "Khamsum Yulley Namgyal Chorten", description: "Hike to this ornate hilltop temple with panoramic views of the Punakha Valley", icon: "temple" },
      { title: "Black-Necked Cranes", description: "Spot the endangered cranes in nearby Phobjikha Valley (November–March)", icon: "bird" },
    ],
    bestTimeToVisit: "October–December for harvest season and crane migration; March–May for spring blooms and warm weather",
    sampleItineraries: [
      { name: "Punakha–Gangtey Luxury", slug: "punakha-gangtey-luxury", duration: "7 days" },
      { name: "Bhutan Cultural Discovery", slug: "bhutan-cultural-discovery", duration: "8 days" },
      { name: "Nepal–Bhutan Combo Luxury", slug: "nepal-bhutan-combo-luxury", duration: "14 days" },
    ],
    luxuryAccommodations: [
      { name: "Amankora Punakha", description: "Aman's intimate farmhouse-style lodge set amid rice paddies and citrus orchards", priceRange: "$1,200–1,800/night" },
      { name: "COMO Uma Punakha", description: "Riverside luxury with contemporary suites, COMO Shambhala spa, and valley views", priceRange: "$600–900/night" },
      { name: "Dhensa Boutique Resort", description: "Elegant hillside resort overlooking the Punakha Valley with traditional Bhutanese design", priceRange: "$350–550/night" },
    ],
    relatedDestinations: [
      { name: "Paro Valley", country: "bhutan", slug: "paro-valley" },
      { name: "Thimphu", country: "bhutan", slug: "thimphu" },
      { name: "Sikkim", country: "india", slug: "sikkim" },
    ],
    chatPrompt: "I'm interested in visiting Punakha and seeing the famous dzong. Can you create a luxury Bhutan itinerary?",
  },

  // ─── India (5) ──────────────────────────────────────────────────────────────
  {
    slug: "ladakh",
    country: "india",
    countryName: "India",
    name: "Ladakh",
    heroImage: "/uploads/media/india/landscape/rajasthan-india-60507acf.webp",
    metaTitle: "Ladakh Luxury Travel | CuratedAscents",
    metaDescription: "Explore Ladakh in luxury. Ancient Buddhist monasteries, high-altitude lakes, dramatic mountain passes, and exclusive glamping in India's last Shangri-La.",
    keywords: ["ladakh luxury travel", "leh ladakh", "pangong lake", "nubra valley", "ladakh monastery", "india himalayan luxury"],
    content: `Ladakh, India's "Land of High Passes," is a high-altitude desert kingdom that feels like stepping onto another planet. Perched between the Karakoram and Himalayan ranges in India's northernmost reaches, Ladakh's stark beauty — turquoise lakes, barren mountains streaked with mineral colours, and vast open skies — creates landscapes of almost surreal intensity. This is one of the last places on Earth where traditional Tibetan Buddhist culture thrives unbroken, with centuries-old monasteries crowning dramatic hilltops above ancient trading routes.

The capital, Leh, sits at 3,500m in the Indus Valley, its old town a labyrinth of narrow lanes, whitewashed houses, and the ruins of a former royal palace modelled on the Potala in Lhasa. The modern town blends Ladakhi, Tibetan, and Indian influences in a cosmopolitan atmosphere that belies its remote location. Luxury hotels have arrived in Leh, offering contemporary comfort with traditional Ladakhi architecture and views of the Stok Kangri range.

Ladakh's monasteries are its spiritual jewels. Hemis, the largest and wealthiest monastery in the region, houses a renowned collection of thangkas and hosts the annual Hemis Festival. Thiksey, dramatically perched on a hilltop resembling a miniature Potala Palace, offers dawn prayers accompanied by the deep resonance of ceremonial horns. Lamayuru, one of the oldest monasteries, sits amid a "moonscape" of eroded badlands that seems to belong to a science-fiction film.

Pangong Lake, extending 134 kilometres along the India-China border at 4,350m, is Ladakh's most mesmerising natural wonder. Its waters shift through impossible shades of blue throughout the day, creating a spectacle that defies photography. Luxury glamping on its shores — available only during the summer season — offers an exclusive experience in one of the world's most remote settings.

The Nubra Valley, reached via the Khardung La pass (one of the world's highest motorable roads), reveals a hidden world of sand dunes, double-humped Bactrian camels, and the ancient Diskit Monastery overlooking the Shyok River. This former Silk Road trading route retains an atmosphere of timeless isolation.

The drive from Manali to Leh, crossing multiple passes above 4,000m, is one of the world's great road journeys. For those arriving by air, the flight into Leh with its dramatic mountain approach is an experience in itself. Whichever way you arrive, Ladakh demands time for acclimatisation — and rewards it with experiences available nowhere else.`,
    highlights: [
      { title: "Pangong Lake", description: "Marvel at the colour-shifting waters of this 134km lake at 4,350m on the India-China border", icon: "lake" },
      { title: "Hemis Monastery", description: "Visit Ladakh's largest monastery with its renowned art collection and annual festival", icon: "temple" },
      { title: "Thiksey Monastery", description: "Attend dawn prayers at this dramatic hilltop monastery resembling a miniature Potala Palace", icon: "temple" },
      { title: "Nubra Valley", description: "Explore sand dunes, Bactrian camels, and ancient monasteries on the former Silk Road", icon: "landscape" },
      { title: "Khardung La Pass", description: "Cross one of the world's highest motorable roads at over 5,300m", icon: "mountain" },
      { title: "Luxury Glamping", description: "Exclusive lakeside and valley camping with premium amenities in stunning settings", icon: "camp" },
    ],
    bestTimeToVisit: "June–September for accessible passes and warm days; July–August for Hemis Festival; September for autumn colours",
    sampleItineraries: [
      { name: "Ladakh Monastery Luxury", slug: "ladakh-monastery-luxury", duration: "10 days" },
      { name: "Golden Triangle Luxury", slug: "golden-triangle-luxury", duration: "8 days" },
    ],
    luxuryAccommodations: [
      { name: "The Grand Dragon Ladakh", description: "Leh's premier luxury hotel with heated rooms, fine dining, and Stok range views", priceRange: "$300–500/night" },
      { name: "Chamba Camp Thiksey", description: "TUTC's luxury glamping with heritage-style tents, butler service, and monastery views", priceRange: "$600–900/night" },
      { name: "Nimmu House", description: "Restored Ladakhi heritage manor overlooking the Zanskar–Indus confluence", priceRange: "$250–400/night" },
    ],
    relatedDestinations: [
      { name: "Lhasa", country: "tibet", slug: "lhasa" },
      { name: "Upper Mustang", country: "nepal", slug: "upper-mustang" },
      { name: "Sikkim", country: "india", slug: "sikkim" },
    ],
    chatPrompt: "I'd like to experience Ladakh in luxury — monasteries, Pangong Lake, and Nubra Valley. Can you plan a trip?",
  },
  {
    slug: "sikkim",
    country: "india",
    countryName: "India",
    name: "Sikkim",
    heroImage: "/uploads/media/india/landscape/sikkim-kanchenjunga-south-peak-a6ca0d74.webp",
    metaTitle: "Sikkim Luxury Travel | CuratedAscents",
    metaDescription: "Discover Sikkim's Himalayan beauty. Kanchenjunga views, ancient monasteries, alpine lakes, and luxury lodges in India's most pristine mountain state.",
    keywords: ["sikkim luxury travel", "kanchenjunga", "gangtok", "pelling sikkim", "gurudongmar lake", "india himalayan state"],
    content: `Sikkim is India's best-kept Himalayan secret — a tiny state wedged between Nepal, Tibet, and Bhutan that packs an extraordinary diversity of landscapes, cultures, and experiences into its modest geography. Dominated by Kanchenjunga, the world's third-highest peak, Sikkim rises from subtropical forests teeming with orchids and butterflies to glacial valleys and frozen lakes above 5,000m. It is India's least populated state, its most ecologically rich, and arguably its most beautiful.

Gangtok, the capital, occupies a dramatic ridge at 1,650m with views of the Kanchenjunga range on clear days. The city balances modernity with tradition — MG Marg, the pedestrianised main street, is lined with cafés and shops, while the surrounding monasteries and viewpoints remind visitors of Sikkim's deep Buddhist heritage. The Namgyal Institute of Tibetology houses one of the world's finest collections of Tibetan Buddhist scholarship.

Pelling, on the western slopes facing Kanchenjunga, offers what many consider the finest mountain panorama in India. The 360-degree views from the recently completed Pelling Skywalk are breathtaking, encompassing not just Kanchenjunga but an unbroken wall of peaks extending into Nepal and Tibet. Nearby Pemayangtse Monastery, one of Sikkim's oldest, contains a remarkable seven-tiered painted wooden model of heaven.

North Sikkim is the state's wild frontier. Gurudongmar Lake, at 5,183m one of the highest lakes in the world, is sacred to both Buddhists and Sikhs and remains partially unfrozen even in deepest winter. The journey there, through yak-grazing meadows and past military checkpoints, is an adventure in itself. The remote Lachen and Lachung valleys offer pristine alpine landscapes with rhododendron forests, hot springs, and waterfalls.

Sikkim's biodiversity is staggering. Over 600 species of orchids, 36 species of rhododendrons, and snow leopards, red pandas, and Himalayan black bears make it a naturalist's paradise. The state's commitment to organic farming has made it India's first fully organic state, and this philosophy extends to a growing eco-tourism sector that prioritises sustainability.

A luxury journey through Sikkim typically combines Gangtok, Pelling, and either North Sikkim or the Silk Route through eastern Sikkim. Eight to ten days allows a thorough exploration of this extraordinary state, which increasingly draws discerning travellers seeking authenticity away from India's more trafficked routes.`,
    highlights: [
      { title: "Kanchenjunga Views", description: "Witness India's most spectacular mountain panorama — the world's third-highest peak", icon: "mountain" },
      { title: "Gurudongmar Lake", description: "Visit one of the world's highest lakes at 5,183m, sacred to Buddhists and Sikhs", icon: "lake" },
      { title: "Pelling Skywalk", description: "Walk the glass-floored skywalk with 360-degree views of the Kanchenjunga range", icon: "adventure" },
      { title: "Pemayangtse Monastery", description: "Explore one of Sikkim's oldest monasteries with its extraordinary seven-tiered wooden model of heaven", icon: "temple" },
      { title: "Orchid Sanctuaries", description: "Discover over 600 orchid species in one of the world's richest biodiversity hotspots", icon: "flower" },
      { title: "Organic Cuisine", description: "Taste India's first fully organic state through farm-to-table dining experiences", icon: "dining" },
    ],
    bestTimeToVisit: "March–May for rhododendron blooms and clear skies; October–November for crystal-clear mountain views",
    sampleItineraries: [
      { name: "Darjeeling–Sikkim Luxury", slug: "darjeeling-sikkim-luxury", duration: "10 days" },
      { name: "Ladakh Monastery Luxury", slug: "ladakh-monastery-luxury", duration: "10 days" },
    ],
    luxuryAccommodations: [
      { name: "Mayfair Spa Resort, Gangtok", description: "Sikkim's premier luxury hotel with panoramic mountain views and full-service spa", priceRange: "$200–400/night" },
      { name: "Elgin Nor-Khill, Gangtok", description: "Heritage property that was once the royal guesthouse, blending colonial and Sikkimese style", priceRange: "$150–300/night" },
      { name: "The Denzong Regency, Pelling", description: "Boutique hotel with unobstructed Kanchenjunga views and Sikkimese hospitality", priceRange: "$120–250/night" },
    ],
    relatedDestinations: [
      { name: "Darjeeling", country: "india", slug: "darjeeling" },
      { name: "Ladakh", country: "india", slug: "ladakh" },
      { name: "Paro Valley", country: "bhutan", slug: "paro-valley" },
    ],
    chatPrompt: "I'd like to explore Sikkim's monasteries and mountain views in luxury. Can you design a trip?",
  },
  {
    slug: "darjeeling",
    country: "india",
    countryName: "India",
    name: "Darjeeling",
    heroImage: "/uploads/media/india/landscape/darjeeling-tea-estate-316ce3a6.webp",
    metaTitle: "Darjeeling Luxury Travel | CuratedAscents",
    metaDescription: "Experience Darjeeling in luxury. World-famous tea estates, Kanchenjunga sunrise, the heritage Toy Train, and colonial charm in India's most elegant hill station.",
    keywords: ["darjeeling luxury travel", "darjeeling tea estate", "toy train darjeeling", "tiger hill sunrise", "kanchenjunga view", "india hill station luxury"],
    content: `Darjeeling, the "Queen of the Hills," is India's most romantic hill station — a place where colonial grandeur, world-famous tea, and Himalayan splendour converge in an atmosphere of timeless elegance. Perched on a ridge at 2,042m in the easternmost Himalayas, Darjeeling offers views of Kanchenjunga and the Singalila Range that have inspired artists, writers, and travellers since the British established it as a summer retreat in the 1850s.

The town's most celebrated tradition is its tea. Darjeeling produces the "Champagne of Teas" — a delicate muscatel-flavoured first flush that commands premium prices at auction worldwide. Luxury tea tourism offers private visits to heritage estates where guests walk through meticulously maintained gardens, observe the hand-plucking process, and participate in cupping sessions guided by master tasters. Properties like Makaibari and Glenburn offer overnight stays that immerse visitors in the tea-making process from dawn harvest to afternoon tasting.

Tiger Hill, reached by a pre-dawn jeep ride or walk, delivers one of the subcontinent's most extraordinary sunrise experiences. As darkness lifts, the entire eastern Himalayan range materialises — Kanchenjunga dominates the scene, while on exceptionally clear days, Everest itself is visible 200 kilometres to the west. The sight of first light touching the world's third-highest peak is worth any early alarm.

The Darjeeling Himalayan Railway, affectionately known as the "Toy Train," is a UNESCO World Heritage marvel. Built in 1881, this narrow-gauge railway climbs through loop-upon-loop of track with mountain scenery that unfolds like a scroll painting. The journey from New Jalpaiguri to Darjeeling takes eight hours, but shorter joyrides to Ghum and Batasia Loop capture the essential experience.

Darjeeling's cultural fabric weaves together Nepali, Tibetan, Bengali, and British influences. The town's Buddhist monasteries, colonial churches, and Hindu temples coexist along winding lanes lined with Victorian-era buildings. The Himalayan Mountaineering Institute, founded by Tenzing Norgay, and the Tibetan Refugee Self-Help Centre provide fascinating cultural stops.

The town's dining and accommodation have evolved considerably. Heritage hotels restored to their colonial splendour offer afternoon tea on terraces overlooking Kanchenjunga, while newer boutique properties bring contemporary design to traditional settings. The emerging craft brewery and café scene adds a modern dimension to Darjeeling's enduring charm.`,
    highlights: [
      { title: "Tea Estate Tours", description: "Private tours of heritage tea gardens with cupping sessions guided by master tasters", icon: "tea" },
      { title: "Tiger Hill Sunrise", description: "Witness Kanchenjunga ignite at dawn with the entire eastern Himalayan range visible", icon: "sunrise" },
      { title: "Toy Train", description: "Ride the UNESCO World Heritage Darjeeling Himalayan Railway through mountain loops", icon: "train" },
      { title: "Kanchenjunga Views", description: "Enjoy the world's third-highest peak as a dramatic backdrop to daily life", icon: "mountain" },
      { title: "Colonial Heritage", description: "Explore Victorian-era architecture, churches, and the Raj-era atmosphere", icon: "heritage" },
      { title: "Mountaineering Institute", description: "Visit the HMI founded by Tenzing Norgay with Everest memorabilia and training exhibits", icon: "mountain" },
    ],
    bestTimeToVisit: "March–May for first flush tea season and clear views; October–November for autumn clarity and post-monsoon freshness",
    sampleItineraries: [
      { name: "Darjeeling–Sikkim Luxury", slug: "darjeeling-sikkim-luxury", duration: "10 days" },
      { name: "Golden Triangle Luxury", slug: "golden-triangle-luxury", duration: "8 days" },
    ],
    luxuryAccommodations: [
      { name: "Glenburn Tea Estate", description: "Luxury plantation stay with private tea garden walks, river picnics, and mountain views", priceRange: "$400–700/night" },
      { name: "Mayfair Darjeeling", description: "Heritage hotel with colonial character, panoramic terraces, and spa facilities", priceRange: "$200–400/night" },
      { name: "Makaibari Tea Estate", description: "Iconic organic tea estate offering immersive stays in a working plantation", priceRange: "$250–450/night" },
    ],
    relatedDestinations: [
      { name: "Sikkim", country: "india", slug: "sikkim" },
      { name: "Ladakh", country: "india", slug: "ladakh" },
      { name: "Pokhara", country: "nepal", slug: "pokhara" },
    ],
    chatPrompt: "I'd love a luxury tea estate experience in Darjeeling. Can you plan an itinerary with mountain views?",
  },

  {
    slug: "rajasthan",
    country: "india",
    countryName: "India",
    name: "Rajasthan",
    heroImage: "/uploads/media/india/landscape/udaipur-rajasthan-india-17d99ac2.webp",
    metaTitle: "Rajasthan Luxury Travel | CuratedAscents",
    metaDescription: "Experience royal Rajasthan in luxury. Magnificent palaces, desert safaris, vibrant bazaars, and heritage hotels in India's most colourful state.",
    keywords: ["rajasthan luxury travel", "jaipur luxury hotel", "udaipur palace", "jaisalmer desert safari", "rajasthan heritage hotel", "golden triangle india"],
    content: `Rajasthan is India at its most magnificent — a land of warrior kings, desert fortresses, and palaces so opulent they seem conjured from a fairy tale. Stretching across northwestern India from the Thar Desert to the Aravalli Hills, this vast state delivers a sensory experience unlike anywhere else on Earth. Every city is a different shade: Jaipur the Pink City, Jodhpur the Blue City, Udaipur the White City, Jaisalmer the Golden City. Together they form a route through India's most extraordinary cultural landscape.

Jaipur, the state capital, sets the tone with the Hawa Mahal (Palace of Winds), the Amber Fort perched on a Rajput hilltop, and the City Palace complex where the royal family still resides. The city's bazaars overflow with gemstones, block-printed textiles, and traditional Rajasthani jewellery — a paradise for discerning shoppers. Luxury hotels within converted palaces allow guests to sleep like maharajas, with private butlers, rooftop dining, and views over the old walled city.

Udaipur, often called the Venice of the East, floats around a series of interconnected lakes framed by the Aravalli Hills. The Lake Palace, a white marble confection appearing to hover on Lake Pichola, is one of the world's most romantic hotels. The City Palace, a sprawling complex of courtyards, towers, and terraces, is the largest in Rajasthan and offers panoramic views that have inspired artists for centuries.

Jaisalmer rises from the Thar Desert like a golden mirage. Its living fort — one of the few in the world still inhabited — contains havelis decorated with intricate stone latticework that filters sunlight into geometric patterns. Desert camps in the surrounding dunes offer luxury safari experiences: camel rides at sunset, Rajasthani folk music under star-filled skies, and dawn balloon flights over the sand sea.

Ranthambore, Rajasthan's premier wildlife destination, combines Bengal tiger safaris with the romantic ruins of a thousand-year-old fort. Private jeep safaris led by expert naturalists offer some of India's best chances of spotting the elusive tiger in its natural habitat. Luxury lodges on the park's periphery blend seamlessly into the landscape.

A luxury Rajasthan journey typically spans eight to twelve days, connecting Jaipur, Jodhpur, Udaipur, and Jaisalmer by private car with a driver-guide. The heritage hotel network — converted forts, palaces, and havelis — ensures that every overnight stay is an experience in itself. This is India's golden circuit: a journey through history, colour, and royal grandeur that no amount of photography can adequately capture.`,
    highlights: [
      { title: "Amber Fort", description: "Explore the magnificent hilltop fortress overlooking Jaipur with its mirror palace and courtyards", icon: "fortress" },
      { title: "Lake Palace Udaipur", description: "Visit the iconic white marble palace floating on Lake Pichola — one of the world's most romantic hotels", icon: "palace" },
      { title: "Jaisalmer Fort", description: "Walk through the living golden fort rising from the Thar Desert, still home to 3,000 residents", icon: "fortress" },
      { title: "Desert Safari", description: "Luxury tented camps in the Thar Desert with camel rides, folk music, and star-lit dining", icon: "camp" },
      { title: "Ranthambore Tigers", description: "Private jeep safaris in search of Bengal tigers amid ancient fort ruins", icon: "wildlife" },
      { title: "Palace Hotels", description: "Sleep in converted royal palaces with private butlers, rooftop dining, and heritage splendour", icon: "heritage" },
    ],
    bestTimeToVisit: "October–March for cool, comfortable weather; November–February ideal for desert camping and tiger safaris",
    sampleItineraries: [
      { name: "Golden Triangle Luxury", slug: "golden-triangle-luxury", duration: "8 days" },
      { name: "Rajasthan Royal Heritage", slug: "rajasthan-royal-heritage", duration: "12 days" },
    ],
    luxuryAccommodations: [
      { name: "Taj Lake Palace, Udaipur", description: "Iconic white marble palace floating on Lake Pichola with world-class dining and spa", priceRange: "$600–1,200/night" },
      { name: "Rambagh Palace, Jaipur", description: "Former residence of the Maharaja of Jaipur, now a Taj luxury hotel with 78 acres of gardens", priceRange: "$500–1,000/night" },
      { name: "Suján Rajmahal Palace, Jaipur", description: "Boutique palace hotel with 16 individually designed rooms blending heritage and contemporary art", priceRange: "$400–800/night" },
    ],
    relatedDestinations: [
      { name: "Ladakh", country: "india", slug: "ladakh" },
      { name: "Kerala", country: "india", slug: "kerala" },
      { name: "Darjeeling", country: "india", slug: "darjeeling" },
    ],
    chatPrompt: "I'd love a luxury Rajasthan tour — palaces, desert safaris, and tiger spotting. Can you plan an itinerary?",
  },
  {
    slug: "kerala",
    country: "india",
    countryName: "India",
    name: "Kerala",
    heroImage: "/uploads/media/india/landscape/rajasthan-india-60507acf.webp",
    metaTitle: "Kerala Luxury Travel | CuratedAscents",
    metaDescription: "Discover Kerala in luxury. Tranquil backwaters, Ayurvedic retreats, spice plantations, and pristine beaches in India's tropical paradise.",
    keywords: ["kerala luxury travel", "kerala backwaters", "ayurveda kerala", "munnar tea estate", "alleppey houseboat", "india wellness retreat"],
    content: `Kerala, India's tropical southwestern coast, is a lush ribbon of palm-fringed waterways, misty hill stations, and golden beaches that has earned the title "God's Own Country." Stretching between the Western Ghats and the Arabian Sea, this slender state packs extraordinary diversity into its compact geography — from the cool tea plantations of Munnar to the languid backwaters of Alleppey and the Ayurvedic traditions that have drawn wellness seekers for millennia.

The Kerala backwaters are the state's most iconic experience. A network of 1,500 kilometres of interconnected canals, rivers, lakes, and lagoons, this watery labyrinth supports entire communities of fishermen, farmers, and toddy tappers. Luxury houseboats — converted traditional kettuvallam rice barges — cruise these waterways in supreme comfort, with private chefs preparing fresh seafood, local delicacies, and tropical fruit as the lush countryside glides past. An overnight houseboat journey from Alleppey is the quintessential Kerala experience.

Munnar, in the Western Ghats at 1,600m, offers a refreshing contrast. Endless carpets of tea plantations cascade across rolling hills in every shade of green, punctuated by colonial-era bungalows and waterfalls. Luxury tea estate stays immerse guests in the tea-making process — morning walks through the gardens, visits to the factory, and afternoon tastings of some of India's finest high-grown teas. The surrounding Eravikulam National Park is home to the endangered Nilgiri tahr and offers gentle trekking through pristine shola forests.

Kerala's Ayurvedic tradition is the most authentic in India. Luxury Ayurvedic resorts along the coast and in the hill country offer personalised wellness programmes developed by Vaidyas (traditional physicians) using techniques refined over 5,000 years. Treatments combine herbal medicines, therapeutic oils, yoga, and meditation in a holistic approach that addresses mind, body, and spirit. Programmes range from three-day introductions to three-week intensive detoxifications.

The Malabar Coast's beaches — particularly those around Kovalam and Varkala — offer the relaxation that bookends a Kerala journey. Clifftop restaurants, beachside spas, and boutique hotels provide a setting far removed from India's more commercial beach destinations. Fort Kochi, with its Chinese fishing nets, colonial architecture, and emerging art scene, adds cultural depth.

Periyar Wildlife Sanctuary, in the cardamom hills near Thekkady, offers boat safaris on a lake surrounded by pristine tropical forest. Wild elephants, gaur, and sambar deer are regularly spotted, while guided spice plantation walks reveal the origin of the cardamom, pepper, cinnamon, and cloves that once made this region the spice capital of the world.`,
    highlights: [
      { title: "Backwater Cruises", description: "Cruise the palm-fringed canals on a luxury houseboat with private chef and crew", icon: "boat" },
      { title: "Munnar Tea Estates", description: "Stay on a heritage tea plantation in the misty Western Ghats with factory visits and tastings", icon: "tea" },
      { title: "Ayurvedic Retreats", description: "Experience 5,000-year-old wellness traditions at world-class Ayurvedic resorts", icon: "spa" },
      { title: "Fort Kochi", description: "Explore the historic port town with Chinese fishing nets, colonial churches, and art galleries", icon: "heritage" },
      { title: "Periyar Wildlife", description: "Boat safari through tropical forest spotting wild elephants, gaur, and exotic birds", icon: "wildlife" },
      { title: "Spice Plantations", description: "Walk through cardamom, pepper, and cinnamon gardens in the aromatic hill country", icon: "flower" },
    ],
    bestTimeToVisit: "September–March for dry season; October–November for post-monsoon lushness; January–March for beach weather",
    sampleItineraries: [
      { name: "Kerala Backwaters Luxury", slug: "kerala-backwaters-luxury", duration: "8 days" },
      { name: "Golden Triangle Luxury", slug: "golden-triangle-luxury", duration: "8 days" },
    ],
    luxuryAccommodations: [
      { name: "Kumarakom Lake Resort", description: "Heritage luxury resort on Vembanad Lake with private pool villas and Ayurvedic spa", priceRange: "$300–600/night" },
      { name: "CGH Earth Spice Village, Thekkady", description: "Eco-luxury cottages amid a working spice plantation near Periyar Wildlife Sanctuary", priceRange: "$200–400/night" },
      { name: "Taj Malabar Resort & Spa, Kochi", description: "Heritage waterfront hotel overlooking Kochi harbour with pool, spa, and colonial charm", priceRange: "$250–500/night" },
    ],
    relatedDestinations: [
      { name: "Rajasthan", country: "india", slug: "rajasthan" },
      { name: "Darjeeling", country: "india", slug: "darjeeling" },
      { name: "Sikkim", country: "india", slug: "sikkim" },
    ],
    chatPrompt: "I'd love to experience Kerala's backwaters and Ayurvedic retreats in luxury. Can you create an itinerary?",
  },

  // ─── Tibet (2) ──────────────────────────────────────────────────────────────
  {
    slug: "lhasa",
    country: "tibet",
    countryName: "Tibet",
    name: "Lhasa",
    heroImage: "/uploads/media/tibet/landscape/potala-palace-lhasa-tibet-china-dd114557.webp",
    metaTitle: "Lhasa Luxury Travel | CuratedAscents",
    metaDescription: "Experience Lhasa in luxury. The Potala Palace, Jokhang Temple, Barkhor Circuit, and Tibetan monasteries in the spiritual heart of the Himalayas.",
    keywords: ["lhasa luxury travel", "potala palace", "jokhang temple", "barkhor lhasa", "tibet capital", "tibetan buddhism"],
    content: `Lhasa, the "Place of the Gods," is one of the world's most spiritually charged cities. At 3,650m on the Tibetan Plateau, the ancient capital of Tibet has been the heart of Tibetan Buddhist civilisation for over 1,300 years. Despite the profound changes of the past century, Lhasa retains an atmosphere of deep devotion — pilgrims prostrate along the Barkhor circuit, monks debate in monastery courtyards, and the Potala Palace rises above the city like a white-and-red cliff face of devotional architecture.

The Potala Palace, former winter residence of the Dalai Lama, is arguably the most impressive religious building on Earth. Rising thirteen stories from its rocky promontory, its 1,000 rooms contain chapels, throne rooms, and the gilded stupas of previous Dalai Lamas. The interior is a treasure house of Tibetan art — murals, thangkas, and sculptures spanning centuries of unbroken creative tradition. The palace's sheer scale and the devotion required to build it at this altitude inspire a sense of awe that transcends cultural boundaries.

The Jokhang Temple, Tibet's holiest site, sits at the heart of the old city. Founded in the 7th century to house a sacred statue of Buddha Shakyamuni brought from China, the temple is the destination for pilgrims from across the Tibetan world. The Barkhor, the ancient pilgrimage circuit surrounding the temple, is a living stream of devotion — a kilometre-long path where pilgrims, monks, and travellers orbit the sacred precinct alongside vendors selling prayer beads, incense, and religious artefacts.

Sera and Drepung monasteries, on the outskirts of Lhasa, were once among the largest in the world. Sera's famous debating courtyard — where monks engage in a dramatic, hand-clapping style of philosophical debate — provides one of Tibet's most dynamic cultural experiences. Drepung, which once housed over 10,000 monks, offers a quieter contemplative atmosphere with remarkable views over the Lhasa Valley.

Modern Lhasa offers comfortable luxury accommodation that makes the high-altitude experience manageable. Five-star hotels provide oxygen-enriched rooms, spa treatments using traditional Tibetan medicine, and restaurants serving both Tibetan and international cuisine. These properties serve as essential bases for acclimatisation — the first two days in Lhasa should be spent gently, allowing the body to adjust before venturing further into Tibet.

Lhasa is typically the starting point for journeys deeper into Tibet — to Everest North Base Camp, Mount Kailash, or the sacred lake of Namtso. But the city itself warrants three to four days of exploration, allowing time to absorb its spiritual intensity at a pace that respects both the altitude and the depth of what Lhasa has to offer.`,
    highlights: [
      { title: "Potala Palace", description: "Explore the towering 13-storey former residence of the Dalai Lama with 1,000 rooms", icon: "palace" },
      { title: "Jokhang Temple", description: "Visit Tibet's holiest temple, the spiritual heart of Tibetan Buddhism for over 1,300 years", icon: "temple" },
      { title: "Barkhor Circuit", description: "Walk the ancient pilgrimage route circling the Jokhang amid monks, pilgrims, and vendors", icon: "spiritual" },
      { title: "Sera Monastery Debates", description: "Watch monks engage in dramatic philosophical debates with hand-clapping and shouting", icon: "temple" },
      { title: "Drepung Monastery", description: "Explore one of Tibet's largest monasteries with remarkable Lhasa Valley views", icon: "temple" },
      { title: "Tibetan Cuisine", description: "Experience authentic Tibetan dishes — momos, thukpa, and butter tea — in atmospheric restaurants", icon: "dining" },
    ],
    bestTimeToVisit: "April–June and September–October for mild weather, clear skies, and comfortable acclimatisation conditions",
    sampleItineraries: [
      { name: "Lhasa Cultural Luxury Tour", slug: "lhasa-cultural-luxury-tour", duration: "6 days" },
      { name: "Kailash–Mansarovar Luxury", slug: "kailash-mansarovar-luxury", duration: "15 days" },
      { name: "Tibet–Nepal Overland Luxury", slug: "tibet-nepal-overland-luxury", duration: "10 days" },
    ],
    luxuryAccommodations: [
      { name: "St. Regis Lhasa Resort", description: "Ultra-luxury resort with oxygen-enriched rooms, Iridium Spa, and Potala Palace views", priceRange: "$400–800/night" },
      { name: "Shangri-La Lhasa", description: "Five-star comfort with traditional Tibetan decor, heated floors, and altitude support", priceRange: "$300–550/night" },
      { name: "Intercontinental Lhasa Paradise", description: "Premium resort with spacious grounds, multiple dining options, and a full spa", priceRange: "$250–450/night" },
    ],
    relatedDestinations: [
      { name: "Everest North Face", country: "tibet", slug: "everest-north-face" },
      { name: "Upper Mustang", country: "nepal", slug: "upper-mustang" },
      { name: "Ladakh", country: "india", slug: "ladakh" },
    ],
    chatPrompt: "I want to experience Lhasa's monasteries and the Potala Palace in luxury. Can you plan my Tibet trip?",
  },
  {
    slug: "everest-north-face",
    country: "tibet",
    countryName: "Tibet",
    name: "Everest North Face",
    heroImage: "/uploads/media/tibet/landscape/everest-base-camp-xigaze-china-96fb3c14.webp",
    metaTitle: "Everest North Face Luxury Tour | CuratedAscents",
    metaDescription: "Visit Everest's North Base Camp in Tibet. Dramatic Tibetan approach, Rongbuk Monastery, and exclusive luxury camping at the foot of the world's highest peak.",
    keywords: ["everest north base camp", "tibet everest", "rongbuk monastery", "everest luxury tour", "tibet adventure", "north face everest"],
    content: `The Tibetan approach to Mount Everest is one of the world's most epic journeys. Unlike the Nepali side's forested valleys, the North Face reveals Everest in its full dramatic majesty — a colossal pyramid of rock and ice rising above the arid Tibetan Plateau. The drive from Lhasa to Everest North Base Camp crosses the vast Tibetan landscape, passing through ancient towns, over high passes, and along river valleys before arriving at the foot of the world's highest mountain.

The route begins in Shigatse, Tibet's second-largest city and home to Tashilhunpo Monastery, the traditional seat of the Panchen Lama. This imposing complex contains some of the finest examples of Tibetan Buddhist art, including a 26-metre gilded statue of Maitreya Buddha. From Shigatse, the road winds through the Friendship Highway toward the Everest region, with increasingly dramatic views at every turn.

Rongbuk Monastery, at 5,009m the highest monastery in the world, stands as the last outpost of civilisation before Everest. Founded in 1902, this small but spiritually powerful monastery frames the North Face of Everest in a view that has become one of mountaineering's most iconic images. The monastery's guesthouse offers basic accommodation for those who want to spend the night closest to the mountain.

Everest North Base Camp (5,150m) sits on a vast glacial plain from which the mountain's full North Face rises in a wall of ice and rock that stretches skyward for nearly four vertical kilometres. The view is utterly different from the Nepal side — here, Everest appears as a solitary titan dominating the horizon. On clear days, you can observe the plume of snow that streams from the summit, driven by jet-stream winds of over 200 kilometres per hour.

Luxury expeditions to Everest North Base Camp combine the adventure with premium comfort. Private 4x4 vehicles with English-speaking guides and drivers navigate the route, while exclusive campsites offer heated tents, gourmet meals, portable oxygen for altitude management, and panoramic camp setups positioned for the best mountain views. Unlike basic public campsites, these private facilities transform the experience from endurance test to luxury adventure.

The journey typically takes four to five days from Lhasa, allowing proper acclimatisation with strategically placed overnight stops. The return can follow the same route or continue westward toward Kathmandu via the Friendship Bridge border crossing, creating a trans-Himalayan journey of extraordinary scope.`,
    highlights: [
      { title: "Everest North Base Camp", description: "Stand at 5,150m with the full North Face of Everest rising four kilometres above", icon: "mountain" },
      { title: "Rongbuk Monastery", description: "Visit the world's highest monastery at 5,009m with iconic Everest framing", icon: "temple" },
      { title: "Tashilhunpo Monastery", description: "Explore Shigatse's magnificent monastery with its 26-metre gilded Maitreya Buddha", icon: "temple" },
      { title: "Friendship Highway", description: "Travel one of the world's greatest road journeys across the Tibetan Plateau", icon: "road" },
      { title: "Luxury Camping", description: "Premium heated tents with gourmet dining and portable oxygen at base camp", icon: "camp" },
      { title: "Trans-Himalayan Crossing", description: "Optional continuation to Nepal via the historic Friendship Bridge border", icon: "adventure" },
    ],
    bestTimeToVisit: "April–June for pre-monsoon clarity and spring conditions; September–October for autumn views and stable weather",
    sampleItineraries: [
      { name: "Everest North Luxury Tour", slug: "everest-north-luxury-tour", duration: "8 days" },
      { name: "Tibet–Nepal Overland Luxury", slug: "tibet-nepal-overland-luxury", duration: "10 days" },
      { name: "Kailash–Mansarovar Luxury", slug: "kailash-mansarovar-luxury", duration: "15 days" },
    ],
    luxuryAccommodations: [
      { name: "St. Regis Lhasa Resort", description: "Ultra-luxury base in Lhasa before and after the Everest journey", priceRange: "$400–800/night" },
      { name: "Luxury Everest Camps", description: "Private heated tents with gourmet catering, oxygen support, and panoramic positioning", priceRange: "$500–800/night" },
      { name: "Shigatse Tashi Choeta Hotel", description: "Comfortable hotel in Shigatse near Tashilhunpo Monastery with altitude support", priceRange: "$150–250/night" },
    ],
    relatedDestinations: [
      { name: "Lhasa", country: "tibet", slug: "lhasa" },
      { name: "Everest Region", country: "nepal", slug: "everest-region" },
      { name: "Annapurna", country: "nepal", slug: "annapurna" },
    ],
    chatPrompt: "I want to see Everest from the Tibetan side with luxury camping. Can you plan the trip?",
  },
];

export function getSubRegionsByCountry(country: string): SubRegionDestination[] {
  return subRegionDestinations.filter((d) => d.country === country);
}

export function getSubRegion(country: string, slug: string): SubRegionDestination | undefined {
  return subRegionDestinations.find((d) => d.country === country && d.slug === slug);
}

export function getAllSubRegionParams(): { country: string; slug: string }[] {
  return subRegionDestinations.map((d) => ({ country: d.country, slug: d.slug }));
}
