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

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, message: "ID missing" }, { status: 400 });
    }

    const id1 = await decrypt(id);

    const result = await pool
      .request()
      .input("FLAG", sql.VarChar, "GetWasteDetailsByAuctionId")
      .input("ID", sql.VarChar, id1)
      .execute("PRO-WMS_GET");

    const rows = result.recordset ?? [];

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "No data found" });
    }

    return NextResponse.json({
      success: true,
      data: rows.map((r: any) => ({
        WasteType: r.Waste, 
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
