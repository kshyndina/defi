"use client";

import { useState, useEffect } from "react";

export default function CSSTest() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/articles")
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.articles || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen text-foreground p-8">
        <h1 className="text-4xl font-bold text-white mb-8">CSS Test Page</h1>
        <div className="text-gray-400">Loading articles...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground p-8">
      <h1 className="text-4xl font-bold text-white mb-8">CSS Test Page</h1>

      <div className="space-y-8">
        {/* Test basic styling */}
        <section className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Basic Styling Test
          </h2>
          <p className="text-gray-300 mb-4">
            This should be gray text on dark background
          </p>
          <p className="text-blue-400 mb-4">This should be blue text</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Test Button
          </button>
        </section>

        {/* Test article cards */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">
            Article Cards Test
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.slice(0, 3).map((article) => (
              <div
                key={article.id}
                className="border border-gray-800 p-6 hover:border-gray-600 transition-colors cursor-pointer"
              >
                <h3 className="text-white text-xl font-medium mb-3">
                  {article.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">{article.preview}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">
                    {article.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(article.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Test dark mode variables */}
        <section className="bg-card p-6 rounded-lg border-border">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            CSS Variables Test
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary p-4 rounded text-primary-foreground">
              Primary Colors
            </div>
            <div className="bg-secondary p-4 rounded text-secondary-foreground">
              Secondary Colors
            </div>
            <div className="bg-accent p-4 rounded text-accent-foreground">
              Accent Colors
            </div>
            <div className="bg-muted p-4 rounded text-muted-foreground">
              Muted Colors
            </div>
          </div>
        </section>

        {/* Test article content styling */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">
            Article Content Styling
          </h2>
          {articles.length > 0 && (
            <div className="article-content bg-gray-900 p-6 rounded-lg border border-gray-700">
              <div
                dangerouslySetInnerHTML={{
                  __html: articles[0].content.substring(0, 500) + "...",
                }}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
