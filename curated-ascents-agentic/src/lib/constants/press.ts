export interface PressMention {
  name: string;
  quote?: string;
}

export const pressMentions: PressMention[] = [
  { name: "The New York Times", quote: "Redefining luxury adventure travel" },
  { name: "Forbes", quote: "A new standard in bespoke expeditions" },
  { name: "Condé Nast Traveler", quote: "The gold standard of Himalayan travel" },
  { name: "Travel + Leisure", quote: "Unparalleled attention to detail" },
  { name: "National Geographic", quote: "Where adventure meets elegance" },
  { name: "BBC Travel", quote: "Expeditions crafted with passion" },
];

export interface Certification {
  name: string;
  description: string;
  icon: "Leaf" | "ShieldCheck" | "Award" | "Mountain";
}

export const certifications: Certification[] = [
  {
    name: "Sustainable Tourism",
    description: "Certified eco-friendly practices across all operations",
    icon: "Leaf",
  },
  {
    name: "Safety Standards",
    description: "International safety and risk management certification",
    icon: "ShieldCheck",
  },
  {
    name: "Luxury Travel Alliance",
    description: "Member of the global luxury travel network",
    icon: "Award",
  },
  {
    name: "ATTA Member",
    description: "Adventure Travel Trade Association certified operator",
    icon: "Mountain",
  },
];
