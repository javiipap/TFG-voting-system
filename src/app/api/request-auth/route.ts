import { env } from '@/env';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const cert = request.headers.get('X-SSL-CERT');
  const dn = request.headers.get('X-SSL-DN') || '';

  if (!cert) {
    return new Response('', { status: 401 });
  }

  const email = dn.split(',')[0].replace('emailAddress=', '');

  if (!email || !dn) {
    return new Response('', { status: 403 });
  }

  return new Response(JSON.stringify({ cert, email }), {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': `https://${env.NEXT_PUBLIC_DOMAIN}`,
    },
  });
}
