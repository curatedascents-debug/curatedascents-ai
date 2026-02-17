import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  Calendar,
  Shield,
  Wallet,
  Phone,
  Compass,
  Luggage,
  Heart,
  MapPin,
} from "lucide-react";

interface DestinationData {
  slug: string;
  name: string;
  subtitle: string;
  overview: string;
  heroImage: string;
  highlights: { title: string; description: string }[];
  bestTimeToVisit: {
    recommended: string[];
    weather: Record<string, string>;
    crowds: Record<string, string>;
    prices: Record<string, string>;
  };
  gettingThere: string;
  gettingAround: string;
  culturalTips: { tip: string; explanation: string }[];
  packingList: Record<string, string[]>;
  healthAndSafety: string;
  moneyMatters: string;
  emergencyInfo: {
    police?: string;
    ambulance?: string;
    embassy?: string;
    hospitals?: string[];
  };
}

const destinationData: Record<string, DestinationData> = {
  nepal: {
    slug: "nepal",
    name: "Nepal",
    subtitle: "The Land of the Himalayas",
    overview:
      "Nepal, nestled between India and Tibet, is a land of incredible natural beauty and rich cultural heritage. From the towering peaks of the Himalayas, including Mount Everest, to the lush jungles of the Terai, Nepal offers diverse landscapes and experiences. The country is home to ancient temples, vibrant festivals, and some of the world's most renowned trekking routes. Whether you're seeking adventure, spirituality, or cultural immersion, Nepal delivers an unforgettable experience.",
    heroImage: "/uploads/media/nepal/landscape/everest-region-everest-view-hotel-eed54c67.webp",
    highlights: [
      { title: "Mount Everest", description: "The world's highest peak and ultimate mountaineering destination" },
      { title: "Kathmandu Valley", description: "UNESCO World Heritage temples and rich Newari culture" },
      { title: "Annapurna Circuit", description: "One of the world's best long-distance treks" },
      { title: "Chitwan National Park", description: "Wildlife sanctuary with rhinos, tigers, and elephants" },
      { title: "Pokhara", description: "Lakeside paradise with stunning mountain views" },
      { title: "Lumbini", description: "Birthplace of Buddha and sacred pilgrimage site" },
    ],
    bestTimeToVisit: {
      recommended: ["October", "November", "March", "April"],
      weather: { Spring: "Warm with rhododendron blooms, occasional rain", Summer: "Monsoon season with heavy rainfall", Autumn: "Clear skies, best mountain visibility", Winter: "Cold but clear, snow at higher elevations" },
      crowds: { Spring: "Moderate to high", Summer: "Low", Autumn: "Peak season", Winter: "Low to moderate" },
      prices: { Spring: "Moderate", Summer: "Low season rates", Autumn: "Peak season rates", Winter: "Moderate to low" },
    },
    gettingThere: "Tribhuvan International Airport (KTM) in Kathmandu is Nepal's main international gateway. Direct flights are available from major Asian cities including Delhi, Bangkok, Doha, and Singapore.",
    gettingAround: "Domestic flights connect Kathmandu to Pokhara, Lukla (Everest), and other destinations. Tourist buses run between major cities, while private vehicles with drivers offer flexibility.",
    culturalTips: [
      { tip: "Remove shoes before entering temples and homes", explanation: "Shoes are considered impure and removing them shows respect" },
      { tip: "Use your right hand for eating and giving", explanation: "The left hand is considered unclean in Nepali culture" },
      { tip: "Dress modestly at religious sites", explanation: "Cover shoulders and knees when visiting temples and monasteries" },
      { tip: "Ask permission before photographing people", explanation: "Many locals appreciate being asked first, especially monks and elderly" },
      { tip: "Walk clockwise around Buddhist monuments", explanation: "This follows the traditional circumambulation direction" },
    ],
    packingList: {
      Trekking: ["Sturdy hiking boots", "Layered clothing", "Down jacket", "Rain gear", "Sleeping bag liner", "Water purification", "Sunscreen SPF50+", "First aid kit"],
      Cultural: ["Modest clothing", "Comfortable walking shoes", "Light scarf for temples", "Sunglasses", "Daypack", "Camera"],
      General: ["Valid passport", "Travel insurance documents", "Copies of permits", "Cash in USD/local currency", "Power adapter", "Medications"],
    },
    healthAndSafety: "Altitude sickness is a concern above 2,500m — acclimatize slowly and stay hydrated. Drink only bottled or purified water. Travel insurance with emergency evacuation is essential for trekking.",
    moneyMatters: "The Nepali Rupee (NPR) is the local currency. ATMs are available in cities but rare in remote areas. Carry sufficient cash for treks. Credit cards accepted at hotels and larger restaurants in tourist areas. Tipping is customary — 10% at restaurants.",
    emergencyInfo: { police: "100", ambulance: "102", hospitals: ["CIWEC Hospital (Kathmandu)", "Grande International Hospital", "Manipal Teaching Hospital (Pokhara)"] },
  },
  bhutan: {
    slug: "bhutan",
    name: "Bhutan",
    subtitle: "The Land of the Thunder Dragon",
    overview:
      "Bhutan, the last great Himalayan kingdom, is a country that measures success by Gross National Happiness rather than GDP. Nestled between India and Tibet, this Buddhist kingdom has preserved its traditional culture while embracing sustainable development. From the iconic Tiger's Nest Monastery clinging to a cliff face to the pristine forests that cover 72% of the country, Bhutan offers a unique travel experience unlike anywhere else on Earth.",
    heroImage: "/uploads/media/bhutan/landscape/bhutan-taktsang-monastery2-1d1a0917.webp",
    highlights: [
      { title: "Tiger's Nest Monastery", description: "Iconic cliffside monastery, Bhutan's most sacred site" },
      { title: "Punakha Dzong", description: "Stunning fortress at the confluence of two rivers" },
      { title: "Thimphu", description: "The world's only capital without traffic lights" },
      { title: "Paro Valley", description: "Beautiful valley with ancient temples and rice paddies" },
      { title: "Dochula Pass", description: "108 memorial chortens with Himalayan panorama" },
      { title: "Traditional Festivals", description: "Colorful tshechus with masked dances" },
    ],
    bestTimeToVisit: {
      recommended: ["March", "April", "May", "September", "October", "November"],
      weather: { Spring: "Mild with rhododendron blooms", Summer: "Monsoon, heavy rain in south", Autumn: "Clear skies, festival season", Winter: "Cold, some areas snow-covered" },
      crowds: { Spring: "Festival season, moderate crowds", Summer: "Low season", Autumn: "Peak season", Winter: "Low season" },
      prices: { Spring: "Standard SDF rates", Summer: "Some discounts available", Autumn: "Peak rates", Winter: "Low season discounts" },
    },
    gettingThere: "Paro International Airport (PBH) is Bhutan's only international airport, served by Druk Air and Bhutan Airlines. Flights operate from Delhi, Kathmandu, Bangkok, and Singapore.",
    gettingAround: "All tourism in Bhutan is managed through licensed operators. A private guide, driver, and vehicle are included as part of the Sustainable Development Fee arrangement.",
    culturalTips: [
      { tip: "Dress code is strictly enforced", explanation: "Bhutanese wear traditional dress for official buildings; tourists should dress modestly" },
      { tip: "Photography may be restricted", explanation: "Ask before photographing inside dzongs and temples" },
      { tip: "Remove shoes and hats in temples", explanation: "Show respect by observing these customs" },
      { tip: "Walk clockwise around religious sites", explanation: "Follow Buddhist tradition when circumambulating" },
      { tip: "Avoid pointing at religious objects", explanation: "Use an open palm gesture instead of pointing" },
    ],
    packingList: {
      General: ["Warm layers", "Rain jacket", "Comfortable walking shoes", "Daypack", "Camera", "Sunscreen", "Hat", "Modest clothing"],
      Trekking: ["Hiking boots", "Down jacket", "Sleeping bag", "Trekking poles", "Water bottle", "Headlamp"],
    },
    healthAndSafety: "Altitude can affect visitors, especially on treks. Medical facilities are limited outside Thimphu. Comprehensive travel insurance with evacuation coverage is mandatory.",
    moneyMatters: "Bhutanese Ngultrum (BTN) is at par with Indian Rupee; both are accepted. The Sustainable Development Fee (SDF) of $200/day for tourists covers most costs. ATMs available in main towns.",
    emergencyInfo: { police: "113", ambulance: "110", hospitals: ["Jigme Dorji Wangchuck National Referral Hospital (Thimphu)"] },
  },
  tibet: {
    slug: "tibet",
    name: "Tibet",
    subtitle: "The Roof of the World",
    overview:
      "Tibet, perched on the highest plateau on Earth, offers a profound journey through ancient Buddhist culture and breathtaking landscapes. From the magnificent Potala Palace in Lhasa to the sacred Mount Kailash, Tibet's spiritual heritage runs deep. The region's otherworldly scenery — turquoise lakes, vast grasslands, and snow-capped peaks — combined with warm Tibetan hospitality creates an unforgettable experience.",
    heroImage: "/uploads/media/tibet/landscape/potala-palace-lhasa-tibet-china-dd114557.webp",
    highlights: [
      { title: "Potala Palace", description: "Former winter residence of the Dalai Lama, iconic symbol of Tibet" },
      { title: "Jokhang Temple", description: "Tibet's most sacred temple and pilgrimage destination" },
      { title: "Mount Everest North Base Camp", description: "The Tibetan side of the world's highest peak" },
      { title: "Mount Kailash", description: "Sacred to four religions, a profound pilgrimage circuit" },
      { title: "Namtso Lake", description: "One of the highest saltwater lakes in the world" },
      { title: "Shigatse & Tashilhunpo", description: "Second largest city and seat of the Panchen Lama" },
    ],
    bestTimeToVisit: {
      recommended: ["April", "May", "June", "September", "October"],
      weather: { Spring: "Warming up, occasional dust storms", Summer: "Peak season, some rain", Autumn: "Clear and dry, excellent visibility", Winter: "Very cold, some areas inaccessible" },
      crowds: { Spring: "Moderate", Summer: "High", Autumn: "Moderate to high", Winter: "Low" },
      prices: { Spring: "Moderate", Summer: "Peak rates", Autumn: "Moderate", Winter: "Lower rates, limited tours" },
    },
    gettingThere: "Most visitors fly to Lhasa Gonggar Airport from mainland China cities (Beijing, Chengdu, Xian). The Qinghai-Tibet Railway is a scenic alternative. All foreign tourists must have a Tibet Travel Permit.",
    gettingAround: "Private 4x4 vehicles with driver and guide are mandatory for foreign tourists. The guide will handle all permit checkpoints throughout your journey.",
    culturalTips: [
      { tip: "Respect religious customs", explanation: "Tibet is deeply Buddhist; show reverence at sacred sites" },
      { tip: "Walk clockwise around religious sites", explanation: "Follow the sun's path as per Buddhist tradition" },
      { tip: "Be sensitive with photography", explanation: "Avoid photos of military installations; ask permission at monasteries" },
      { tip: "Accept offered tea graciously", explanation: "Butter tea is customary; try a small amount even if unusual" },
      { tip: "Be politically sensitive", explanation: "Avoid discussions about sensitive political topics" },
    ],
    packingList: {
      General: ["Very warm layers", "Down jacket", "Sunglasses (UV protection)", "SPF 50+ sunscreen", "Lip balm", "Hand cream", "Water bottle"],
      Altitude: ["Altitude sickness medication (Diamox)", "Electrolytes", "Snacks", "Headache medication"],
    },
    healthAndSafety: "Altitude is a serious concern — Lhasa is at 3,650m. Spend at least 2-3 days acclimatizing before any strenuous activity. Drink lots of water and ascend gradually. Medical facilities are limited.",
    moneyMatters: "Chinese Yuan (CNY/RMB) is the currency. ATMs available in Lhasa; carry cash for remote areas. All tour costs must be pre-arranged through your tour operator.",
    emergencyInfo: { police: "110", ambulance: "120", hospitals: ["Tibet Autonomous Region People's Hospital (Lhasa)"] },
  },
  india: {
    slug: "india",
    name: "India",
    subtitle: "A Tapestry of Cultures, Landscapes & Legends",
    overview:
      "India, the world's most diverse subcontinent, offers an extraordinary range of luxury travel experiences — from the snow-capped Himalayas of Ladakh and the spiritual banks of the Ganges to the royal palaces of Rajasthan and the tranquil backwaters of Kerala. With over 5,000 years of unbroken civilization, India weaves together ancient temples, vibrant bazaars, world-class cuisine, and breathtaking natural beauty into journeys that are as enriching as they are exhilarating.",
    heroImage: "/uploads/media/india/landscape/jaipur-rajasthan-india-e33d82ba.webp",
    highlights: [
      { title: "Rajasthan's Royal Palaces", description: "Magnificent forts and heritage palace hotels across the Land of Kings" },
      { title: "Ladakh & the Himalayas", description: "High-altitude monasteries, pristine lakes, and dramatic mountain passes" },
      { title: "Kerala Backwaters", description: "Luxury houseboat cruises through palm-fringed waterways" },
      { title: "Rishikesh & Yoga", description: "World capital of yoga on the banks of the sacred Ganges" },
      { title: "Golden Triangle", description: "Delhi, Agra (Taj Mahal), and Jaipur — India's iconic cultural circuit" },
      { title: "Darjeeling & Tea Country", description: "Colonial hill stations, Himalayan panoramas, and world-famous tea estates" },
    ],
    bestTimeToVisit: {
      recommended: ["October", "November", "December", "January", "February", "March"],
      weather: { Spring: "Warming temperatures, wildflowers in the hills", Summer: "Hot in plains, pleasant in hill stations; monsoon June-September", Autumn: "Post-monsoon clarity, comfortable temperatures", Winter: "Cool and dry — ideal for most destinations" },
      crowds: { Spring: "Moderate", Summer: "Low in plains, high in hill stations", Autumn: "Rising, festival season", Winter: "Peak tourist season" },
      prices: { Spring: "Moderate", Summer: "Low season rates", Autumn: "Moderate to high", Winter: "Peak season rates" },
    },
    gettingThere: "India has multiple international gateways: Delhi (DEL), Mumbai (BOM), and Bangalore (BLR). Direct flights connect from all major global hubs. For Ladakh, domestic flights operate from Delhi to Leh.",
    gettingAround: "India has an extensive domestic flight network. Premium trains like Palace on Wheels offer luxury rail journeys. Private chauffeur-driven cars are the preferred touring option.",
    culturalTips: [
      { tip: "Remove shoes before entering temples and homes", explanation: "Footwear is considered impure at sacred and domestic spaces" },
      { tip: "Dress modestly at religious sites", explanation: "Cover shoulders and knees at temples, mosques, and gurudwaras" },
      { tip: "Use your right hand for eating and greetings", explanation: "The left hand is traditionally considered unclean" },
      { tip: "Greet with 'Namaste' (palms together)", explanation: "A respectful and universally understood greeting across India" },
      { tip: "Ask permission before photographing people", explanation: "Especially important at temples, with sadhus, and in rural areas" },
      { tip: "Bargain at markets but not at fixed-price shops", explanation: "Negotiation is expected at bazaars; start at 40-50% of quoted price" },
    ],
    packingList: {
      General: ["Lightweight cotton clothing", "Comfortable walking shoes", "Sun hat", "Sunscreen SPF50+", "Insect repellent", "Modest attire for temples", "Power adapter", "Reusable water bottle"],
      Himalayan: ["Warm layered clothing", "Down jacket", "Sturdy hiking boots", "UV-protection sunglasses", "Altitude sickness medication"],
      Cultural: ["Light scarf/shawl for temples", "Camera", "Daypack", "Hand sanitizer"],
    },
    healthAndSafety: "Drink only bottled or purified water. Travel insurance with medical evacuation is essential. Altitude sickness is a concern above 3,000m in Ladakh. Vaccinations for Hepatitis A, Typhoid, and Tetanus are recommended.",
    moneyMatters: "The Indian Rupee (INR) is the local currency. ATMs are widely available. Credit cards accepted at hotels and shops in tourist areas. Tipping is customary — 10% at restaurants, INR 200-500 per day for drivers and guides.",
    emergencyInfo: { police: "100", ambulance: "102 / 108", embassy: "Contact your country's embassy in New Delhi", hospitals: ["Max Super Speciality Hospital (New Delhi)", "Apollo Hospitals (multiple cities)", "Fortis Memorial Research Institute (Gurugram)"] },
  },
};

const countrySlugs = ["nepal", "bhutan", "tibet", "india"];

interface PageProps {
  params: Promise<{ country: string }>;
}

export async function generateStaticParams() {
  return countrySlugs.map((country) => ({ country }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { country } = await params;
  const dest = destinationData[country];
  if (!dest) return { title: "Destination Not Found | CuratedAscents" };

  return {
    title: `${dest.name} Travel Guide | CuratedAscents`,
    description: dest.overview.slice(0, 160),
    keywords: [`${dest.name.toLowerCase()} travel guide`, `${dest.name.toLowerCase()} luxury travel`, "himalayan adventure", dest.name.toLowerCase()],
    openGraph: {
      title: `${dest.name} Travel Guide | CuratedAscents`,
      description: dest.overview.slice(0, 160),
      type: "article",
      images: [{ url: dest.heroImage }],
    },
  };
}

export default async function DestinationDetailPage({ params }: PageProps) {
  const { country } = await params;
  const dest = destinationData[country];

  if (!dest) {
    notFound();
  }

  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] sm:h-[60vh] min-h-[400px]">
        <Image
          src={dest.heroImage}
          alt={`${dest.name} landscape`}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-navy via-luxury-navy/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-16">
          <div className="max-w-5xl mx-auto">
            <Link
              href="/destinations"
              className="inline-flex items-center gap-1 text-luxury-cream/60 text-sm hover:text-white transition-colors mb-4"
            >
              <ChevronLeft className="w-4 h-4" />
              All Destinations
            </Link>
            <span className="block text-luxury-gold text-sm font-medium tracking-[0.2em] uppercase mb-2">
              {dest.subtitle}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              {dest.name} Travel Guide
            </h1>
          </div>
        </div>
      </section>

      {/* Overview + Highlights */}
      <section className="py-12 sm:py-16 bg-luxury-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <h2 className="font-serif text-2xl font-bold text-luxury-navy mb-4">
                Overview
              </h2>
              <p className="text-luxury-charcoal/70 leading-relaxed">
                {dest.overview}
              </p>
            </div>
            <div className="bg-luxury-cream rounded-2xl p-6">
              <h3 className="font-serif text-lg font-bold text-luxury-navy mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-luxury-gold" />
                Best Time to Visit
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {dest.bestTimeToVisit.recommended.map((m) => (
                  <span key={m} className="px-2 py-1 bg-luxury-gold/10 text-luxury-gold text-xs rounded-full font-medium">
                    {m}
                  </span>
                ))}
              </div>
              <dl className="space-y-3 text-sm">
                {Object.entries(dest.bestTimeToVisit.weather).map(([season, desc]) => (
                  <div key={season}>
                    <dt className="text-luxury-charcoal/50">{season}</dt>
                    <dd className="text-luxury-navy">{desc}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-12 sm:py-16 bg-luxury-cream/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-navy mb-8 text-center">
            Highlights
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dest.highlights.map((h) => (
              <div
                key={h.title}
                className="bg-white rounded-xl p-6 border border-luxury-mist hover:border-luxury-gold/30 transition-colors"
              >
                <Compass className="w-8 h-8 text-luxury-gold mb-3" />
                <h3 className="font-serif text-lg font-bold text-luxury-navy mb-2">
                  {h.title}
                </h3>
                <p className="text-luxury-charcoal/60 text-sm">{h.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Getting There & Around */}
      <section className="py-12 sm:py-16 bg-luxury-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h2 className="font-serif text-xl font-bold text-luxury-navy mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-luxury-gold" />
                Getting There
              </h2>
              <p className="text-luxury-charcoal/70 text-sm leading-relaxed">{dest.gettingThere}</p>
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-luxury-navy mb-4 flex items-center gap-2">
                <Compass className="w-5 h-5 text-luxury-gold" />
                Getting Around
              </h2>
              <p className="text-luxury-charcoal/70 text-sm leading-relaxed">{dest.gettingAround}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cultural Tips */}
      <section className="py-12 sm:py-16 bg-luxury-cream/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl font-bold text-luxury-navy mb-8 flex items-center gap-2">
            <Heart className="w-6 h-6 text-luxury-gold" />
            Cultural Tips
          </h2>
          <div className="space-y-4">
            {dest.culturalTips.map((ct) => (
              <div key={ct.tip} className="bg-white rounded-xl p-5 border border-luxury-mist">
                <h3 className="text-luxury-navy font-medium mb-1">{ct.tip}</h3>
                <p className="text-luxury-charcoal/60 text-sm">{ct.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packing List */}
      <section className="py-12 sm:py-16 bg-luxury-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl font-bold text-luxury-navy mb-8 flex items-center gap-2">
            <Luggage className="w-6 h-6 text-luxury-gold" />
            Packing List
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(dest.packingList).map(([category, items]) => (
              <div key={category} className="bg-luxury-cream rounded-xl p-5">
                <h3 className="font-medium text-luxury-navy mb-3">{category}</h3>
                <ul className="space-y-1.5">
                  {items.map((item) => (
                    <li key={item} className="text-luxury-charcoal/60 text-sm flex items-start gap-2">
                      <span className="text-luxury-gold mt-1.5 text-[6px]">&#9679;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Health, Safety & Money */}
      <section className="py-12 sm:py-16 bg-luxury-cream/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h2 className="font-serif text-xl font-bold text-luxury-navy mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-luxury-gold" />
                Health & Safety
              </h2>
              <p className="text-luxury-charcoal/70 text-sm leading-relaxed">{dest.healthAndSafety}</p>
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-luxury-navy mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-luxury-gold" />
                Money Matters
              </h2>
              <p className="text-luxury-charcoal/70 text-sm leading-relaxed">{dest.moneyMatters}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Info */}
      <section className="py-12 sm:py-16 bg-luxury-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-xl font-bold text-luxury-navy mb-6 flex items-center gap-2">
            <Phone className="w-5 h-5 text-luxury-gold" />
            Emergency Information
          </h2>
          <div className="bg-red-50 rounded-xl p-6 border border-red-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              {dest.emergencyInfo.police && (
                <div>
                  <dt className="text-red-800/60 mb-1">Police</dt>
                  <dd className="text-red-900 font-medium">{dest.emergencyInfo.police}</dd>
                </div>
              )}
              {dest.emergencyInfo.ambulance && (
                <div>
                  <dt className="text-red-800/60 mb-1">Ambulance</dt>
                  <dd className="text-red-900 font-medium">{dest.emergencyInfo.ambulance}</dd>
                </div>
              )}
              {dest.emergencyInfo.embassy && (
                <div className="sm:col-span-3">
                  <dt className="text-red-800/60 mb-1">Embassy</dt>
                  <dd className="text-red-900 font-medium">{dest.emergencyInfo.embassy}</dd>
                </div>
              )}
            </div>
            {dest.emergencyInfo.hospitals && dest.emergencyInfo.hospitals.length > 0 && (
              <div className="mt-4 pt-4 border-t border-red-200">
                <dt className="text-red-800/60 mb-2 text-sm">Recommended Hospitals</dt>
                <ul className="space-y-1">
                  {dest.emergencyInfo.hospitals.map((h) => (
                    <li key={h} className="text-red-900 text-sm">{h}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-luxury-navy py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <span className="inline-block text-luxury-gold text-sm font-medium tracking-[0.25em] uppercase mb-4">
            Ready to Visit {dest.name}?
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-4">
            Plan Your {dest.name} Journey
          </h2>
          <p className="text-luxury-cream/60 mb-8 max-w-lg mx-auto">
            Our AI Expedition Architect will craft a bespoke luxury itinerary
            tailored to your dates, interests, and travel style.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3.5 bg-luxury-gold text-luxury-navy font-medium rounded-full hover:bg-luxury-gold/90 transition-all duration-300 text-lg"
          >
            Start Planning
          </Link>
        </div>
      </section>
    </>
  );
}
