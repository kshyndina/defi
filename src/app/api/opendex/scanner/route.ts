import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DEFAULT_API_BASE = 'https://api.opendex.ws';

function normalizeBaseUrl(value: string) {
  return value.replace(/\/$/, '');
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'invalid_request', message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const apiBase = normalizeBaseUrl(process.env.OPENDEX_API_BASE || DEFAULT_API_BASE);
  const headers: HeadersInit = {
    accept: 'application/json',
    'content-type': 'application/json',
  };

  if (process.env.OPENDEX_API_KEY) {
    headers['X-API-Key'] = process.env.OPENDEX_API_KEY;
  }

  try {
    const upstream = await fetch(apiBase + '/v2/pages/scanner', {
      method: 'POST',
      headers,
      body: JSON.stringify(body ?? {}),
      cache: 'no-store',
    });

    const raw = await upstream.text();
    let payload: unknown;

    try {
      payload = raw ? JSON.parse(raw) : {};
    } catch {
      payload = {
        error: 'invalid_upstream_response',
        message: raw || 'OpenDEX returned a non-JSON response.',
      };
    }

    if (!upstream.ok) {
      return NextResponse.json(
        {
          error: 'opendex_request_failed',
          message:
            (payload as { message?: string; error?: string })?.message ||
            (payload as { message?: string; error?: string })?.error ||
            'OpenDEX scanner request failed.',
          upstreamStatus: upstream.status,
          details: payload,
        },
        { status: upstream.status },
      );
    }

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        'cache-control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'opendex_unreachable',
        message: error instanceof Error ? error.message : 'Could not reach OpenDEX.',
      },
      { status: 502 },
    );
  }
}
