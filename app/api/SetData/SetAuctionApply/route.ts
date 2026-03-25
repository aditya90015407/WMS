import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import * as sql from "mssql";
import { getConnection } from "@/lib/dbConnect";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

const fileToBase64 = async (file: File | null): Promise<string> => {
  if (!file) return "";
  const buf = Buffer.from(await file.arrayBuffer());
  return buf.toString("base64");
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const createdBy = String(session?.user?.id ?? "").trim();

    if (!createdBy) {
      return NextResponse.json(
        { success: false, message: "Session not found. Please sign in again." },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const name = String(formData.get("Name") ?? "").trim();
    const email = String(formData.get("Email") ?? "").trim();

    const ctoFile = formData.get("CTO") as File | null;
    const hwAuthOspcbFile = formData.get("HWAuth") as File | null;
    const hwAuthSpcbFile = (formData.get("HWAuthSPCB") as File | null) ?? hwAuthOspcbFile;
    const blueBookFile = formData.get("BlueBook") as File | null;
    const registrationCertificateFile = formData.get("EPR") as File | null;

    if (!name || !email || !ctoFile || !hwAuthOspcbFile || !blueBookFile || !registrationCertificateFile) {
      return NextResponse.json(
        { success: false, message: "Missing required fields/files" },
        { status: 400 }
      );
    }

    const ctoBase64 = await fileToBase64(ctoFile);
    const hwOspcbBase64 = await fileToBase64(hwAuthOspcbFile);
    const hwSpcbBase64 = await fileToBase64(hwAuthSpcbFile);
    const blueBookBase64 = await fileToBase64(blueBookFile);
    const regCertBase64 = await fileToBase64(registrationCertificateFile);

    const pool = await getConnection();
    if (!pool || !pool.connected) {
      throw new Error("SQL pool is not connected after getConnection()");
    }

    const result = await pool
      .request()
      .input("FLAG", sql.NVarChar(50), 'InsertAuctionVendorDetails')
      .input("Name", sql.NVarChar(200), name)
      .input("Email", sql.NVarChar(200), email)
      .input("CtoRespectiveFile", sql.NVarChar(sql.MAX), ctoBase64)
      .input("HwAuthorizationOspcbFile", sql.NVarChar(sql.MAX), hwOspcbBase64)
      .input("HwAuthorizationSpcbFile", sql.NVarChar(sql.MAX), hwSpcbBase64)
      .input("BlueBookFile", sql.NVarChar(sql.MAX), blueBookBase64)
      .input("RegistrationCertificateFile", sql.NVarChar(sql.MAX), regCertBase64)
      .input("CRBY", sql.NVarChar(50), createdBy)
      .execute("PRO-WMS_SET");

    const firstRow = result.recordset?.[0] as Record<string, unknown> | undefined;
    const values = firstRow ? Object.values(firstRow) : [];
    const message = typeof values[0] === "string" ? values[0] : "Saved successfully";
    const refId = values.length > 1 && values[1] != null ? String(values[1]) : "";

    return NextResponse.json({
      success: true,
      message,
      refId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown Message";
    return NextResponse.json(
      {
        success: false,
        message: "Auction apply API failed",
        error: message,
      },
      { status: 500 }
    );
  }
}
