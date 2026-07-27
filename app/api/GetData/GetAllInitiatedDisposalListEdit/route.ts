import { getConnection } from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json("Invalid Request")
    }

    const EmpCode = await session?.user?.id

    try {
        const pool = await getConnection();
        if (!pool || !pool.connected) {
            throw new Error("DB NOT CONNECTED");
        }

        const result = await pool.request()
            .input("FLAG", sql.VarChar, "GetAllInitiatedDisposalListEdit")
            .input("EmpCode", EmpCode)
            .execute("PRO-WMS_GET");
        // console.log(result)

        return NextResponse.json({
            success: true,
            data: result.recordset ?? [],
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, message: err?.message || "Server Error" },
            { status: 500 }
        )
    }

}