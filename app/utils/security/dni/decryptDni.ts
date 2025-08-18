import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_DNI_KEY;

export function decryptDni(encryptedDni: string): string | null {
    if (!encryptedDni || typeof encryptedDni !== "string" || !encryptedDni.startsWith("U2FsdGVkX1")) {
        return null;
    }
    try {
        const decrypted = CryptoJS.AES.decrypt(encryptedDni, SECRET_KEY).toString(CryptoJS.enc.Utf8);
        return decrypted || null;
    } catch {
        return null;
    }
}