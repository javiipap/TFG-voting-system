import { PRIORITY_FEE_PER_GAS } from '@/lib/ethereum';

export async function calculateGas2(candidateCount: number) {
  const basePrice = 279336;
  const candidateCost = 91600;

  return (
    PRIORITY_FEE_PER_GAS * BigInt(basePrice + candidateCost * candidateCount)
  );
}
