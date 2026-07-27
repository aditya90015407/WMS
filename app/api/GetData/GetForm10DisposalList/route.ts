import { NextResponse } from "next/server";
import * as sql from "mssql";
import { getConnection } from "@/lib/dbConnect";
import { authOptions } from "../../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

export async function GET() {
    try {

        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json("Invalid Request")
        }

        var EmpCode = "", EmpName = ""
        if (session) {
            EmpCode = session?.user?.id || "";
            EmpName = session?.user?.username || "";
        }

        const pool = await getConnection();

        if (!pool || !pool.connected) {
            throw new Error("Couldn't connect to database");
        }

        const result = await pool
            .request()
            .input("FLAG", sql.NVarChar(50), "GetForm10DisposalList")
            .execute("PRO-WMS_GET");
        // console.log(result)
        return NextResponse.json({
            success: true,
            data: result.recordset ?? [],
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: error?.message || "Failed to load Form 10 disposal list",
            },
            { status: 500 },
        );
    }
}
