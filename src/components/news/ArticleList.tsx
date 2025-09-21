"use client";

import { Article } from '@/types/article';
import { ArticleCard } from './ArticleCard';
import { ArticleCardPaper } from './ArticleCardPaper';

interface ArticleListProps {
  articles: Article[];
  onArticleClick?: (article: Article) => void;
  useLinks?: boolean;
  cardType?: 'glass' | 'paper' | 'mixed';
}

export function ArticleList({ articles, onArticleClick, useLinks = false, cardType = 'glass' }: ArticleListProps) {
  // Determine if a card should be featured (span 2 columns)
  const isFeatured = (index: number) => {
    // No cards span 2 columns anymore
    return false;
  };

  // Determine card type for each article when in mixed mode
  const getCardTypeForArticle = (index: number) => {
    if (cardType !== 'mixed') return cardType;
    
    // Mixed mode logic: featured articles use glass, others alternate
    if (isFeatured(index)) return 'glass';
    return index % 2 === 0 ? 'glass' : 'paper';
  };
  
  return (
    <div className="article-grid">
      {articles.map((article, index) => {
        const featured = isFeatured(index);
        const articleCardType = getCardTypeForArticle(index);
        
        return (
          <div
            key={article.id}
            className={`article-grid-item ${featured ? 'featured' : ''}`}
          >
            {articleCardType === 'paper' ? (
              <ArticleCardPaper
                article={article}
                index={index}
                isFeatured={featured}
                onClick={() => onArticleClick?.(article)}
                href={useLinks ? `/articles/${article.url.split('/').pop()}` : undefined}
              />
            ) : (
              <ArticleCard
                article={article}
                index={index}
                isFeatured={featured}
                onClick={() => onArticleClick?.(article)}
                href={useLinks ? `/articles/${article.url.split('/').pop()}` : undefined}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}