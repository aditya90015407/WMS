import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { encrypt } from "@/lib/encryptVendorCode"
import { getConnection } from "@/lib/dbConnect";
import { encryptForLogin } from "@/lib/login-crypto-client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {

    const session = await getServerSession(authOptions)

    if (!session) return NextResponse.json("Invalid Session");

    const EmpCode = session.user.id

    const pool = await getConnection();
    if (!pool || !pool.connected) {
        throw new Error("Couldn't connect to Database");
    }

    const body = await req.json()
    const VID = body.VID
    const Status = body.Status
    const VendorCode = body.VendorCode



    console.log(body, EmpCode)

    const result = await pool.request()
        .input("FLAG", "UpdateVendor")
        .input("VID", VID)
        .input("Status", Status)
        .input("VendorCode", VendorCode)
        .input("EmpCode", EmpCode)
        .execute("PRO-WMS_SET");

    // console.log(result)
    return NextResponse.json(result.recordset[0])
}