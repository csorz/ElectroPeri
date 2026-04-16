import CryptoJS from 'crypto-js'

export type HashAlgo =
  | 'MD5'
  | 'SHA1'
  | 'SHA224'
  | 'SHA256'
  | 'SHA384'
  | 'SHA512'
  | 'SHA3_256'
  | 'SHA3_512'
  | 'RIPEMD160'

export type HashAlgoInfo = {
  name: string
  bits: number
  hexLength: number
  security: 'broken' | 'weak' | 'safe' | 'recommended'
  category: 'legacy' | 'sha2' | 'sha3' | 'other'
}

export const HASH_ALGO_INFO: Record<HashAlgo, HashAlgoInfo> = {
  MD5: { name: 'MD5', bits: 128, hexLength: 32, security: 'broken', category: 'legacy' },
  SHA1: { name: 'SHA-1', bits: 160, hexLength: 40, security: 'weak', category: 'legacy' },
  SHA224: { name: 'SHA-224', bits: 224, hexLength: 56, security: 'safe', category: 'sha2' },
  SHA256: { name: 'SHA-256', bits: 256, hexLength: 64, security: 'recommended', category: 'sha2' },
  SHA384: { name: 'SHA-384', bits: 384, hexLength: 96, security: 'recommended', category: 'sha2' },
  SHA512: { name: 'SHA-512', bits: 512, hexLength: 128, security: 'recommended', category: 'sha2' },
  SHA3_256: { name: 'SHA3-256', bits: 256, hexLength: 64, security: 'recommended', category: 'sha3' },
  SHA3_512: { name: 'SHA3-512', bits: 512, hexLength: 128, security: 'recommended', category: 'sha3' },
  RIPEMD160: { name: 'RIPEMD-160', bits: 160, hexLength: 40, security: 'safe', category: 'other' }
}

export const ALGO_ORDER: HashAlgo[] = [
  'MD5',
  'SHA1',
  'SHA224',
  'SHA256',
  'SHA384',
  'SHA512',
  'SHA3_256',
  'SHA3_512',
  'RIPEMD160'
]

export function hashString(algo: HashAlgo, text: string): string {
  const wordArray = CryptoJS.enc.Utf8.parse(text)

  switch (algo) {
    case 'MD5':
      return CryptoJS.MD5(wordArray).toString(CryptoJS.enc.Hex)
    case 'SHA1':
      return CryptoJS.SHA1(wordArray).toString(CryptoJS.enc.Hex)
    case 'SHA224':
      return CryptoJS.SHA224(wordArray).toString(CryptoJS.enc.Hex)
    case 'SHA256':
      return CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex)
    case 'SHA384':
      return CryptoJS.SHA384(wordArray).toString(CryptoJS.enc.Hex)
    case 'SHA512':
      return CryptoJS.SHA512(wordArray).toString(CryptoJS.enc.Hex)
    case 'SHA3_256':
      return CryptoJS.SHA3(wordArray, { outputLength: 256 }).toString(CryptoJS.enc.Hex)
    case 'SHA3_512':
      return CryptoJS.SHA3(wordArray, { outputLength: 512 }).toString(CryptoJS.enc.Hex)
    case 'RIPEMD160':
      return CryptoJS.RIPEMD160(wordArray).toString(CryptoJS.enc.Hex)
    default:
      throw new Error(`Unsupported algorithm: ${algo}`)
  }
}

export function hashStringAll(text: string): Record<HashAlgo, string> {
  const wordArray = CryptoJS.enc.Utf8.parse(text)
  return {
    MD5: CryptoJS.MD5(wordArray).toString(CryptoJS.enc.Hex),
    SHA1: CryptoJS.SHA1(wordArray).toString(CryptoJS.enc.Hex),
    SHA224: CryptoJS.SHA224(wordArray).toString(CryptoJS.enc.Hex),
    SHA256: CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex),
    SHA384: CryptoJS.SHA384(wordArray).toString(CryptoJS.enc.Hex),
    SHA512: CryptoJS.SHA512(wordArray).toString(CryptoJS.enc.Hex),
    SHA3_256: CryptoJS.SHA3(wordArray, { outputLength: 256 }).toString(CryptoJS.enc.Hex),
    SHA3_512: CryptoJS.SHA3(wordArray, { outputLength: 512 }).toString(CryptoJS.enc.Hex),
    RIPEMD160: CryptoJS.RIPEMD160(wordArray).toString(CryptoJS.enc.Hex)
  }
}

export async function hashFile(algo: HashAlgo, file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(buffer))

  switch (algo) {
    case 'MD5':
      return CryptoJS.MD5(wordArray).toString(CryptoJS.enc.Hex)
    case 'SHA1':
      return CryptoJS.SHA1(wordArray).toString(CryptoJS.enc.Hex)
    case 'SHA224':
      return CryptoJS.SHA224(wordArray).toString(CryptoJS.enc.Hex)
    case 'SHA256':
      return CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex)
    case 'SHA384':
      return CryptoJS.SHA384(wordArray).toString(CryptoJS.enc.Hex)
    case 'SHA512':
      return CryptoJS.SHA512(wordArray).toString(CryptoJS.enc.Hex)
    case 'SHA3_256':
      return CryptoJS.SHA3(wordArray, { outputLength: 256 }).toString(CryptoJS.enc.Hex)
    case 'SHA3_512':
      return CryptoJS.SHA3(wordArray, { outputLength: 512 }).toString(CryptoJS.enc.Hex)
    case 'RIPEMD160':
      return CryptoJS.RIPEMD160(wordArray).toString(CryptoJS.enc.Hex)
    default:
      throw new Error(`Unsupported algorithm: ${algo}`)
  }
}

export async function hashFileAll(file: File): Promise<Record<HashAlgo, string>> {
  const buffer = await file.arrayBuffer()
  const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(buffer))
  return {
    MD5: CryptoJS.MD5(wordArray).toString(CryptoJS.enc.Hex),
    SHA1: CryptoJS.SHA1(wordArray).toString(CryptoJS.enc.Hex),
    SHA224: CryptoJS.SHA224(wordArray).toString(CryptoJS.enc.Hex),
    SHA256: CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex),
    SHA384: CryptoJS.SHA384(wordArray).toString(CryptoJS.enc.Hex),
    SHA512: CryptoJS.SHA512(wordArray).toString(CryptoJS.enc.Hex),
    SHA3_256: CryptoJS.SHA3(wordArray, { outputLength: 256 }).toString(CryptoJS.enc.Hex),
    SHA3_512: CryptoJS.SHA3(wordArray, { outputLength: 512 }).toString(CryptoJS.enc.Hex),
    RIPEMD160: CryptoJS.RIPEMD160(wordArray).toString(CryptoJS.enc.Hex)
  }
}

// Web Crypto API 原生支持（仅支持 SHA 系列）
export async function hashStringNative(algo: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512', text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest(algo, data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function hashFileNative(algo: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512', file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest(algo, buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
