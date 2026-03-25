import { createDecipheriv } from "crypto";

export default async function decrypt(encr: string) {
    const encryptionKey = "c7f4d493641e10500281260c6d6eb057599618d8844d94c9828b3e9e002859d9"
    const encryptionIV = "d78c12a7f93158cab68aedfe4a05fdfb"
    const key = Buffer.from(encryptionKey, "hex");
    const iv = Buffer.from(encryptionIV, "hex");
    const encryptedText = encr.replace(/-/g, "+").replace(/_/g, "/");
    const paddedText = encryptedText.padEnd(
        encryptedText.length + ((4 - (encryptedText.length % 4)) % 4),
        "="
    );
    // const key = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");
    // const iv = Buffer.from(process.env.ENCRYPTION_IV!, "hex");
    const encrypted = Buffer.from(paddedText, "base64");
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
