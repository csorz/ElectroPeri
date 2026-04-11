import CryptoJS from 'crypto-js'

export type HashAlgo = 'MD5' | 'SHA1' | 'SHA256'

export function hashString(algo: HashAlgo, text: string): string {
  const wordArray = CryptoJS.enc.Utf8.parse(text)
  if (algo === 'MD5') return CryptoJS.MD5(wordArray).toString(CryptoJS.enc.Hex)
  if (algo === 'SHA1') return CryptoJS.SHA1(wordArray).toString(CryptoJS.enc.Hex)
  return CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex)
}

export async function hashFile(algo: HashAlgo, file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(buffer))
  if (algo === 'MD5') return CryptoJS.MD5(wordArray).toString(CryptoJS.enc.Hex)
  if (algo === 'SHA1') return CryptoJS.SHA1(wordArray).toString(CryptoJS.enc.Hex)
  return CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex)
}
