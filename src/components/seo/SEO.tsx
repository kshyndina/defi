import { StructuredData } from './StructuredData';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
  structuredData?: any;
}

export function SEO({
  title = 'DUF - Crypto Security News & Trading Insights',
  description = 'Latest crypto security news, trading insights, whale watching strategies, and market analysis for degens.',
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  section,
  tags,
  noindex = false,
  structuredData
}: SEOProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://degennews.com';
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const defaultImage = `${baseUrl}/api/og?title=${encodeURIComponent(title)}`;

  return (
    <>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="author" content="DUF" />
      <link rel="canonical" href={fullUrl} />
      
      {/* Advanced Robots Meta */}
      <meta 
        name="robots" 
        content={`${noindex ? 'noindex,' : ''}index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1`} 
      />
      
      {/* Open Graph Tags */}
      <meta property="og:type" content={type === 'article' ? 'article' : 'website'} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="DUF" />
      <meta property="og:locale" content="en_US" />
      
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && section && (
        <meta property="article:section" content={section} />
      )}
      {type === 'article' && tags && (
        tags.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))
      )}
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image || defaultImage} />
      <meta name="twitter:site" content="@DUF" />
      <meta name="twitter:creator" content="@DUF" />
      
      {/* Geo Signals */}
      <meta name="geo.region" content="US" />
      <meta name="geo.placename" content="United States" />
      
      {/* Hreflang for multilingual support */}
      <link rel="alternate" hrefLang="en" href={fullUrl} />
      <link rel="alternate" hrefLang="x-default" href={fullUrl} />
      
      {/* Structured Data */}
      {structuredData && (
        <StructuredData 
          type={structuredData.type} 
          data={structuredData.data} 
        />
      )}
    </>
  );
}