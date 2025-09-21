"use client";

import { ArticleList } from "./ArticleList";
import { Article } from "@/types/article";

interface ArticleSectionProps {
  articles: Article[];
}

export function ArticleSection({ articles }: ArticleSectionProps) {
  return (
    <div className="space-y-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto overflow-visible">
      {/* Featured articles section */}
      <section className="article-section overflow-visible">
        <div className="flex items-center mb-6">
          <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-warm-brown">
            Featured Articles
          </h2>
          <div className="ml-3 gold-accent-dot"></div>
        </div>
        <ArticleList
          articles={articles.slice(0, 3)} // Limit featured articles
          useLinks={true}
          cardType="mixed"
        />
      </section>

      {/* All articles section */}
      <section className="article-section overflow-visible">
        <div className="flex items-center mb-6">
          <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-warm-brown">
            Latest Crypto Articles
          </h2>
          <div className="ml-3 gold-accent-dot"></div>
        </div>
        <ArticleList
          articles={articles}
          useLinks={true}
          cardType="mixed"
        />
      </section>
    </div>
  );
}