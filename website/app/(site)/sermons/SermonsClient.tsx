"use client";

import { useState } from "react";
import { Card } from "@/components/shared";

type Sermon = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  imageUrl: string | null;
};

interface Props {
  sermons: Sermon[];
  categories: string[];
}

export function SermonsClient({ sermons, categories }: Props) {
  const [active, setActive] = useState("All");
  const visible =
    active === "All" ? sermons : sermons.filter((s) => s.category === active);

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
        {visible.map((sermon) => (
          <Card
            key={sermon.id}
            title={sermon.title}
            description={sermon.description || ""}
            tag={sermon.category || "Sermon"}
            imageUrl={sermon.imageUrl || "/images/sermon-placeholder.svg"}
            href={`/sermons/${sermon.slug}`}
          />
        ))}
      </div>
    </>
  );
}
