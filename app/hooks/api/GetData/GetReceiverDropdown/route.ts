import { getConnection } from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    const pool = await getConnection();
    if (!pool || !pool.connected) {
      throw new Error("Couldn't connect to Database");
    }

    const result = await pool.request().input("FLAG", "DROP-RCVR").execute("PRO-WMS_GET");

    return NextResponse.json(result.recordset);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Server error" },
      { status: 500 },
    );
  }
}
