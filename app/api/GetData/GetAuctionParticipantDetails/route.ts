import { getConnection } from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import { signOut } from "next-auth/react";


export async function POST(req: NextRequest) {

    const session = await getServerSession(authOptions);

    if (!session) {
        await signOut({ callbackUrl: '/sign-in', redirect: true })
        return NextResponse.json("Invalid Request")
    }

    var EmpCode = "", EmpName = ""
    if (session) {
        EmpCode = session?.user?.id || "";
        EmpName = session?.user?.username || "";
    }

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