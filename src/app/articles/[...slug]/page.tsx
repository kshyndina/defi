import { notFound } from "next/navigation";
import { ArticleDetail } from "@/components/news/ArticleDetail";
import { Footer } from "@/components/news/Footer";
import { SEO } from "@/components/seo/SEO";
import { StructuredData } from "@/components/seo/StructuredData";
import { googleSheetsService } from "@/lib/google/sheets";

// ISR: Revalidate this page every 24 hours (86400 seconds)
export const revalidate = 86400;

interface CatchAllArticlePageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export default async function CatchAllArticlePage({ params }: CatchAllArticlePageProps) {
  const { slug } = await params;

  // Join the slug array to form the full URL path
  const fullSlug = slug.join('/');
  
  // Add logging for debugging
  console.log("CatchAllArticlePage: Attempting to fetch article with slug:", fullSlug);

  // Fetch article with caching
  const article = await googleSheetsService.getArticleByUrl(fullSlug);

  console.log("CatchAllArticlePage: Article fetched:", article ? "Found" : "Not found");

  if (!article) {
    console.log("CatchAllArticlePage: Article not found, triggering 404");
    notFound();
  }

  // Generate structured data for article
  const articleStructuredData = {
    type: "article" as const,
    data: {
      title: article.title,
      description: article.preview,
      url: `https://degennews.com/articles/${fullSlug}`,
      datePublished: article.date,
      author: "DUF",
      category: article.category,
      image: "https://degennews.com/og-default.jpg",
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
            name: article.category,
            item: `https://degennews.com/categories/${encodeURIComponent(
              article.category.toLowerCase().replace(/\s+/g, "-")
            )}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: article.title,
            item: `https://degennews.com/articles/${fullSlug}`,
          },
        ],
      },
    },
  };

  return (
    <>
      <SEO
        title={article.title}
        description={article.preview}
        structuredData={articleStructuredData}
      />

      <div className="min-h-screen text-foreground">
        <main className="px-4 py-8">
          <ArticleDetail article={article} />
        </main>
        <Footer />
      </div>
    </>
  );
}
