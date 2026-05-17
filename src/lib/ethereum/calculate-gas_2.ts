import { getEip1559Fees } from '@/lib/ethereum';

const BASE_GAS = 279336;
const GAS_PER_CANDIDATE = 91600;

export async function calculateGas2(candidateCount: number) {
  const estimatedGas = BigInt(BASE_GAS + GAS_PER_CANDIDATE * candidateCount);
  const { maxFeePerGas } = await getEip1559Fees();

  return estimatedGas * maxFeePerGas;
}
