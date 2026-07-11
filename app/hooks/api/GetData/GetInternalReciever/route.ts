import { getConnection } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import sql from "mssql";

export async function GET(req: Request) {


  try {
    const pool = await getConnection();
    if (!pool || !pool.connected) {
      throw new Error("DB Not Connected");
    }

    const result = await pool
      .request()
      .input("FLAG", sql.VarChar, "GetInternalReceiver")

      .execute("PRO-WMS_GET");
    // console.log(result);
    return NextResponse.json({ success: true, data: result.recordset ?? [] },
      { status: 200 },)
  }

  catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Server error" },
      { status: 500 },
    );
  }
}
