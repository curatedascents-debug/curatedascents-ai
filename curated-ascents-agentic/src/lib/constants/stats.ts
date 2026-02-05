export interface Stat {
  id: string;
  value: number;
  suffix: string;
  label: string;
  description: string;
}

export const stats: Stat[] = [
  {
    id: "expeditions",
    value: 500,
    suffix: "+",
    label: "Expeditions",
    description: "Successfully completed adventures",
  },
  {
    id: "travelers",
    value: 2500,
    suffix: "+",
    label: "Happy Travelers",
    description: "Guests from around the world",
  },
  {
    id: "experience",
    value: 28,
    suffix: "+",
    label: "Years Experience",
    description: "Decades of Himalayan expertise",
  },
  {
    id: "rating",
    value: 4.9,
    suffix: "",
    label: "Average Rating",
    description: "Based on verified reviews",
  },
];
