const LOGIN_ENCRYPTION_KEY_HEX =
  "c7f4d493641e10500281260c6d6eb057599618d8844d94c9828b3e9e002859d9";
const LOGIN_ENCRYPTION_IV_HEX = "d78c12a7f93158cab68aedfe4a05fdfb";

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
  const keyBytes = hexToBytes(LOGIN_ENCRYPTION_KEY_HEX);
  const iv = hexToBytes(LOGIN_ENCRYPTION_IV_HEX);
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

