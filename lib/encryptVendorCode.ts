import crypto from "crypto";

const SALT = Buffer.from([
    0x49, 0x76, 0x61, 0x6e, 0x20, 0x4d, 0x65, 0x64, 0x76, 0x65, 0x64, 0x65, 0x76,
]); // "Ivan Medvedev"

const PBKDF2_ITERATIONS = 1000;

function deriveKeyAndIV(encryptionKey: string) {
    const derived = crypto.pbkdf2Sync(
        encryptionKey,
        SALT,
        PBKDF2_ITERATIONS,
        48,
        "sha1",
    );

    return {
        key: derived.subarray(0, 32),
        iv: derived.subarray(32, 48),
    };
}

export function encrypt(clearText: string): string {
    const encryptionKey = process.env.NEXT_PUBLIC_WMS_AES_KEY;
    if (!encryptionKey) {
        throw new Error("AES_ENCRYPTION_KEY is not set in environment variables");
    }

    const { key, iv } = deriveKeyAndIV(encryptionKey);

    const clearBytes = Buffer.from(clearText, "utf16le");

    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    const encrypted = Buffer.concat([cipher.update(clearBytes), cipher.final()]);

    return encrypted.toString("base64");
}
