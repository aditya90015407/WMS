import { NextResponse } from "next/server";
import * as sql from "mssql";
import { getConnection } from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    console.log(form);
    const session = await getServerSession(authOptions);
    const empCode = String(session?.user?.id ?? "").trim();

    if (!empCode) {
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 401 }
      );
    }

    const pool = await getConnection();
    if (!pool || !pool.connected) {
      throw new Error("SQL pool is not connected after getConnection()");
    }

    const result = await pool
      .request()
      .input("FLAG", sql.NVarChar(50), "SetFinalDisposalDetails")
      .input("IDDID", sql.NVarChar(50), String(form.get("IDDID") ?? ""))
      .input("UID", sql.NVarChar(50), String(form.get("UID") ?? ""))
      .input("SenderAuthNo", sql.NVarChar(100), String(form.get("SenderAuthNo") ?? ""))
      .input("TransporterName", sql.NVarChar(200), String(form.get("TransporterName") ?? ""))
      .input("TransporterAddress", sql.NVarChar(300), String(form.get("TransporterAddress") ?? ""))
      .input("TransporterPhone", sql.NVarChar(50), String(form.get("TransporterPhone") ?? ""))
      .input("TransporterEmail", sql.NVarChar(100), String(form.get("TransporterEmail") ?? ""))
      .input("VTID", sql.NVarChar(50), String(form.get("VTID") ?? ""))
      .input("TransporterRegNo", sql.NVarChar(100), String(form.get("TransporterRegNo") ?? ""))
      .input("VehicleRegNo", sql.NVarChar(100), String(form.get("VehicleRegNo") ?? ""))
      .input("ReceiverName", sql.NVarChar(200), String(form.get("ReceiverName") ?? ""))
      .input("ReceiverAddress", sql.NVarChar(300), String(form.get("ReceiverAddress") ?? ""))
      .input("ReceiverAuthNo", sql.NVarChar(100), String(form.get("ReceiverAuthNo") ?? ""))
      .input("TotalQty", sql.Decimal(18, 3), Number(form.get("TotalQty") ?? 0))
      .input("NoOfContainers", sql.Int, Number(form.get("NoOfContainers") ?? 0))

      .input("PSID", sql.NVarChar(50), String(form.get("PSID") ?? ""))
      .input("SpecialHandlingInstructions", sql.NVarChar(300), String(form.get("SpecialHandlingInstructions") ?? ""))
      .input("EmpCode", sql.NVarChar(50), empCode)
      .input("DateOfDisposal", sql.Date, String(form.get("DateOfDisposal") ?? ""))
      .execute("PRO-WMS_SET");
      console.log(result);

    return NextResponse.json({
      success: true,
      data: result.recordset ?? [],
    });
  } catch (error: any) {
    
    console.error("SetFinalDisposalDetails error:", error);

    return NextResponse.json(
      { success: false, message: error, error: error.message },
      { status: 500 }
    );
  }
}
