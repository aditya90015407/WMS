import { getConnection } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import sql from "mssql";
import { generateUniqueFileName } from "@/lib/filename";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const pool = await getConnection();
    if (!pool || !pool.connected) {
      throw new Error("Could not connect to Database");
    }

    const form = await req.formData();

    const apid = String(form.get("APID") || "");
    const empCode = String(form.get("EmpCode") || "");
    const remarks = String(form.get("Remarks") || "");

    if (!apid) {
      return NextResponse.json(
        { success: false, message: "APID is required" },
        { status: 400 }
      );
    }

    const ctoFile = form.get("CtoRespectiveFile") as File | null;
    const hwOspcbFile = form.get("HwAuthorizationOspcbFile") as File | null;
    const hwSpcbFile = form.get("HwAuthorizationSpcbFile") as File | null;
    const blueBookFile = form.get("BlueBookFile") as File | null;
    const regCertFile = form.get("RegistrationCertificateFile") as File | null;

    const ctoFileName = generateUniqueFileName(ctoFile?.name ?? "cto.png");
    const hwOspcbFileName = generateUniqueFileName(hwOspcbFile?.name ?? "ospcb.png");
    const hwSpcbFileName = generateUniqueFileName(hwSpcbFile?.name ?? "spcb.png");
    const blueBookFileName = generateUniqueFileName(blueBookFile?.name ?? "bluebook.png");
    const regCertFileName = generateUniqueFileName(regCertFile?.name ?? "regcert.png");

    // const saveDir = "D:\\WMS UPDATE\\WMS-main\\Attachments";
    const rootdir = process.cwd()
    const saveDir = `${rootdir}/Attachments`;
    // console.log(saveDir)
    if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });

    async function saveFile(file: File | null, fileName: string) {
      if (!file) return;
      const buffer = Buffer.from(await file.arrayBuffer());
      const filePath = path.join(saveDir, fileName);
      fs.writeFileSync(filePath, buffer);
    }

    await saveFile(ctoFile, ctoFileName);
    await saveFile(hwOspcbFile, hwOspcbFileName);
    await saveFile(hwSpcbFile, hwSpcbFileName);
    await saveFile(blueBookFile, blueBookFileName);
    await saveFile(regCertFile, regCertFileName);

    const result = await pool
      .request()
      .input("FLAG", sql.VarChar, "InsertAuctionParticipantsLine")
      .input("APID", sql.VarChar, apid)
      .input("CtoRespectiveFile", sql.VarChar, ctoFileName)
      .input("HwAuthorizationOspcbFile", sql.VarChar, hwOspcbFileName)
      .input("HwAuthorizationSpcbFile", sql.VarChar, hwSpcbFileName)
      .input("BlueBookFile", sql.VarChar, blueBookFileName)
      .input("RegistrationCertificateFile", sql.VarChar, regCertFileName)
      .input("Remarks", sql.VarChar, remarks)
      .input("EmpCode", sql.VarChar, empCode)
      .execute("PRO-WMS_SET");

    // console.log("rowsAffected:", result.rowsAffected);
    // console.log("recordset:", result.recordset);

    return NextResponse.json({ success: true, message: "Documents saved" });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
