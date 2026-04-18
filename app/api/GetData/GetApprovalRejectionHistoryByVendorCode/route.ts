import { getConnection } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import sql from "mssql";

export async function POST(req: Request) {
  try {
    const pool = await getConnection();

    if (!pool || !pool.connected) {
      throw new Error("Could not connect to database");
    }

    const body = await req.json();
    const APID = String(body?.APID ?? "").trim();

    if (!APID) {
      return NextResponse.json(
        {
          success: false,
          message: "APID is required",
        },
        { status: 400 },
      );
    }

    const result = await pool
      .request()
      .input("FLAG", sql.VarChar, "GetApprovalRejectionHistoryByVendorCode")
      .input("ID", sql.VarChar, APID)
      .execute("PRO-WMS_GET");
     console.log(result)
    return NextResponse.json({
      success: true,
      data: result.recordset ?? [],
    });
  } catch (error: any) {
    console.error("GetApprovalRejectionHistoryByVendorCode error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch approval rejection history",
      },
      { status: 500 },
    );
  }
}
