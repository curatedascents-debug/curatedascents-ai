export interface Testimonial {
  id: string;
  name: string;
  location: string;
  trip: string;
  quote: string;
  rating: number;
  avatar?: string;
  year: number;
}

export const testimonials: Testimonial[] = [
  {
    id: "testimonial-1",
    name: "Sarah Mitchell",
    location: "New York, USA",
    trip: "Everest Base Camp Luxury Trek",
    quote: "An absolutely transformative experience. The attention to detail, from the luxury lodges to the incredibly knowledgeable guides, exceeded every expectation. Standing at Everest Base Camp was a dream come true.",
    rating: 5,
    year: 2024,
  },
  {
    id: "testimonial-2",
    name: "James & Emma Thompson",
    location: "London, UK",
    trip: "Bhutan Cultural Journey",
    quote: "CuratedAscents crafted the perfect honeymoon. Bhutan's magic combined with their impeccable service created memories we'll treasure forever. The Tiger's Nest sunrise was breathtaking.",
    rating: 5,
    year: 2024,
  },
  {
    id: "testimonial-3",
    name: "Dr. Michael Chen",
    location: "Singapore",
    trip: "Royal Tiger Safari",
    quote: "As a wildlife photographer, I've been on many safaris. This was exceptional. Three tiger sightings, incredible accommodations, and guides who understood exactly what I needed for the perfect shot.",
    rating: 5,
    year: 2023,
  },
  {
    id: "testimonial-4",
    name: "Isabella Rossi",
    location: "Milan, Italy",
    trip: "Annapurna Sanctuary Heli-Trek",
    quote: "The helicopter views were stunning, but what truly made this trip special was the seamless organization. Every detail was handled with care. I felt safe, pampered, and completely immersed in the mountains.",
    rating: 5,
    year: 2024,
  },
  {
    id: "testimonial-5",
    name: "Robert & Linda Hayes",
    location: "Sydney, Australia",
    trip: "Ladakh Luxury Expedition",
    quote: "Celebrating our 30th anniversary in Ladakh was magical. The team arranged surprise experiences we never expected. The landscapes, the monasteries, the people - everything was perfect.",
    rating: 5,
    year: 2023,
  },
];
