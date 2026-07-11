import { getConnection } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import sql from "mssql";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const WCID = body?.WCID ?? body?.wcid ?? "";
    const WID = body?.WID ?? body?.wid ?? "";

    const pool = await getConnection();
    if (!pool || !pool.connected) {
      throw new Error("DB Not Connected");
    }

    const result = await pool
      .request()
      .input("FLAG", sql.VarChar, "GetAllUndisposedWaste")
      .input("WCID", sql.VarChar, String(WCID))
      .input("WID", sql.VarChar, String(WID))
      .execute("PRO-WMS_GET");

    const rows = result.recordset ?? [];
    // console.log(rows)
    const deptList = rows
      .map((r: any) => String(r.Dept ?? "").trim())
      .filter(Boolean);
    const totalWasteQty = rows.reduce(
      (sum: number, r: any) => sum + (Number(r.WasteQty) || 0),
      0,
    );
    //  console.log(totalWasteQty)
    return NextResponse.json({
      success: true,
      data: {
        Dept: Array.from(new Set(deptList)).join(", "),
        WasteQuantity: totalWasteQty,
        Rows: rows,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Server error" },
      { status: 500 },
    );
  }
}
