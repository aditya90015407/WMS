import { getConnection } from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { signOut } from "next-auth/react";

export async function POST(req: Request) {

    try {

        const session = await getServerSession(authOptions);

        if (!session) {
            await signOut({ callbackUrl: '/', redirect: true })
            return NextResponse.json("Invalid Request")
        }

        var EmpCode = "", EmpName = "", RoleID = ""
        if (session) {
            EmpCode = session?.user?.id || "";
            EmpName = session?.user?.username || "";
            RoleID = session?.user?.roleId || "";
        }


        const pool = await getConnection();

        if (!pool || !pool.connected) {
            throw new Error("Couldn't connect to Database");
        }


        const result = await pool
            .request()
            .input("FLAG", sql.NVarChar, "GetAuctionsListForSelectingVendor")
            .input("EmpCode", EmpCode)
            .execute("PRO-WMS_GET");


        // console.log(result.recordset, EmpCode);

        return NextResponse.json(
            result.recordset ?? []
        );


    }

    catch (err: any) {

        return NextResponse.json(
            { success: false, message: err?.message || "Server Error" },
            { status: 500 }
        );

    }


}