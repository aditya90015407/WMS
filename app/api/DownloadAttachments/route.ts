import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/options"
import { signOut } from "next-auth/react"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            await signOut({ callbackUrl: '/sign-in', redirect: true })
            return NextResponse.json("Invalid Request")
        }

        var EmpCode = "", EmpName = ""
        if (session) {
            EmpCode = session?.user?.id || "";
            EmpName = session?.user?.username || "";
        }


        const body = await req.json()
        const filePath = body.AttachPath

        // console.log(body, "nbo")
        if (filePath == "") return NextResponse.json({ error: "Invalid file path " }, { status: 400 })

        const fullPath = path.join(process.cwd(), "Attachments", filePath)

        if (!fs.existsSync(fullPath)) {
            return NextResponse.json({ error: "File not found" }, { status: 404 })
        }

        const fileStream = fs.createReadStream(fullPath)

        return new NextResponse(fileStream as any, {
            headers: {
                "Content-Type": "application/octet-stream",
                "Content-Disposition": `attachment; filename="${path.basename(fullPath)}"`,
            },
        })

    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Download failed" },
            { status: 400 }
        )
    }
}