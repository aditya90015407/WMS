import { getConnection } from "@/lib/dbConnect";
import { NVarChar } from "mssql";
import { NextRequest, NextResponse } from "next/server";

export async function POST() {


    try {
        const pool = await getConnection();
        if (!pool || !pool.connected) {
            throw new Error("SQL pool is not connected")
        }

        const result = await pool
            .request()
            .input("FLAG", NVarChar, "GetAllVendors")
            .execute("PRO-WMS_GET");

        return NextResponse.json(result.recordset)


    } catch (err: any) {
        return NextResponse.json(
            { success: false, message: err?.message || "Server error" },
            { status: 500 });
    }
}