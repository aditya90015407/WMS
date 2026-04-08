import { getConnection } from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
    try{
    const pool = await getConnection();
    if (!pool || !pool.connected) {
        throw new Error("Couldn't connect to Database");
    }

    const result = await pool.request().input("FLAG", "GetAllDisposalList").execute("PRO-WMS_GET");

    // console.log(result)
    return NextResponse.json(result.recordset)
}catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Server error" },
      { status: 500 },
    );
  }
}