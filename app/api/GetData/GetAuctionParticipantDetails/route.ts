import { getConnection } from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {

    const pool = await getConnection();
    if (!pool || !pool.connected) {
        throw new Error("Couldn't connect to Database");
    }

    const body = await req.json()
    const ID = body.ID

    const Headerresult = await pool.request().input("FLAG", "GetAuctionParticipantHeaderDetails").input("ID", ID).execute("PRO-WMS_GET");
    const Lineresult = await pool.request().input("FLAG", "GetAuctionParticipantLineDetails").input("ID", ID).execute("PRO-WMS_GET");

    // console.log(result)
    return NextResponse.json({ "HeaderDetails": Headerresult.recordset, "LineDetails": Lineresult.recordset })
}