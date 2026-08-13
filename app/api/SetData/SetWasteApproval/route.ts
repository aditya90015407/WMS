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

    const CrBy = session.user.id

    const pool = await getConnection();
    if (!pool || !pool.connected) {
        throw new Error("Couldn't connect to Database");
    }

    const body = await req.json()
    const WRID = body.WRID
    const Remarks = body.Remarks
    const Acceptance = body.Acceptance

    const StsCode = Acceptance == 1 ? 3 : 5

    // console.log(body, CrBy)

    const result = await pool.request()
        .input("FLAG", "GWT-APRVL")
        .input("WRID", WRID)
        .input("Remarks", Remarks)
        .input("StsCode", StsCode)
        .input("CrBy", CrBy)
        .execute("PRO-WMS_SET");

    // console.log(result.recordset[0])
    return NextResponse.json(result.recordset[0])
}