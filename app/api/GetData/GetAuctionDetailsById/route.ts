import { getConnection } from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
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
            .input("FLAG", "GetAuctionDetailsById")
            .input("ID", sql.VarChar, id1)
            .execute("PRO-WMS_GET");

        // console.log(result);
        const row = result.recordset?.[0]

        if (!row) {
            return NextResponse.json({ success: false, message: "No data found" });
        }
        return NextResponse.json({
            success: true,
            data: {
                AuctionDate: row.AuctionDate,
                WasteCategory: row.WasteCategory,
                Remarks: row.Remarks,
                CrDt: row.CrDt,
            },
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, message: err?.message || "Server error" },
            { status: 500 }
        );
    }
}