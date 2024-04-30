export function generateRsaKeypair(): { secret: string; public: string };

export function sign(secretKeyPem: string, blindMsg: string): string;

export function verify(
  publicKeyPem: string,
  signatureBytes: string,
  msgRandomizer: string,
  msg: string
): boolean;
