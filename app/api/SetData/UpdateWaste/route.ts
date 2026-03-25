import { getConnection } from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";


export async function POST(req: NextRequest) {

    const session = await getServerSession(authOptions)

    if (!session) return NextResponse.json("Invalid Session");

    const CrBy = session.user.id

    const pool = await getConnection();
    if (!pool || !pool.connected) {
        throw new Error("Couldn't connect to Database");
    }

    const body = await req.json()
    const WRID = body.WRID
    const WCID = body.WCID
    const WID = body.WID
    // const WTID = body.WTID
    const PSID = body.PSID
    const DID = body.DID
    const SMID = body.SMID
    const AID = body.AID
    const WasteQty = body.WasteQty
    const TargetDate = body.TargetDate

    console.log(body, CrBy)

    const result = await pool.request()
        .input("FLAG", "GWT-UPD")
        .input("WRID", WRID)
        .input("WCID", WCID)
        .input("WID", WID)
        .input("WTID", 1)
        .input("PSID", PSID)
        .input("DID", DID)
        .input("SMID", SMID)
        .input("AID", AID)
        .input("WasteQty", WasteQty)
        .input("TargetDate", TargetDate)
        .input("CrBy", CrBy)
        .execute("PRO-WMS_SET");

    // console.log(result.recordset[0])
    return NextResponse.json(result.recordset[0])
}