import CryptoJS from 'crypto-js'

export function hashDni(value: string): string {
  return CryptoJS.SHA256(value).toString()
}