# Hello Kitty OpenDEX scanner

A themed scanner route built on top of the OpenDEX v2 scanner page bundle.

## Route

- UI: `/hello-kitty-scanner`
- Server proxy: `POST /api/opendex/scanner`
- Upstream: `POST /v2/pages/scanner`

The UI deliberately keeps the presentation playful while using real OpenDEX scanner fields and failure semantics.

## What is wired

- New tokens
- Trending / Hot
- Top volume
- Top gainers
- 5M / 1H / 6H / 24H activity timeframe
- Server-side minimum liquidity filter
- Server-side maximum age filter
- Client-side token / ticker / address search inside the loaded page
- 15-second optional refresh
- Per-source failure handling through `meta.sourceFailures`
- Loading, empty, failed and retained-data states
- Price, percentage move, liquidity, market cap, volume, transactions, buys/sells, holders, holder concentration, audit flags, age, platform and social links

## Environment

Public scanner data works without user auth according to the OpenDEX v2 contract. If a platform API key is needed for the selected environment, keep it on the server:

```bash
OPENDEX_API_BASE=https://api.opendex.ws
OPENDEX_API_KEY=odx_b2b_...
```

The browser never receives `OPENDEX_API_KEY`.

## API request shape

The scanner uses the page bundle so all four views come back in one request:

```json
{
  "sources": {
    "new": {
      "timeFrame": "24H",
      "tokenFilter": {
        "market": {
          "liquidityUsd": { "min": 10000 }
        }
      }
    },
    "trending": {},
    "topVolume": {},
    "topGainers": {}
  }
}
```

A source returning `null` is treated as failed/unavailable, not as a successful empty list.

## OpenDEX references

- https://opendex.ws
- https://portal.opendex.ws/docs
- https://portal.opendex.ws/docs/guides/scanner
- https://portal.opendex.ws/api-reference/pages_scanner
