"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/news/Header";
import { ArticleCard } from "@/components/news/ArticleCard";
import { ArticleCardPaper } from "@/components/news/ArticleCardPaper";
import { ArticleList } from "@/components/news/ArticleList";
import { ArticleSection } from "@/components/news/ArticleSection";

// Sample article data for testing
const sampleArticles = [
  {
    id: "1",
    title: "The Future of Decentralized Finance: Trends to Watch in 2023",
    content: "Decentralized finance continues to evolve at a rapid pace, with new innovations emerging regularly. This article explores the key trends that are shaping the future of DeFi.",
    preview: "Decentralized finance continues to evolve at a rapid pace, with new innovations emerging regularly.",
    category: "DeFi",
    tags: ["DeFi", "Blockchain", "Finance"],
    date: "2023-05-15",
    url: "https://example.com/article1",
    featured: true
  },
  {
    id: "2",
    title: "NFT Market Analysis: What's Driving the Recent Surge",
    content: "The NFT market has experienced significant growth in recent months. This analysis examines the factors contributing to this surge and what it means for investors.",
    preview: "The NFT market has experienced significant growth in recent months.",
    category: "NFTs",
    tags: ["NFTs", "Digital Art", "Market Analysis"],
    date: "2023-05-10",
    url: "https://example.com/article2"
  },
  {
    id: "3",
    title: "Understanding Smart Contract Security: Best Practices",
    content: "Smart contract security is paramount in the world of blockchain. This article outlines the best practices for ensuring your smart contracts are secure and reliable.",
    preview: "Smart contract security is paramount in the world of blockchain.",
    category: "Smart Contracts",
    tags: ["Smart Contracts", "Security", "Blockchain"],
    date: "2023-05-05",
    url: "https://example.com/article3"
  },
  {
    id: "4",
    title: "The Rise of Layer 2 Solutions: Scaling Ethereum",
    content: "As Ethereum continues to face scalability challenges, Layer 2 solutions are gaining traction. This article explores how these solutions are helping to scale the Ethereum network.",
    preview: "As Ethereum continues to face scalability challenges, Layer 2 solutions are gaining traction.",
    category: "Ethereum",
    tags: ["Ethereum", "Layer 2", "Scaling"],
    date: "2023-05-01",
    url: "https://example.com/article4",
    featured: true
  },
  {
    id: "5",
    title: "Crypto Regulation: Global Trends and Implications",
    content: "Cryptocurrency regulation is evolving rapidly around the world. This article examines the global trends in crypto regulation and their implications for the industry.",
    preview: "Cryptocurrency regulation is evolving rapidly around the world.",
    category: "Regulation",
    tags: ["Regulation", "Compliance", "Global"],
    date: "2023-04-25",
    url: "https://example.com/article5"
  },
  {
    id: "6",
    title: "Web3 Gaming: The Next Frontier for Blockchain Adoption",
    content: "Web3 gaming represents a significant opportunity for blockchain adoption. This article explores how gaming is driving the next wave of blockchain innovation.",
    preview: "Web3 gaming represents a significant opportunity for blockchain adoption.",
    category: "Gaming",
    tags: ["Web3", "Gaming", "Adoption"],
    date: "2023-04-20",
    url: "https://example.com/article6"
  }
];

export default function ResponsiveTestPage() {
  const [viewportSize, setViewportSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  useEffect(() => {
    const handleResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getDeviceType = () => {
    if (viewportSize.width < 480) return 'Mobile (Extra Small)';
    if (viewportSize.width < 768) return 'Mobile (Small)';
    if (viewportSize.width < 1024) return 'Tablet (Medium)';
    return 'Desktop (Large)';
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Viewport size indicator */}
      <div className="fixed bottom-4 right-4 bg-warm-brown text-white p-3 rounded-lg shadow-lg z-50">
        <div className="text-sm font-semibold">{getDeviceType()}</div>
        <div className="text-xs">{viewportSize.width} × {viewportSize.height}px</div>
      </div>

      {/* Header Test Section */}
      <section className="mb-16">
        <div className="px-4 py-8">
          <h1 className="text-3xl font-bold text-warm-brown mb-6">Liquid Mercury Header Test</h1>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Header />
          </div>
        </div>
      </section>

      {/* Article Cards Test Section */}
      <section className="mb-16">
        <div className="px-4 py-8">
          <h1 className="text-3xl font-bold text-warm-brown mb-6">Article Cards Test</h1>
          
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-warm-brown mb-4">Glass Shard Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleArticles.slice(0, 3).map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  index={index}
                  isFeatured={index === 0}
                />
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-warm-brown mb-4">Paper Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleArticles.slice(0, 3).map((article, index) => (
                <ArticleCardPaper
                  key={article.id}
                  article={article}
                  index={index}
                  isFeatured={index === 0}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Organic Masonry Layout Test Section */}
      <section className="mb-16">
        <div className="px-4 py-8">
          <h1 className="text-3xl font-bold text-warm-brown mb-6">Organic Masonry Layout Test</h1>
          
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-warm-brown mb-4">Mixed View</h2>
            <ArticleList
              articles={sampleArticles}
              useLinks={false}
              cardType="mixed"
            />
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-warm-brown mb-4">Glass Cards Only</h2>
            <ArticleList
              articles={sampleArticles}
              useLinks={false}
              cardType="glass"
            />
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-warm-brown mb-4">Paper Cards Only</h2>
            <ArticleList
              articles={sampleArticles}
              useLinks={false}
              cardType="paper"
            />
          </div>
        </div>
      </section>

      {/* Article Section Test */}
      <section className="mb-16">
        <div className="px-4 py-8">
          <h1 className="text-3xl font-bold text-warm-brown mb-6">Article Section Test</h1>
          <ArticleSection articles={sampleArticles} />
        </div>
      </section>

      {/* Test Instructions */}
      <section className="mb-16">
        <div className="px-4 py-8">
          <h1 className="text-3xl font-bold text-warm-brown mb-6">Testing Instructions</h1>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-warm-brown mb-4">How to Test Responsive Design</h2>
            <ol className="list-decimal pl-6 space-y-2 text-medium-text">
              <li>Resize your browser window to test different screen sizes</li>
              <li>Use browser developer tools to simulate different devices</li>
              <li>Test on actual mobile devices if possible</li>
              <li>Check for the following issues:
                <ul className="list-disc pl-6 mt-2">
                  <li>Text readability and proper scaling</li>
                  <li>Proper touch target sizes (minimum 44×44px)</li>
                  <li>Horizontal scrolling issues</li>
                  <li>Overlapping elements</li>
                  <li>Performance issues on mobile devices</li>
                  <li>Accessibility concerns</li>
                </ul>
              </li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}