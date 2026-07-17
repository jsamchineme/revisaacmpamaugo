"use client";

import { useState } from "react";
import { Card } from "@/components/shared";

type Teaching = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  imageUrl: string | null;
};

interface Props {
  teachings: Teaching[];
  categories: string[];
}

export function TeachingsClient({ teachings, categories }: Props) {
  const [active, setActive] = useState("All");
  const visible =
    active === "All"
      ? teachings
      : teachings.filter((t) => t.category === active);

  return (
    <>
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-5 py-2 rounded-full border text-sm font-medium transition-colors ${
              active === cat
                ? "bg-burgundy border-burgundy text-white"
                : "border-line text-muted hover:border-gold"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {visible.map((teaching) => (
          <Card
            key={teaching.id}
            title={teaching.title}
            description={teaching.excerpt || ""}
            tag={teaching.category || "Teaching"}
            imageUrl={teaching.imageUrl || "/images/teaching-placeholder.svg"}
            href={`/teachings/${teaching.slug}`}
          />
        ))}
      </div>
    </>
  );
}
