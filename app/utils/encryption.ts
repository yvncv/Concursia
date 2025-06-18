import CryptoJS from 'crypto-js'

const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_DNI_KEY

export function encryptValue(value: string): string {
  return CryptoJS.AES.encrypt(value, SECRET_KEY).toString()
}

export function decryptValue(encrypted: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY)
    return bytes.toString(CryptoJS.enc.Utf8)
  } catch {
    return 'valor_incompatible'
  }
}
