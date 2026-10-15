import { createDecipheriv } from "crypto";

export default async function decrypt(encr: string) {
    const encryptionKey = process.env.NEXT_PUBLIC_Encryption_Keyy ?? "be78"
    const encryptionIV = process.env.NEXT_PUBLIC_Encryption_Vector ?? "ac35"
    const key = Buffer.from(encryptionKey, "hex");
    const iv = Buffer.from(encryptionIV, "hex");
    const encryptedText = encr.replace(/-/g, "+").replace(/_/g, "/");
    // const key = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");
    // const iv = Buffer.from(process.env.ENCRYPTION_IV!, "hex");
    const encrypted = Buffer.from(encryptedText, "base64");
    const decipher = createDecipheriv("aes-256-cbc", key, iv);
    const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
    ]);
    // console.log(decrypted.toString("utf-8"))
    return decrypted.toString("utf8");
    // return "X"
    //   let decrypted = decipher.update(encryptedText, "base64", "utf8");
    //   decrypted += decipher.final("utf8");
    //   return decrypted;
}