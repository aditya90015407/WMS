import { getConnection } from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {

    const pool = await getConnection();
    if (!pool || !pool.connected) {
        throw new Error("Couldn't connect to Database");
    }

    const body = await req.json()

    const WID = body.WID
    const WCID = body.WCID
    const UID = body.UID

    const result = await pool.request()
        .input("FLAG", "DROP-DISPO")
        .input("WCID", WCID)
        .input("WID", WID)
        .input("UID", UID)
        .execute("PRO-WMS_GET");

    // console.log(result)
    return NextResponse.json(result.recordset)
}