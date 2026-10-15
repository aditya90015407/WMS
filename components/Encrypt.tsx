import { createCipheriv } from "crypto";
import crypto from 'crypto';



export default async function encrypt(text: string) {
  // console.log(text)
  const encryptionKey = process.env.NEXT_PUBLIC_Encryption_Keyy ?? "be78"
  const encryptionIV = process.env.NEXT_PUBLIC_Encryption_Vector ?? "ac35"

  // const encryptionKey=process.env
  //     const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");
  // const iv = Buffer.from(process.env.ENCRYPTION_IV, "hex");
  const key = Buffer.from(encryptionKey, "hex");
  const iv = Buffer.from(encryptionIV, "hex");
  //        console.log(key)
  //     console.log(iv)
  const cipher = createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final()
  ]);
  // console.log(encrypted.toString("base64"))
  const encr = encrypted.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return encr;
  //   let encrypted = cipher.update(text, "utf8", "base64");
  //   encrypted += cipher.final("base64");
  //   return encrypted;
}