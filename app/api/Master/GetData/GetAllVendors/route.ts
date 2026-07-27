import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getConnection } from "@/lib/dbConnect";
import { NVarChar } from "mssql";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST() {

    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json("Invalid Request")
    }

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