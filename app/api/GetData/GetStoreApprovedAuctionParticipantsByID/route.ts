import { getConnection } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import sql from "mssql";
import decrypt from "@/components/Decrypt";

export async function POST(req: Request) {
  try {
    const pool = await getConnection();
    if (!pool || !pool.connected) {
      throw new Error("Could not connect to Database");
    }

    const { ID } = await req.json();
    if (!ID) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      );
    }


    const realId = await decrypt(ID);

    const result = await pool
      .request()
      .input("FLAG", sql.VarChar, "GetStoreApprovedAuctionParticipantsByID")
      .input("ID", sql.VarChar, realId)
      .execute("PRO-WMS_GET");

    return NextResponse.json({
      success: true,
      data: result.recordset ?? [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
