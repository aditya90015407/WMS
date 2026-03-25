import { createCipheriv } from "crypto";



export default async function encrypt(text: string) {
  // console.log(text)
const encryptionKey = "c7f4d493641e10500281260c6d6eb057599618d8844d94c9828b3e9e002859d9"
const encryptionIV = "d78c12a7f93158cab68aedfe4a05fdfb"
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
