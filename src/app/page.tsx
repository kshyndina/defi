import { SEO } from "@/components/seo/SEO";
import { StructuredData } from "@/components/seo/StructuredData";
import { googleSheetsService } from "@/lib/google/sheets";
import { ArticleSection } from "@/components/news/ArticleSection";
import { Article } from "@/types/article";

// ISR: Revalidate this page every 24 hours (86400 seconds)
export const revalidate = 86400;

export default async function Home() {
  // Fetch articles with caching
  const articles = await googleSheetsService.getAllArticles();
  console.log(`Homepage received ${articles.length} articles from Google Sheets service`);

  // Generate structured data for homepage
  const homepageStructuredData = {
    type: "webpage" as const,
    data: {
      title: "DUF - Crypto Security News & Trading Insights",
      description:
        "Latest crypto security news, trading insights, whale watching strategies, and market analysis for degens.",
      path: "/",
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://degennews.com/",
          },
        ],
      },
    },
  };

  return (
    <>
      <SEO
        title="DUF - Crypto Security News & Trading Insights"
        description="Latest crypto security news, trading insights, whale watching strategies, and market analysis for degens."
        structuredData={homepageStructuredData}
      />

      <div className="min-h-screen text-foreground overflow-x-hidden">
        <main className="px-3 md:px-4 py-6 md:py-8 max-w-full overflow-x-hidden">
          <ArticleSection articles={articles} />
        </main>
      </div>
    </>
  );
}
