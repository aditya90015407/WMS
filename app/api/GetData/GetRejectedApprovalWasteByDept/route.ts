import { getConnection } from "@/lib/dbConnect";
import NextAuth, { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";


export async function POST(req: NextRequest) {

    const pool = await getConnection();
    if (!pool || !pool.connected) {
        throw new Error("Couldn't connect to Database");
    }

    const session = await getServerSession(authOptions)
    const UID = session?.user.uid
    const DeptID = session?.user.deptId
    // console.log(UID)

    const result = await pool.request()
        .input("FLAG", "GetRejectedApprovalWasteByDept")
        .input("UID", UID)
        .input("DeptID", DeptID)
        .execute("PRO-WMS_GET");

    // console.log(result)
    return NextResponse.json(result.recordset)
}