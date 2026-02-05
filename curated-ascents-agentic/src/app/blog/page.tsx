import { Metadata } from "next";
import BlogPageClient from "./BlogPageClient";

export const metadata: Metadata = {
  title: "Travel Blog | CuratedAscents - Himalayan Adventures & Insights",
  description:
    "Discover travel stories, destination guides, and expert tips for Nepal, Bhutan, Tibet, and India. Plan your luxury Himalayan adventure with CuratedAscents.",
  keywords: [
    "himalayan travel blog",
    "nepal travel guide",
    "bhutan travel tips",
    "tibet travel",
    "adventure travel stories",
    "luxury travel blog",
  ],
  openGraph: {
    title: "Travel Blog | CuratedAscents",
    description:
      "Discover travel stories, destination guides, and expert tips for your Himalayan adventure.",
    type: "website",
  },
};

export default function BlogPage() {
  return <BlogPageClient />;
}
