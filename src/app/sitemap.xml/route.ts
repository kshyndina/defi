import { NextResponse } from 'next/server';

export async function GET() {
  // Get the site URL from environment variable
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.defi-update.fun';
  
  // Define the paths for all URLs
  const paths = [
    '/',
    '/articles/cross-chain-arbitrage-exploiting-price-differences-multi-chain-memes',
    '/articles/technical-analysis-trading/sentiment-based-position-sizing-meme-trading',
    '/articles/optimism-bias-meme-token-evaluation-psychology-trading',
    '/articles/slippage-mathematics-the-hidden-tax-that-bleeds-memecoin-profits-dry',
    '/articles/the-death-cross-deception-why-traditional-indicators-betray-memecoin-traders',
    '/articles/technical-analysis-trading/volatility-harvesting-meme-straddles',
    '/articles/mev-predators-how-sandwich-attacks-devour-memecoin-traders-alive',
    '/articles/the-round-number-prophecy-how-psychological-price-levels-become-self-fulfilling-market-oracles',
    '/articles/24-7-trading-dilemma-managing-risk-markets-never-sleep',
    '/articles/the-5-minute-graduation-window-life-or-death-in-pumpfuns-digital-colosseum',
    '/articles/cross-chain-bridge-warfare-when-memecoin-bridges-become-billion-dollar-battlefields',
    '/articles/hot-hand-fallacy-following-successful-crypto-traders',
    '/articles/planning-fallacy-why-trading-plans-take-longer-than-expected',
    '/articles/the-oracle-deception-how-price-feed-manipulation-turns-defi-protocols-into-wealth-extraction-machines',
    '/articles/analysis-paralysis-too-much-information-hurts-trading-performance',
    '/articles/5-minute-rule-ultra-short-timeframe-trading-pumpfun-graduates',
    '/articles/telegram-trading-revolution-social-signals-memecoin-profits',
    '/articles/liquidity-pool-health-spotting-rug-pulls-before-they-happen',
    '/articles/dopamine-economy-memecoin-trading-hijacks-brain-reward-system',
    '/articles/social-proof-crypto-telegram-communities-drive-100m-pumps',
    '/articles/the-liquidity-pool-mirage-how-fake-depth-conceals-rug-pull-architecture',
    '/articles/disposition-effect-holding-losers-too-long-selling-winners-too-early',
    '/articles/technical-analysis-trading/dollar-cost-averaging-evolution-memes',
    '/articles/the-bonding-curve-apocalypse-when-mathematics-meets-meme-madness',
    '/articles/copy-trading-psychology-hidden-triggers-profitable-traders',
    '/articles/the-staking-trap-how-defi-rewards-become-digital-quicksand-for-memecoin-holdings',
    '/articles/liquidity-mirages-market-depth-illusions-trap-memecoin-traders',
    '/articles/technical-analysis-trading/breakout-pullback-strategy-meme-momentum',
    '/articles/technical-analysis-trading/event-driven-meme-strategy',
    '/articles/whale-alert-the-hunt-for-smart-money-in-solanas-memecoin-wilderness',
    '/articles/copy-trading-carnage-when-following-smart-money-becomes-financial-suicide',
    '/articles/technical-analysis-trading/gamma-squeeze-play-meme-options',
    '/articles/the-attention-economy-apocalypse-how-social-media-metrics-manipulate-memecoin-valuations',
    '/articles/the-flash-loan-assassins-how-defis-greatest-innovation-becomes-memecoins-deadliest-weapon',
    '/articles/fomo-vs-logic-automated-trading-systems-beat-human-emotion',
    '/articles/trust-algorithm-smart-traders-identify-profitable-signal-providers',
    '/articles/cognitive-load-management-high-speed-meme-trading',
    '/articles/technical-analysis-trading/technical-pattern-recognition-meme-charts',
    '/articles/the-cult-of-diamond-hands-how-hodl-mythology-destroys-rational-portfolio-management',
    '/articles/fomo-vs-fear-of-losing-balancing-competing-emotions-crypto-trading',
    '/articles/technical-analysis-trading/mean-reversion-strategies-overextended-memes',
    '/articles/technical-analysis-trading/cross-exchange-arbitrage-meme-trading',
    '/articles/fomo-to-fortune-psychology-successful-memecoin-entry-timing',
    '/articles/commitment-escalation-trap-doubling-down-losing-positions',
    '/articles/overconfidence-bias-danger-early-beginners-luck-memecoin-trading',
    '/articles/bonding-curve-advantage-trading-pumpfun-tokens-pre-graduation',
    '/articles/volume-spike-patterns-solana-memecoins-early-signals',
    '/articles/the-psychological-minefield-how-cognitive-biases-detonate-memecoin-fortunes',
    '/articles/multi-wallet-mastery-advanced-risk-compartmentalization-volatile-trading',
    '/articles/probability-neglect-low-probability-high-impact-events'
  ];

  // Generate the sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
<!--  created with Free Online Sitemap Generator www.xml-sitemaps.com  -->
${paths.map(path => {
  const isHomePage = path === '/';
  return `<url>
<loc>${siteUrl}${path}</loc>
<lastmod>2025-09-26T07:52:26+00:00</lastmod>
<priority>${isHomePage ? '1.00' : '0.80'}</priority>
</url>`;
}).join('\n')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=86400, stale-while-revalidate'
    }
  });
}