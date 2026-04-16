import { getConnection } from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const EmpCode = String(body?.EmpCode ?? body?.empCode ?? "").trim();
    console.log(EmpCode)
    
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
        .input("FLAG", "GetRejectedAuctionListByVendorCode")
        .input("EmpCode", EmpCode)
        .execute("PRO-WMS_GET");
        console.log(result)

    return NextResponse.json(result.recordset);
}
