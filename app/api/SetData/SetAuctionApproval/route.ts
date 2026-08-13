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

    const EmpCode = session.user.id

    const pool = await getConnection();
    if (!pool || !pool.connected) {
        throw new Error("Couldn't connect to Database");
    }

    const body = await req.json()
    const APID = body.APID
    const APLID = body.APLID
    const Remarks = body.Remarks
    const Acceptance = body.Acceptance
    const ApprovalLevel = body.ApprovalLevel

    var StsCode = Acceptance == 1 ? 3 : 5
    if (ApprovalLevel == 2 && Acceptance == 1) {
        StsCode = 10
    }
    else if (ApprovalLevel == 3) {
        if (Acceptance == 1) {
            StsCode = 12
        }
        else StsCode = 13
    }

    // console.log(body, EmpCode)

    const result = await pool.request()
        .input("FLAG", "SetAuctionApproval")
        .input("APID", APID)
        .input("APLID", APLID)
        .input("ApprovalLevel", ApprovalLevel)
        .input("Status", Acceptance == 1 ? 1 : 0)
        .input("Remarks", Remarks)
        .input("StsCode", StsCode)
        .input("EmpCode", EmpCode)
        .execute("PRO-WMS_SET");

    // console.log(result.recordset[0])
    return NextResponse.json(result.recordset[0])
}