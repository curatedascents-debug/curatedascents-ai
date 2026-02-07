export interface Experience {
  id: string;
  name: string;
  destination: string;
  duration: string;
  difficulty: "Easy" | "Moderate" | "Challenging" | "Expert";
  startingPrice: number;
  currency: string;
  image: string;
  description: string;
  highlights: string[];
  bestSeason: string;
}

export const experiences: Experience[] = [
  {
    id: "everest-base-camp-luxury",
    name: "Everest Base Camp Luxury Trek",
    destination: "Nepal",
    duration: "14 Days",
    difficulty: "Challenging",
    startingPrice: 5500,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1486911278844-a81c5267e227?w=800&q=80",
    description: "Trek to the foot of the world's highest peak with luxury lodges, private guides, and helicopter return.",
    highlights: ["Luxury lodges", "Private guide", "Helicopter return", "Sherpa cultural immersion"],
    bestSeason: "Mar-May, Sep-Nov",
  },
  {
    id: "bhutan-cultural-journey",
    name: "Bhutan Cultural Journey",
    destination: "Bhutan",
    duration: "10 Days",
    difficulty: "Easy",
    startingPrice: 4800,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1608377228869-77bb8d84399c?w=800&q=80",
    description: "Discover the mystical kingdom of Bhutan with visits to ancient dzongs, monasteries, and the iconic Tiger's Nest.",
    highlights: ["Tiger's Nest hike", "Luxury Aman resorts", "Festival attendance", "Private monastery visits"],
    bestSeason: "Mar-May, Sep-Nov",
  },
  {
    id: "annapurna-heli-trek",
    name: "Annapurna Sanctuary Heli-Trek",
    destination: "Nepal",
    duration: "8 Days",
    difficulty: "Moderate",
    startingPrice: 3900,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=800&q=80",
    description: "Experience the Annapurna massif with a combination of trekking and helicopter transfers for the ultimate mountain experience.",
    highlights: ["Helicopter transfers", "Annapurna Base Camp", "Machapuchare views", "Hot springs"],
    bestSeason: "Mar-May, Oct-Dec",
  },
  {
    id: "tibet-kailash-pilgrimage",
    name: "Mount Kailash Pilgrimage",
    destination: "Tibet",
    duration: "15 Days",
    difficulty: "Challenging",
    startingPrice: 6200,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1760326604065-a007f0b19646?w=800&q=80",
    description: "Journey to the sacred Mount Kailash, one of the most revered pilgrimage sites in Asia, with luxury camping.",
    highlights: ["Kailash Kora", "Lake Mansarovar", "Potala Palace", "Luxury tented camps"],
    bestSeason: "May-Sep",
  },
  {
    id: "india-tiger-safari",
    name: "Royal Tiger Safari",
    destination: "India",
    duration: "9 Days",
    difficulty: "Easy",
    startingPrice: 4200,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800&q=80",
    description: "Track Bengal tigers in their natural habitat while staying at heritage palace hotels and luxury jungle lodges.",
    highlights: ["Ranthambore safaris", "Palace hotels", "Private naturalist", "Photography workshops"],
    bestSeason: "Oct-Apr",
  },
  {
    id: "ladakh-expedition",
    name: "Ladakh Luxury Expedition",
    destination: "India",
    duration: "12 Days",
    difficulty: "Moderate",
    startingPrice: 5100,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80",
    description: "Explore the moonscapes of Ladakh with visits to ancient monasteries, high-altitude lakes, and luxury camps.",
    highlights: ["Pangong Lake", "Nubra Valley", "Hemis Monastery", "Luxury camps"],
    bestSeason: "Jun-Sep",
  },
];
