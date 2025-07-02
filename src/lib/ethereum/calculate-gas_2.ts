export async function calculateGas2(candidateCount: number) {
  const basePrice = 265000;
  const candidateCost = 115000;

  const gasPrice = BigInt(1000000);

  return gasPrice * BigInt(basePrice + candidateCost * candidateCount);
}
