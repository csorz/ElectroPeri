import CryptoJS from 'crypto-js'

export type HashAlgo = 'MD5' | 'SHA1' | 'SHA256' | 'SHA512'

export function hashString(algo: HashAlgo, text: string): string {
  const wordArray = CryptoJS.enc.Utf8.parse(text)
  if (algo === 'MD5') return CryptoJS.MD5(wordArray).toString(CryptoJS.enc.Hex)
  if (algo === 'SHA1') return CryptoJS.SHA1(wordArray).toString(CryptoJS.enc.Hex)
  if (algo === 'SHA256') return CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex)
  return CryptoJS.SHA512(wordArray).toString(CryptoJS.enc.Hex)
}

export function hashStringAll(text: string): Record<HashAlgo, string> {
  const wordArray = CryptoJS.enc.Utf8.parse(text)
  return {
    MD5: CryptoJS.MD5(wordArray).toString(CryptoJS.enc.Hex),
    SHA1: CryptoJS.SHA1(wordArray).toString(CryptoJS.enc.Hex),
    SHA256: CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex),
    SHA512: CryptoJS.SHA512(wordArray).toString(CryptoJS.enc.Hex)
  }
}

export async function hashFile(algo: HashAlgo, file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(buffer))
  if (algo === 'MD5') return CryptoJS.MD5(wordArray).toString(CryptoJS.enc.Hex)
  if (algo === 'SHA1') return CryptoJS.SHA1(wordArray).toString(CryptoJS.enc.Hex)
  if (algo === 'SHA256') return CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex)
  return CryptoJS.SHA512(wordArray).toString(CryptoJS.enc.Hex)
}

export async function hashFileAll(file: File): Promise<Record<HashAlgo, string>> {
  const buffer = await file.arrayBuffer()
  const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(buffer))
  return {
    MD5: CryptoJS.MD5(wordArray).toString(CryptoJS.enc.Hex),
    SHA1: CryptoJS.SHA1(wordArray).toString(CryptoJS.enc.Hex),
    SHA256: CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex),
    SHA512: CryptoJS.SHA512(wordArray).toString(CryptoJS.enc.Hex)
  }
}
