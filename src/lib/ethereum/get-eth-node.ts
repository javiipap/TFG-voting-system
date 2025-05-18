import { env } from '@/env';

export function getEthNode() {
  const nodes = env.NEXT_PUBLIC_ETH_HOSTS;

  if (!nodes) throw 'No nodes were found';

  const parsed = nodes.split(',').filter((val) => val !== '');
  return parsed[Math.floor(Math.random() * parsed.length)];
}
