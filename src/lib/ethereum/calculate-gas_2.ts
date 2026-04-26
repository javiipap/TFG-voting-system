import { PRIORITY_FEE_PER_GAS } from '@/lib/ethereum';

export async function calculateGas2(candidateCount: number) {
  const basePrice = 262000;
  const candidateCost = 114115;

  return (
    PRIORITY_FEE_PER_GAS * BigInt(basePrice + candidateCost * candidateCount)
  );
}
