export interface Destination {
  id: string;
  name: string;
  country: string;
  tagline: string;
  description: string;
  image: string;
  highlights: string[];
  featured: boolean;
}

export const destinations: Destination[] = [
  {
    id: "nepal",
    name: "Nepal",
    country: "Nepal",
    tagline: "The Roof of the World",
    description: "Home to eight of the world's fourteen highest peaks, Nepal offers unparalleled Himalayan adventures. From Everest Base Camp treks to serene lakeside retreats in Pokhara.",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80",
    highlights: ["Everest Base Camp", "Annapurna Circuit", "Kathmandu Valley", "Chitwan Safari"],
    featured: true,
  },
  {
    id: "bhutan",
    name: "Bhutan",
    country: "Bhutan",
    tagline: "Land of the Thunder Dragon",
    description: "The last Himalayan kingdom where Gross National Happiness matters more than GDP. Experience ancient monasteries, pristine forests, and a culture untouched by time.",
    image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1200&q=80",
    highlights: ["Tiger's Nest", "Paro Valley", "Punakha Dzong", "Bumthang"],
    featured: false,
  },
  {
    id: "tibet",
    name: "Tibet",
    country: "China",
    tagline: "The Spiritual Heart of Asia",
    description: "Journey to the roof of the world where ancient Buddhist traditions meet breathtaking landscapes. Visit sacred monasteries and witness the majesty of the Tibetan Plateau.",
    image: "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?w=1200&q=80",
    highlights: ["Potala Palace", "Mount Kailash", "Lhasa", "Everest North Face"],
    featured: false,
  },
  {
    id: "india",
    name: "India",
    country: "India",
    tagline: "Where Every Journey Transforms",
    description: "From the snow-capped peaks of Ladakh to the tiger-filled forests of Ranthambore, India offers incredible diversity. Luxury palaces, ancient temples, and wildlife encounters await.",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&q=80",
    highlights: ["Ladakh", "Ranthambore", "Rajasthan Palaces", "Kerala Backwaters"],
    featured: false,
  },
];
