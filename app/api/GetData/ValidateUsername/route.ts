import { getConnection } from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import { signOut } from "next-auth/react";


export async function POST(req: NextRequest) {

    const pool = await getConnection();
    if (!pool || !pool.connected) {
        throw new Error("Couldn't connect to Database");
    }

    const body = await req.json()
    const Username = body.Username

    const result = await pool.request().input("FLAG", "ValidateUsername").input("EmpCode", Username).execute("PRO-WMS_GET");

    // console.log(result)
    return NextResponse.json(result.recordset[0])
}