'use server';

import { readFileSync } from 'fs';

export async function getContractInfo() {
  const abi = JSON.parse(
    readFileSync(process.cwd() + '/public/contracts/bin/abi.json').toString()
  );

  const byteCode = readFileSync(
    process.cwd() + '/public/contracts/bin/bytecode'
  ).toString();

  return {
    abi,
    byteCode,
  };
}
