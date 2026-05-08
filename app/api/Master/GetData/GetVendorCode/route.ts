import { getConnection } from "@/lib/dbConnect";
import { NVarChar } from "mssql";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {


    try {
        const pool = await getConnection();
        if (!pool || !pool.connected) {
            throw new Error("SQL pool is not connected")
        }

        const result = await pool
            .request()
            .input("FLAG", NVarChar, "GetVendorCode")
            .execute("PRO-WMS_GET");


        const rows = (Array.isArray(result.recordset) && result.recordset) ||
            ((result as any).recordsets?.[0] ?? []);


        // console.log(rows)
        return NextResponse.json({ success: true, data: rows })


    } catch (err: any) {
        return NextResponse.json(
            { success: false, message: err?.message || "Server error" },
            { status: 500 });
    }


}