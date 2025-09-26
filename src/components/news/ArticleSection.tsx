"use client";

import { ArticleList } from "./ArticleList";
import { Article } from "@/types/article";

interface ArticleSectionProps {
  articles: Article[];
}

// Helper function to get featured articles (limit to first 6)
const getFeaturedArticles = (articles: Article[]): Article[] => {
  // Return only first 6 articles for featured section
  return articles.slice(0, 6);
};

export function ArticleSection({ articles }: ArticleSectionProps) {
  console.log(`ArticleSection received ${articles.length} articles total`);
  
  // Get featured articles (first few articles)
  const featuredArticles = getFeaturedArticles(articles);
  console.log(`Featured articles section: ${featuredArticles.length} articles`);

  // Get latest articles, excluding those already in featured
  const featuredIds = featuredArticles.map((article) => article.id);
  const latestArticles = articles.filter(
    (article) => !featuredIds.includes(article.id)
  );
  console.log(`Latest articles section: ${latestArticles.length} articles`);

  return (
    <div className="space-y-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto overflow-visible">
      {/* Featured articles section */}
      {featuredArticles.length > 0 && (
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
      )}

      {/* All articles section */}
      {latestArticles.length > 0 && (
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
      )}
    </div>
  );
}
