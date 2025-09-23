"use client";

import { ArticleList } from "./ArticleList";
import { Article } from "@/types/article";

interface ArticleSectionProps {
  articles: Article[];
}

// Helper function to limit articles to a configurable number of cards
const limitArticles = (articles: Article[]): Article[] => {
  // Get the maximum number of articles from environment variable, default to 12
  const maxArticles = process.env.MAX_ARTICLES_PER_SECTION
    ? parseInt(process.env.MAX_ARTICLES_PER_SECTION, 10)
    : 12;
  
  // Ensure minimum of 2 cards and maximum of the configured limit
  if (articles.length <= 2) return articles;
  if (articles.length >= maxArticles) return articles.slice(0, maxArticles);
  return articles.slice(0, Math.max(2, Math.min(maxArticles, articles.length)));
};

export function ArticleSection({ articles }: ArticleSectionProps) {
  // Get featured articles (first few articles)
  const featuredArticles = limitArticles(articles);
  
  // Get latest articles, excluding those already in featured
  const featuredIds = featuredArticles.map(article => article.id);
  const remainingArticles = articles.filter(article => !featuredIds.includes(article.id));
  const latestArticles = limitArticles(remainingArticles);

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