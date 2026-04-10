import { NextResponse } from "next/server";
import * as sql from "mssql";
import { getConnection } from "@/lib/dbConnect";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const fddid = String(body?.FDDID ?? "").trim();

        if (!fddid) {
            return NextResponse.json(
                { success: false, message: "Missing required field: FDDID" },
                { status: 400 },
            );
        }

        const pool = await getConnection();
        if (!pool || !pool.connected) {
            throw new Error("DB NOT CONNECTED");
        }

        const result = await pool
            .request()
            .input("FLAG", sql.NVarChar(50), "GetDisposalApprovalStatus")
            .input("FDDID", sql.NVarChar(50), fddid)
            .execute("PRO-WMS_GET");

        const row = Array.isArray(result.recordset) ? result.recordset[0] : null;

        return NextResponse.json({ success: true, data: row ?? {} });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, message: err.message || "Internal Server Error" },
            { status: 500 },
        );
    }
}
