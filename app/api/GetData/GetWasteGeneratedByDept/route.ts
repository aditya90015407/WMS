import { getConnection } from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";


export async function POST(req: NextRequest) {

    const pool = await getConnection();
    if (!pool || !pool.connected) {
        throw new Error("Couldn't connect to Database");
    }

    const Session = await getServerSession(authOptions)
    // console.log(Session, "session")
    const UID = Session?.user.uid
    const DeptID = Session?.user.deptId


    const result = await pool.request()
        .input("FLAG", "GetWasteGeneratedByDept")
        .input("DeptID", DeptID)
        .input("UID", UID)
        .execute("PRO-WMS_GET");

    // console.log(result)
    return NextResponse.json(result.recordset)
}