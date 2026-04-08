import { getConnection } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import sql from "mssql";

export async function POST(req: Request) {
  try {
    const pool = await getConnection();
    if (!pool || !pool.connected) throw new Error("Could not connect to Database");

    const { IDDID, VID, EmpCode } = await req.json();
    if (!IDDID || !VID || !EmpCode) {
      return NextResponse.json(
        { success: false, message: "IDDID, VID and EmpCode are required" },
        { status: 400 }
      );
    }

    await pool
      .request()
      .input("FLAG", sql.VarChar, "SetSelectedVendor")
      .input("IDDID", sql.VarChar, IDDID)
      .input("VID", sql.VarChar, VID)
      .input("EmpCode", sql.VarChar, EmpCode)
      .execute("PRO-WMS_SET");

    return NextResponse.json({ success: true, message: "Selected vendor saved" });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
