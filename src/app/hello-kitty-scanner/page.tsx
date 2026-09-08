'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './scanner.module.css';

type ViewKey = 'new' | 'trending' | 'topVolume' | 'topGainers';
type TimeFrame = '5M' | '1H' | '6H' | '24H';

type ActivityWindow = {
  buys?: number;
  sells?: number;
  transactions?: number;
  volume?: number;
  buyVolumePct?: number;
  sellVolumePct?: number;
  priceChangePct?: number;
};

type ScannerItem = {
  chain?: string;
  tokenAddress: string;
  tokenName?: string;
  tokenSymbol?: string;
  pairAddress?: string;
  platformName?: string;
  platformType?: string;
  createdAtAgeSeconds?: number;
  createdAtTimestampStr?: string;
  rugged?: boolean;
  image?: string | null;
  imageUrl?: string | null;
  imageUri?: string | null;
  imageURI?: string | null;
  tokenImage?: string | null;
  tokenImageUrl?: string | null;
  tokenLogo?: string | null;
  tokenLogoUrl?: string | null;
  logo?: string | null;
  logoUrl?: string | null;
  logoURI?: string | null;
  icon?: string | null;
  metadata?: {
    image?: string | null;
    imageUrl?: string | null;
    imageUri?: string | null;
    logo?: string | null;
    logoUrl?: string | null;
    icon?: string | null;
  };
  quote?: {
    priceUsd?: number;
    marketCapUsd?: number;
    liquidityUsd?: number;
    fullyDilutedValue?: number;
  };
  stats?: {
    timeframes?: {
      '5m'?: ActivityWindow;
      '1h'?: ActivityWindow;
      '6h'?: ActivityWindow;
      '24h'?: ActivityWindow;
    };
    total?: ActivityWindow;
  };
  holders?: {
    holderCount?: number;
    top10Pct?: number;
    devPct?: number;
    insidersPct?: number;
    snipersPct?: number;
  };
  audit?: {
    contractVerified?: boolean;
    honeypot?: boolean;
    mintable?: boolean;
    freezable?: boolean;
    upgradeable?: boolean;
    lpLocked?: boolean;
    lpLockedPct?: number;
  };
  socials?: {
    twitter?: string | null;
    telegram?: string | null;
    website?: string | null;
    discord?: string | null;
  };
};

type ScannerList = {
  tokens: ScannerItem[];
  cursor?: string;
  nextCursor?: string;
  prevCursor?: string;
  stats?: {
    transactions?: number;
    volume?: number;
  };
};

type SourceFailure = {
  reason?: string;
  retryable?: boolean;
};

type ScannerPageResponse = {
  meta?: {
    sourceFailures?: Record<string, SourceFailure>;
  };
  new: ScannerList | null;
  trending: ScannerList | null;
  topVolume: ScannerList | null;
  topGainers: ScannerList | null;
};

const VIEW_META: Record<ViewKey, { label: string; eyebrow: string }> = {
  new: { label: 'New', eyebrow: 'just launched' },
  trending: { label: 'Hot', eyebrow: 'everyone is looking' },
  topVolume: { label: 'Volume', eyebrow: 'money moving' },
  topGainers: { label: 'Gainers', eyebrow: 'up only-ish' },
};

const TF_KEY: Record<TimeFrame, '5m' | '1h' | '6h' | '24h'> = {
  '5M': '5m',
  '1H': '1h',
  '6H': '6h',
  '24H': '24h',
};

const LIQUIDITY_OPTIONS = [
  { label: 'Any liquidity', value: 0 },
  { label: '$1k+', value: 1_000 },
  { label: '$10k+', value: 10_000 },
  { label: '$50k+', value: 50_000 },
  { label: '$100k+', value: 100_000 },
  { label: '$250k+', value: 250_000 },
];

const AGE_OPTIONS = [
  { label: 'Any age', value: 0 },
  { label: '< 1 hour', value: 1 },
  { label: '< 6 hours', value: 6 },
  { label: '< 24 hours', value: 24 },
  { label: '< 7 days', value: 168 },
];

function buildSource(timeFrame: TimeFrame, minLiquidity: number, maxAgeHours: number) {
  const market: Record<string, { min?: number; max?: number }> = {};

  if (minLiquidity > 0) market.liquidityUsd = { min: minLiquidity };
  if (maxAgeHours > 0) market.ageHours = { max: maxAgeHours };

  return {
    timeFrame,
    ...(Object.keys(market).length
      ? { tokenFilter: { market } }
      : {}),
  };
}

function buildRequest(timeFrame: TimeFrame, minLiquidity: number, maxAgeHours: number) {
  const source = buildSource(timeFrame, minLiquidity, maxAgeHours);
  return {
    sources: {
      new: source,
      trending: source,
      topVolume: source,
      topGainers: source,
    },
  };
}

function formatUsd(value?: number, compact = false) {
  if (value === undefined || value === null || Number.isNaN(value)) return '—';
  if (value === 0) return '$0';

  if (compact && Math.abs(value) >= 1_000) {
    return '$' + Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(value);
  }

  if (Math.abs(value) < 0.0001) {
    return '$' + value.toExponential(2);
  }

  return '$' + Intl.NumberFormat('en-US', {
    maximumFractionDigits: value < 1 ? 8 : 4,
  }).format(value);
}

function formatCompact(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return '—';
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

function formatPercent(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return sign + value.toFixed(Math.abs(value) >= 100 ? 0 : 2) + '%';
}

function formatAge(seconds?: number) {
  if (seconds === undefined || seconds === null) return '—';
  if (seconds < 60) return Math.max(1, Math.round(seconds)) + 's';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + 'm';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + 'h';
  const days = Math.floor(hours / 24);
  return days + 'd';
}

function truncateAddress(value: string) {
  if (value.length <= 13) return value;
  return value.slice(0, 6) + '…' + value.slice(-5);
}

function riskLabel(token: ScannerItem) {
  if (token.rugged || token.audit?.honeypot) return { label: 'danger', level: 'danger' };
  const flags = [
    token.audit?.mintable,
    token.audit?.freezable,
    token.audit?.upgradeable,
    (token.holders?.top10Pct ?? 0) > 70,
    (token.holders?.devPct ?? 0) > 20,
  ].filter(Boolean).length;

  if (flags >= 2) return { label: 'watch', level: 'warn' };
  if (flags === 1) return { label: 'mixed', level: 'mixed' };
  return { label: 'clean-ish', level: 'good' };
}

function getWindow(token: ScannerItem, timeFrame: TimeFrame) {
  return token.stats?.timeframes?.[TF_KEY[timeFrame]] ?? token.stats?.timeframes?.['24h'];
}

function normalizeTokenImage(value?: string | null) {
  if (!value) return null;
  const image = value.trim();
  if (!image) return null;
  if (image.startsWith('ipfs://')) {
    return 'https://ipfs.io/ipfs/' + image.slice('ipfs://'.length).replace(/^ipfs\//, '');
  }
  if (image.startsWith('//')) return 'https:' + image;
  if (/^https?:\/\//i.test(image)) return image;
  return null;
}

function getTokenImage(token: ScannerItem) {
  const candidates = [
    token.imageUrl,
    token.image,
    token.imageUri,
    token.imageURI,
    token.tokenImageUrl,
    token.tokenImage,
    token.tokenLogoUrl,
    token.tokenLogo,
    token.logoUrl,
    token.logoURI,
    token.logo,
    token.icon,
    token.metadata?.imageUrl,
    token.metadata?.image,
    token.metadata?.imageUri,
    token.metadata?.logoUrl,
    token.metadata?.logo,
    token.metadata?.icon,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeTokenImage(candidate);
    if (normalized) return normalized;
  }
  return null;
}

function TokenAvatar({ token }: { token: ScannerItem }) {
  const image = getTokenImage(token);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [image]);

  const fallback = (token.tokenSymbol || token.tokenName || '?').slice(0, 2).toUpperCase();

  return (
    <div className={styles.tokenAvatar}>
      {image && !imageFailed ? (
        <img
          src={image}
          alt={(token.tokenSymbol || token.tokenName || 'Token') + ' thumbnail'}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
}

function SocialLinks({ token }: { token: ScannerItem }) {
  const items = [
    { href: token.socials?.twitter, label: 'X' },
    { href: token.socials?.telegram, label: 'TG' },
    { href: token.socials?.website, label: 'WEB' },
  ].filter((item): item is { href: string; label: string } => Boolean(item.href));

  if (!items.length) return <span className={styles.muted}>no socials</span>;

  return (
    <span className={styles.socials}>
      {items.map((item) => (
        <a key={item.label} href={item.href} target="_blank" rel="noreferrer">
          {item.label}
        </a>
      ))}
    </span>
  );
}

export default function HelloKittyScannerPage() {
  const [activeView, setActiveView] = useState<ViewKey>('trending');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('24H');
  const [minLiquidity, setMinLiquidity] = useState(10_000);
  const [maxAgeHours, setMaxAgeHours] = useState(0);
  const [query, setQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [data, setData] = useState<ScannerPageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadScanner = useCallback(async (signal?: AbortSignal) => {
    setError(null);
    setRefreshing(true);

    try {
      const response = await fetch('/api/opendex/scanner', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(buildRequest(timeFrame, minLiquidity, maxAgeHours)),
        cache: 'no-store',
        signal,
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message || payload?.error || 'OpenDEX scanner request failed');
      }

      setData(payload as ScannerPageResponse);
      setLastUpdated(new Date());
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
      const message = requestError instanceof Error ? requestError.message : 'Could not load OpenDEX data';
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [maxAgeHours, minLiquidity, timeFrame]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => loadScanner(controller.signal), 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [loadScanner]);

  useEffect(() => {
    if (!autoRefresh) return;

    const timer = window.setInterval(() => {
      loadScanner();
    }, 15_000);

    return () => window.clearInterval(timer);
  }, [autoRefresh, loadScanner]);

  const activeList = data?.[activeView] ?? null;
  const activeFailure = data?.meta?.sourceFailures?.[activeView];

  const visibleTokens = useMemo(() => {
    const tokens = activeList?.tokens ?? [];
    const normalized = query.trim().toLowerCase();

    if (!normalized) return tokens;

    return tokens.filter((token) =>
      [token.tokenName, token.tokenSymbol, token.tokenAddress, token.platformName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized)),
    );
  }, [activeList, query]);

  const failureCount = Object.keys(data?.meta?.sourceFailures ?? {}).length;
  const isInitialLoading = loading && !data && !error;

  return (
    <main className={styles.page}>
      <div className={styles.softBlobOne} />
      <div className={styles.softBlobTwo} />

      <section className={styles.shell}>
        <header className={styles.topbar}>
          <div className={styles.brand}>
            <span className={styles.bowMark}>🎀</span>
            <span>kitty scanner</span>
          </div>
          <div className={styles.backendBadge}>
            <span className={styles.liveDot} />
            OpenDEX v2
          </div>
        </header>

        <section className={styles.hero}>
          <div>
            <p className={styles.kicker}>cute interface. actual market data.</p>
            <h1>Hello Kitty<br />token scanner</h1>
            <p className={styles.subtitle}>
              New launches, hot tokens, volume leaders and gainers from one OpenDEX page bundle.
              Pink does not mean unserious.
            </p>
          </div>

          <div className={styles.kittyCard} aria-hidden="true">
            <div className={styles.bow}>
              <span />
              <i />
              <span />
            </div>
            <div className={styles.kittyFace}>
              <i className={styles.earLeft} />
              <i className={styles.earRight} />
              <b className={styles.eyeLeft} />
              <b className={styles.eyeRight} />
              <b className={styles.nose} />
              <span className={styles.whiskerOne} />
              <span className={styles.whiskerTwo} />
              <span className={styles.whiskerThree} />
              <span className={styles.whiskerFour} />
            </div>
            <div className={styles.kittyTag}>scan first. ape later.</div>
          </div>
        </section>

        <section className={styles.metrics}>
          <div className={styles.metricCard}>
            <span>tokens in view</span>
            <strong>{formatCompact(activeList?.tokens?.length)}</strong>
          </div>
          <div className={styles.metricCard}>
            <span>feed volume</span>
            <strong>{formatUsd(activeList?.stats?.volume, true)}</strong>
          </div>
          <div className={styles.metricCard}>
            <span>transactions</span>
            <strong>{formatCompact(activeList?.stats?.transactions)}</strong>
          </div>
          <div className={styles.metricCard}>
            <span>source failures</span>
            <strong className={failureCount ? styles.metricDanger : ''}>{failureCount}</strong>
          </div>
        </section>

        <section className={styles.scanner}>
          <div className={styles.tabs}>
            {(Object.keys(VIEW_META) as ViewKey[]).map((view) => (
              <button
                key={view}
                className={activeView === view ? styles.activeTab : styles.tab}
                onClick={() => setActiveView(view)}
              >
                <span>{VIEW_META[view].label}</span>
                <small>{VIEW_META[view].eyebrow}</small>
              </button>
            ))}
          </div>

          <div className={styles.controls}>
            <label className={styles.searchBox}>
              <span>⌕</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="token, ticker, address…"
              />
            </label>

            <label className={styles.selectWrap}>
              <span>time</span>
              <select value={timeFrame} onChange={(event) => setTimeFrame(event.target.value as TimeFrame)}>
                <option value="5M">5 min</option>
                <option value="1H">1 hour</option>
                <option value="6H">6 hours</option>
                <option value="24H">24 hours</option>
              </select>
            </label>

            <label className={styles.selectWrap}>
              <span>liquidity</span>
              <select value={minLiquidity} onChange={(event) => setMinLiquidity(Number(event.target.value))}>
                {LIQUIDITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <label className={styles.selectWrap}>
              <span>age</span>
              <select value={maxAgeHours} onChange={(event) => setMaxAgeHours(Number(event.target.value))}>
                {AGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <button
              className={autoRefresh ? styles.autoButtonActive : styles.autoButton}
              onClick={() => setAutoRefresh((value) => !value)}
            >
              <span className={styles.liveDot} />
              auto 15s
            </button>

            <button className={styles.refreshButton} onClick={() => loadScanner()} disabled={refreshing}>
              {refreshing ? 'refreshing…' : 'refresh'}
            </button>
          </div>

          <div className={styles.statusRow}>
            <div>
              <span className={styles.statusLabel}>
                {activeList === null && data ? 'source unavailable' : 'live snapshot'}
              </span>
              {lastUpdated && <span>updated {lastUpdated.toLocaleTimeString()}</span>}
            </div>
            <span>{visibleTokens.length} shown</span>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <strong>OpenDEX request failed.</strong>
              <span>{error}</span>
              <button onClick={() => loadScanner()}>retry</button>
            </div>
          )}

          {activeFailure && (
            <div className={styles.failureBanner}>
              <strong>{VIEW_META[activeView].label} source failed.</strong>
              <span>{activeFailure.reason || 'OpenDEX returned this section as unavailable.'}</span>
              <em>{activeFailure.retryable ? 'retryable' : 'not marked retryable'}</em>
            </div>
          )}

          <div className={styles.tableWrap}>
            <div className={styles.tableHeader}>
              <span>token</span>
              <span>price</span>
              <span>{timeFrame} move</span>
              <span>liquidity</span>
              <span>mcap</span>
              <span>volume</span>
              <span>buys / sells</span>
              <span>holders</span>
              <span>risk</span>
              <span>age</span>
            </div>

            {isInitialLoading && (
              <div className={styles.statePanel}>
                <div className={styles.loaderBow}>🎀</div>
                <strong>Scanning the chain…</strong>
                <span>Keeping the interface cute while OpenDEX does the serious part.</span>
              </div>
            )}

            {!isInitialLoading && activeList && visibleTokens.length === 0 && (
              <div className={styles.statePanel}>
                <div className={styles.loaderBow}>♡</div>
                <strong>No tokens match this look.</strong>
                <span>Relax liquidity, age or search filters.</span>
              </div>
            )}

            {!isInitialLoading && activeList === null && !activeFailure && data && (
              <div className={styles.statePanel}>
                <div className={styles.loaderBow}>×</div>
                <strong>This scanner section is unavailable.</strong>
                <span>The other OpenDEX sections can still remain valid.</span>
              </div>
            )}

            {visibleTokens.map((token) => {
              const windowStats = getWindow(token, timeFrame);
              const risk = riskLabel(token);
              return (
                <article className={styles.tokenRow} key={(token.chain ?? '') + token.tokenAddress}>
                  <div className={styles.tokenIdentity}>
                    <TokenAvatar token={token} />
                    <div>
                      <div className={styles.tokenNameLine}>
                        <strong>{token.tokenSymbol || '???'}</strong>
                        <span>{token.tokenName || 'Unnamed token'}</span>
                      </div>
                      <div className={styles.tokenMeta}>
                        <button
                          onClick={() => navigator.clipboard?.writeText(token.tokenAddress)}
                          title="Copy token address"
                        >
                          {truncateAddress(token.tokenAddress)}
                        </button>
                        <span>•</span>
                        <span>{token.platformName || token.chain || 'unknown'}</span>
                        <SocialLinks token={token} />
                      </div>
                    </div>
                  </div>

                  <div className={styles.cell} data-label="price">
                    <strong>{formatUsd(token.quote?.priceUsd)}</strong>
                  </div>

                  <div className={styles.cell} data-label={timeFrame + ' move'}>
                    <strong className={(windowStats?.priceChangePct ?? 0) >= 0 ? styles.positive : styles.negative}>
                      {formatPercent(windowStats?.priceChangePct)}
                    </strong>
                  </div>

                  <div className={styles.cell} data-label="liquidity">
                    <strong>{formatUsd(token.quote?.liquidityUsd, true)}</strong>
                  </div>

                  <div className={styles.cell} data-label="mcap">
                    <strong>{formatUsd(token.quote?.marketCapUsd ?? token.quote?.fullyDilutedValue, true)}</strong>
                  </div>

                  <div className={styles.cell} data-label="volume">
                    <strong>{formatUsd(windowStats?.volume, true)}</strong>
                    <small>{formatCompact(windowStats?.transactions)} tx</small>
                  </div>

                  <div className={styles.cell} data-label="buys / sells">
                    <strong>{formatCompact(windowStats?.buys)} <i>/</i> {formatCompact(windowStats?.sells)}</strong>
                    <small>{windowStats?.buyVolumePct !== undefined ? Math.round(windowStats.buyVolumePct) + '% buy vol' : '—'}</small>
                  </div>

                  <div className={styles.cell} data-label="holders">
                    <strong>{formatCompact(token.holders?.holderCount)}</strong>
                    <small>{token.holders?.top10Pct !== undefined ? 'top10 ' + token.holders.top10Pct.toFixed(1) + '%' : '—'}</small>
                  </div>

                  <div className={styles.cell} data-label="risk">
                    <span className={styles['risk_' + risk.level]}>{risk.label}</span>
                    <small>{token.audit?.lpLocked ? 'LP locked' : token.audit?.contractVerified ? 'verified' : 'check audit'}</small>
                  </div>

                  <div className={styles.cell} data-label="age">
                    <strong>{formatAge(token.createdAtAgeSeconds)}</strong>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <footer className={styles.footer}>
          <span>Frontend: kitty energy</span>
          <span>Backend: OpenDEX</span>
          <a href="https://portal.opendex.ws/docs" target="_blank" rel="noreferrer">read the API docs ↗</a>
        </footer>
      </section>
    </main>
  );
}
