import { getConnection } from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { signOut } from "next-auth/react";


export async function POST(req: NextRequest) {

    const session = await getServerSession(authOptions);

    if (!session) {
        await signOut({ callbackUrl: '/sign-in', redirect: true })
        return NextResponse.json("Invalid Request")
    }

    const pool = await getConnection();
    if (!pool || !pool.connected) {
        throw new Error("Couldn't connect to Database");
    }

    const result = await pool.request().input("FLAG", "DROP-SMETHOD").execute("PRO-WMS_GET");

    // console.log(result)
    return NextResponse.json(result.recordset)
}