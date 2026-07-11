import { getConnection } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import sql from "mssql";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const empCode = String(body?.EmpCode ?? body?.empCode ?? "").trim();

    if (!empCode) {
      return NextResponse.json(
        { success: false, message: "EmpCode is required" },
        { status: 400 },
      );
    }

    const pool = await getConnection();
    if (!pool || !pool.connected) {
      throw new Error("DB Not Connected");
    }

    const result = await pool
      .request()
      .input("FLAG", sql.VarChar, "Menu")
      .input("EmpCode", sql.VarChar, empCode)
      .execute("PRO-WMS_GET");
    // console.log(result.recordset)
    return NextResponse.json({ success: true, data: result.recordset ?? [] });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Server error" },
      { status: 500 },
    );
  }
}
