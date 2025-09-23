import { notFound } from "next/navigation";
import { SEO } from "@/components/seo/SEO";
import { StructuredData } from "@/components/seo/StructuredData";
import { googleSheetsService } from "@/lib/google/sheets";
import { ArticleList } from "@/components/news/ArticleList";
import { toTitleCase } from "@/lib/utils";

// ISR: Revalidate this page every 24 hours (86400 seconds)
export const revalidate = 86400;

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

// Helper function to limit articles to a configurable number of cards
const limitArticles = (articles: any[]): any[] => {
  // Get the maximum number of articles from environment variable, default to 12
  const maxArticles = process.env.MAX_ARTICLES_PER_SECTION
    ? parseInt(process.env.MAX_ARTICLES_PER_SECTION, 10)
    : 12;
  
  // Ensure minimum of 2 cards and maximum of the configured limit
  if (articles.length <= 2) return articles;
  if (articles.length >= maxArticles) return articles.slice(0, maxArticles);
  return articles.slice(0, Math.max(2, Math.min(maxArticles, articles.length)));
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  // Decode the category slug and convert to title case
  const categoryName = toTitleCase(
    decodeURIComponent(category).replace(/-/g, " ")
  );

  // Get all articles and filter by category
  const allArticles = await googleSheetsService.getAllArticles();
  let categoryArticles = allArticles.filter(
    (article) => article.category.toLowerCase() === categoryName.toLowerCase()
  );

  if (categoryArticles.length === 0) {
    notFound();
  }

  // Limit articles to 2-4 cards
  categoryArticles = limitArticles(categoryArticles);

  // Generate structured data for category page
  const categoryStructuredData = {
    type: "collectionpage" as const,
    data: {
      title: `${categoryName} - DUF`,
      description: `Latest ${categoryName} articles and news from DUF`,
      path: `/categories/${category}`,
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://degennews.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: categoryName,
            item: `https://degennews.com/categories/${category}`,
          },
        ],
      },
    },
  };

  return (
    <>
      <SEO
        title={`${categoryName} - DUF`}
        description={`Latest ${categoryName} articles and news from DUF`}
        structuredData={categoryStructuredData}
      />

      <div className="min-h-screen text-foreground">
        <main className="px-4 py-8">
          <section className="mb-16">
            <div className="flex items-center mb-8">
              <h1 className="text-3xl font-bold text-dark-text">
                {categoryName}
              </h1>
              <div className="ml-3 gold-accent-dot"></div>
            </div>
            <p className="text-medium-text mb-8">
              Browse the latest articles in {categoryName}
            </p>

            <ArticleList
              articles={categoryArticles}
              useLinks={true}
              cardType="glass"
            />
          </section>
        </main>
      </div>
    </>
  );
}
