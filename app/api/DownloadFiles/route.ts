import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export const runtime = "nodejs"

export async function GET(req: NextRequest) {

    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json("Invalid Request")
    }

    var EmpCode = "", EmpName = ""
    if (session) {
        EmpCode = session?.user?.id || "";
        EmpName = session?.user?.username || "";
    }


    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
        return new Response("Missing file", { status: 400 })
    }

    const baseDir = path.join(process.cwd(), "Attachments")

    if (id.includes("..")) {
        return new Response("Invalid file", { status: 400 })
    }

    const filePath = path.join(baseDir, id)

    if (!fs.existsSync(filePath)) {
        return new Response("Not found", { status: 404 })
    }

    const fileBuffer = fs.readFileSync(filePath)

    return new Response(fileBuffer, {
        headers: {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": `attachment; filename="${path.basename(filePath)}"`,
        },
    })
}