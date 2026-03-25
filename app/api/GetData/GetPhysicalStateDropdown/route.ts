import { getConnection } from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {

    const pool = await getConnection();
    if (!pool || !pool.connected) {
        throw new Error("Couldn't connect to Database");
    }

    const result = await pool.request().input("FLAG", "DROP-PHSTATE").execute("PRO-WMS_GET");

    // console.log(result)
    return NextResponse.json(result.recordset)
}