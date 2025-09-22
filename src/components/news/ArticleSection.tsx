"use client";

import { ArticleList } from "./ArticleList";
import { Article } from "@/types/article";

interface ArticleSectionProps {
  articles: Article[];
}

// Helper function to limit articles to 2-4 cards
const limitArticles = (articles: Article[]): Article[] => {
  // Ensure minimum of 2 cards and maximum of 4 cards
  if (articles.length <= 2) return articles;
  if (articles.length >= 4) return articles.slice(0, 4);
  return articles.slice(0, Math.max(2, Math.min(4, articles.length)));
};

export function ArticleSection({ articles }: ArticleSectionProps) {
  // Limit articles to 2-4 cards for each section
  const featuredArticles = limitArticles(articles);
  const latestArticles = limitArticles(articles);

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
          articles={featuredArticles}
          useLinks={true}
          cardType="glass"
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
          articles={latestArticles}
          useLinks={true}
          cardType="glass"
        />
      </section>
    </div>
  );
}