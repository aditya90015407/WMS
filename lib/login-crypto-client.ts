const LOGIN_ENCRYPTION_KEY_HEX = process.env.NEXT_PUBLIC_Encryption_Keyy ?? "be78"
const LOGIN_ENCRYPTION_IV_HEX = process.env.NEXT_PUBLIC_Encryption_Vector ?? "ac35"


const hexToBytes = (hex: string): Uint8Array => {
  const pairs = hex.match(/.{1,2}/g) ?? [];
  return new Uint8Array(pairs.map((pair) => parseInt(pair, 16)));
};

const toBase64 = (bytes: Uint8Array): string => {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export const encryptForLogin = async (value: string): Promise<string> => {
  const keyBytes = new Uint8Array(hexToBytes(LOGIN_ENCRYPTION_KEY_HEX));
  const iv = new Uint8Array(hexToBytes(LOGIN_ENCRYPTION_IV_HEX));
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-CBC" },
    false,
    ["encrypt"],
  );

  const encoded = new TextEncoder().encode(value);
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv },
    cryptoKey,
    encoded,
  );
  const base64 = toBase64(new Uint8Array(cipherBuffer));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

