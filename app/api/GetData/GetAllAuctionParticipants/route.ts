import { getConnection } from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {

    const pool = await getConnection();
    if (!pool || !pool.connected) {
        throw new Error("Couldn't connect to Database");
    }


    const body = await req.json()
    const ID = body.ID
    // console.log(body)

    const result = await pool.request().input("FLAG", "GetAllAuctionParticipantsByID")
        .input("ID", ID)
        .execute("PRO-WMS_GET");

    // console.log(result.recordset)
    return NextResponse.json(result.recordset)
}