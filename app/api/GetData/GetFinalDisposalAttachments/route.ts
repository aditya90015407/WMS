import { NextResponse } from "next/server";
import * as sql from "mssql";
import { getConnection } from "@/lib/dbConnect";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const id = body.ID;

        if (!id) {
            return NextResponse.json(
                { success: false, message: "Missing required field: ID" },
                { status: 400 }
            );
        }

        const pool = await getConnection();
        if (!pool || !pool.connected) {
            throw new Error("SQL pool is not connected after getConnection()");
        }

        const result = await pool
            .request()
            .input("FLAG", "GetFinalDisposalAttachments")
            .input("ID", id)
            .execute("PRO-WMS_GET");

        const rows = Array.isArray(result.recordset) ? result.recordset : [];
        // console.log(result, id)
        return NextResponse.json(rows);
    } catch (error: any) {

        return NextResponse.json(
            {
                success: false,
                message: "GetForm10Details API failed",
                error: error?.message ?? String(error),
            },
            { status: 500 }
        );
    }
}
