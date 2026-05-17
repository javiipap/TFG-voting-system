import { getEip1559Fees } from '@/lib/ethereum';

export async function calculateGas2(candidateCount: number) {
  const basePrice = 279336;
  const candidateCost = 91600;
  const { maxFeePerGas } = await getEip1559Fees();

  return maxFeePerGas * BigInt(basePrice + candidateCost * candidateCount);
}
