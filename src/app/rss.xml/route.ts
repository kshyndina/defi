import { NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/google/sheets';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://degennews.com';
  
  try {
    const articles = await googleSheetsService.getAllArticles();
    const latestArticles = articles.slice(0, 20); // Latest 20 articles
    
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  
  <channel>
    <title>DUF - Crypto Security News</title>
    <description>Latest crypto security news, trading insights, whale watching strategies, and market analysis for degens.</description>
    <link>${baseUrl}/</link>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>60</ttl>
    <image>
      <url>${baseUrl}/logo.png</url>
      <title>DUF</title>
      <link>${baseUrl}/</link>
      <width>144</width>
      <height>144</height>
    </image>
    
    ${latestArticles.map(article => {
      const slug = article.url.split('/').pop();
      const articleUrl = `${baseUrl}/articles/${slug}`;
      return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <description><![CDATA[${article.preview}]]></description>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <pubDate>${new Date(article.date || new Date()).toUTCString()}</pubDate>
      <category><![CDATA[${article.category}]]></category>
      ${article.tags.map(tag => `<category><![CDATA[${tag}]]></category>`).join('\n      ')}
      <content:encoded><![CDATA[${article.content}]]></content:encoded>
      <author>DUF</author>
    </item>`;
    }).join('')}
    
  </channel>
</rss>`;

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate'
      }
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><rss></rss>', {
      status: 500,
      headers: {
        'Content-Type': 'application/xml'
      }
    });
  }
}