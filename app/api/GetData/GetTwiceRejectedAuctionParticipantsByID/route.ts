import { getConnection } from "@/lib/dbConnect";
import error from "next/error";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    try {
        const pool = await getConnection();
        if (!pool || !pool.connected) {
            throw new Error("Couldn't connect to Database");
        }


        const body = await req.json()
        const ID = body.ID
        // console.log(body)

        const result = await pool.request().input("FLAG", "GetTwiceRejectedAuctionParticipantsByID")
            .input("ID", ID)
            .execute("PRO-WMS_GET");

        // console.log(result.recordset, "GetTwiceRejectedAuctionParticipantsByID")
        return NextResponse.json(result.recordset)
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err?.message || "Server error" },
            { status: 500 },);
    }
}