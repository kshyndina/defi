interface StructuredDataProps {
  type: 'website' | 'webpage' | 'article' | 'faqpage' | 'howto';
  data: any;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const generateStructuredData = () => {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://degennews.com';
    
    switch (type) {
      case 'website':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'DUF',
          url: baseUrl,
          description: 'Latest crypto security news, trading insights, and market analysis',
          potentialAction: {
            '@type': 'SearchAction',
            target: `${baseUrl}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string'
          },
          publisher: {
            '@type': 'Organization',
            name: 'DUF',
            logo: {
              '@type': 'ImageObject',
              url: `${baseUrl}/logo.png`
            }
          }
        };

      case 'webpage':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: data.title,
          description: data.description,
          url: `${baseUrl}${data.path}`,
          isPartOf: {
            '@type': 'WebSite',
            name: 'DUF',
            url: baseUrl
          },
          breadcrumb: data.breadcrumb || null
        };

      case 'article':
        return {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: data.title,
          description: data.description,
          image: data.image || `${baseUrl}/api/og?title=${encodeURIComponent(data.title)}`,
          url: `${baseUrl}${data.path}`,
          datePublished: data.datePublished,
          dateModified: data.dateModified || data.datePublished,
          author: {
            '@type': 'Organization',
            name: 'DUF'
          },
          publisher: {
            '@type': 'Organization',
            name: 'DUF',
            logo: {
              '@type': 'ImageObject',
              url: `${baseUrl}/logo.png`
            }
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${baseUrl}${data.path}`
          },
          articleSection: data.category,
          keywords: data.tags?.join(', '),
          inLanguage: 'en-US'
        };

      case 'faqpage':
        return {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: data.faqs?.map((faq: any) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer
            }
          }))
        };

      case 'howto':
        return {
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: data.name,
          description: data.description,
          totalTime: data.totalTime,
          estimatedCost: data.estimatedCost,
          supply: data.supply,
          tool: data.tools,
          step: data.steps?.map((step: any, index: number) => ({
            '@type': 'HowToStep',
            name: step.name,
            text: step.text,
            image: step.image,
            url: step.url
          }))
        };

      default:
        return {};
    }
  };

  const structuredData = generateStructuredData();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
}