import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { encrypt } from "@/lib/encryptVendorCode"
import { getConnection } from "@/lib/dbConnect";
import { encryptForLogin } from "@/lib/login-crypto-client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {

    const session = await getServerSession(authOptions)

    if (!session) return NextResponse.json("Invalid Session");

    const CrBy = session.user.id

    const pool = await getConnection();
    if (!pool || !pool.connected) {
        throw new Error("Couldn't connect to Database");
    }

    const body = await req.json()
    const VendorName = body.VendorName
    const VendorEmail = body.VendorEmail
    const VendorCode = body.VendorCode

    const Password = await encrypt(VendorEmail)


    // console.log(body, CrBy)

    const result = await pool.request()
        .input("FLAG", "AddVendor")
        .input("Name", VendorName)
        .input("Email", VendorEmail)
        .input("VendorCode", VendorCode)
        .input("EmpCode", CrBy)
        .input("Pwd", Password)
        .execute("PRO-WMS_SET");

    // console.log(result.recordset[0])
    return NextResponse.json(result.recordset[0])
}