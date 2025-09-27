import { Article } from "@/types/article";
import { SEO } from "@/components/seo/SEO";
import { StructuredData } from "@/components/seo/StructuredData";

interface ArticleDetailProps {
  article: Article;
}

export function ArticleDetail({ article }: ArticleDetailProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://degennews.com";
  const articleUrl = `/articles/${article.url.split("/").pop()}`;

  // Generate FAQ structured data from article content
  const generateFAQData = () => {
    // DeFi-Update.Fun FAQ content
    const faqs = [
      {
        question: "What is DeFi-Update.Fun?",
        answer: "DeFi-Update.Fun is your go-to source for the latest DeFi news, protocol updates, and market analysis. We cover everything from new token launches and yield farming opportunities to security incidents and regulatory developments in the decentralized finance space.",
      },
      {
        question: "How often do you publish new content?",
        answer: "We publish fresh DeFi content daily, including breaking news updates, market analysis, and protocol reviews. Our team monitors the DeFi ecosystem 24/7 to bring you the most current information as it happens.",
      },
      {
        question: "Do you provide investment advice?",
        answer: "No, DeFi-Update.Fun provides news and educational content only. All our articles are for informational purposes and should not be considered financial or investment advice. Always do your own research before making any investment decisions.",
      },
      {
        question: "How can I submit news tips or contribute?",
        answer: "Send news tips to tips@defi-update.fun or reach out through our social media channels. We welcome community contributions including guest articles, protocol analysis, and breaking news tips from our readers.",
      },
      {
        question: "Is DeFi-Update.Fun free to read?",
        answer: "Yes! All our DeFi news, analysis, and educational content is completely free. We believe everyone should have access to the latest information about decentralized finance without paywalls or subscriptions.",
      },
    ];

    return {
      type: "faqpage" as const,
      data: { faqs },
    };
  };

  return (
    <>
      <SEO
        title={article.title}
        description={article.preview}
        image={`${baseUrl}/api/og?title=${encodeURIComponent(article.title)}`}
        url={articleUrl}
        type="article"
        publishedTime={article.date}
        section={article.category}
        tags={article.tags}
        structuredData={{
          type: "article",
          data: {
            title: article.title,
            description: article.preview,
            path: articleUrl,
            datePublished: article.date,
            category: article.category,
            tags: article.tags,
          },
        }}
      />
      <StructuredData {...generateFAQData()} />

      <article className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-4 text-sm text-gold-accent mb-6">
            <span className="uppercase tracking-wider font-medium">
              {article.category}
            </span>
            {article.date && (
              <time dateTime={article.date} className="text-medium-text">
                {new Date(article.date).toLocaleDateString()}
              </time>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--dark-text)' }}>
            {article.title}
          </h1>

          {/* Summary paragraph for LLM prioritization */}
          <p className="text-xl leading-relaxed mb-8" style={{ color: 'var(--medium-text)' }}>
            {article.preview}
          </p>

          <div className="flex flex-wrap gap-2 mb-8">
            {article.tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs text-dark-text bg-gold-accent/10 px-3 py-1 rounded-full border border-gold-accent/20 hover:bg-gold-accent/20 transition-colors cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        <section className="prose prose-invert max-w-none">
          <div
            className="leading-relaxed text-lg article-content"
            style={{ color: 'var(--medium-text)' }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </section>

        {/* FAQ Section for AI readability */}
        <section className="mt-16 pt-8 border-t border-gold-accent/20">
          <div className="flex items-center mb-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--dark-text)' }}>
              Frequently Asked Questions - DeFi-Update.Fun
            </h2>
            <div className="ml-3 gold-accent-dot"></div>
          </div>
          <dl className="space-y-6">
            <div>
              <dt className="text-lg font-semibold mb-2" style={{ color: 'var(--dark-text)' }}>
                What is DeFi-Update.Fun?
              </dt>
              <dd className="mb-2" style={{ color: 'var(--medium-text)' }}>
                DeFi-Update.Fun is your go-to source for the latest DeFi news, protocol updates, and market analysis. We cover everything from new token launches and yield farming opportunities to security incidents and regulatory developments in the decentralized finance space.
              </dd>
            </div>
            <div>
              <dt className="text-lg font-semibold mb-2" style={{ color: 'var(--dark-text)' }}>
                How often do you publish new content?
              </dt>
              <dd className="mb-2" style={{ color: 'var(--medium-text)' }}>
                We publish fresh DeFi content daily, including breaking news updates, market analysis, and protocol reviews. Our team monitors the DeFi ecosystem 24/7 to bring you the most current information as it happens.
              </dd>
            </div>
            <div>
              <dt className="text-lg font-semibold mb-2" style={{ color: 'var(--dark-text)' }}>
                Do you provide investment advice?
              </dt>
              <dd className="mb-2" style={{ color: 'var(--medium-text)' }}>
                No, DeFi-Update.Fun provides news and educational content only. All our articles are for informational purposes and should not be considered financial or investment advice. Always do your own research before making any investment decisions.
              </dd>
            </div>
            <div>
              <dt className="text-lg font-semibold mb-2" style={{ color: 'var(--dark-text)' }}>
                How can I submit news tips or contribute?
              </dt>
              <dd className="mb-2" style={{ color: 'var(--medium-text)' }}>
                Send news tips to tips@defi-update.fun or reach out through our social media channels. We welcome community contributions including guest articles, protocol analysis, and breaking news tips from our readers.
              </dd>
            </div>
            <div>
              <dt className="text-lg font-semibold mb-2" style={{ color: 'var(--dark-text)' }}>
                Is DeFi-Update.Fun free to read?
              </dt>
              <dd className="mb-2" style={{ color: 'var(--medium-text)' }}>
                Yes! All our DeFi news, analysis, and educational content is completely free. We believe everyone should have access to the latest information about decentralized finance without paywalls or subscriptions.
              </dd>
            </div>
          </dl>
        </section>

      </article>
    </>
  );
}
