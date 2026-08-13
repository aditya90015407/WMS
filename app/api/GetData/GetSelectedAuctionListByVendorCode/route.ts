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

    const body = await req.json();
    const EmpCode = String(body?.EmpCode ?? body?.empCode ?? "").trim();

    if (!EmpCode) {
        return NextResponse.json(
            { success: false, message: "EmpCode is required" },
            { status: 400 },
        );
    }

    const pool = await getConnection();
    if (!pool || !pool.connected) {
        throw new Error("Couldn't connect to Database");
    }

    const result = await pool.request()
        .input("FLAG", "GetSelectedAuctionListByVendorCode")
        .input("EmpCode", EmpCode)
        .execute("PRO-WMS_GET");
    // console.log(result)

    return NextResponse.json(result.recordset);
}
